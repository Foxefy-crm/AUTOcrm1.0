const express = require('express');
const pool = require('../db');
const { requireAuth } = require('../middleware/auth');
const upload = require('../upload');

const router = express.Router();

const VALID_SOURCES = ['walk-in', 'digital', 'referral', 'telecalling'];
const SORTABLE_COLUMNS = ['id', 'customer_name', 'phone', 'source', 'model_interest', 'stage', 'created_at'];

async function loadAccessibleLead(req, res, next) {
  const result = await pool.query('SELECT * FROM leads WHERE id = $1', [req.params.id]);
  const lead = result.rows[0];
  if (!lead) {
    return res.status(404).json({ error: 'Lead not found' });
  }
  if (req.user.role === 'sales_consultant' && lead.assigned_to !== req.user.id) {
    return res.status(403).json({ error: 'Not authorized to access this lead' });
  }
  req.lead = lead;
  next();
}

router.get('/', requireAuth, async (req, res) => {
  const { _start = 0, _end = 10, _sort = 'id', _order = 'ASC' } = req.query;
  const start = parseInt(_start, 10) || 0;
  const end = parseInt(_end, 10) || 10;
  const limit = Math.max(end - start, 1);
  const sortColumn = SORTABLE_COLUMNS.includes(_sort) ? _sort : 'id';
  const sortOrder = String(_order).toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

  const isConsultant = req.user.role === 'sales_consultant';
  const whereClause = isConsultant ? 'WHERE assigned_to = $1' : '';
  const filterParams = isConsultant ? [req.user.id] : [];

  const countResult = await pool.query(`SELECT COUNT(*) FROM leads ${whereClause}`, filterParams);
  const total = parseInt(countResult.rows[0].count, 10);

  const dataResult = await pool.query(
    `SELECT * FROM leads ${whereClause}
     ORDER BY ${sortColumn} ${sortOrder}
     LIMIT $${filterParams.length + 1} OFFSET $${filterParams.length + 2}`,
    [...filterParams, limit, start]
  );

  res.setHeader('X-Total-Count', total);
  res.json(dataResult.rows);
});

router.post('/', requireAuth, async (req, res) => {
  const { customer_name, phone, source, model_interest } = req.body;
  if (!customer_name || !phone || !source) {
    return res.status(400).json({ error: 'customer_name, phone, and source are required' });
  }
  if (!VALID_SOURCES.includes(source)) {
    return res.status(400).json({ error: `source must be one of: ${VALID_SOURCES.join(', ')}` });
  }

  const assigneeResult = await pool.query(
    `SELECT u.id
     FROM users u
     LEFT JOIN leads l ON l.assigned_to = u.id
     WHERE u.role = 'sales_consultant'
     GROUP BY u.id
     ORDER BY COUNT(l.id) ASC, u.id ASC
     LIMIT 1`
  );
  const assignedTo = assigneeResult.rows[0]?.id ?? null;

  const result = await pool.query(
    `INSERT INTO leads (customer_name, phone, source, model_interest, assigned_to, outlet_id)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [customer_name, phone, source, model_interest || null, assignedTo, req.user.outlet_id]
  );
  res.status(201).json(result.rows[0]);
});

router.get('/:id', requireAuth, loadAccessibleLead, async (req, res) => {
  res.json(req.lead);
});

router.get('/:id/enquiry', requireAuth, loadAccessibleLead, async (req, res) => {
  const result = await pool.query('SELECT * FROM enquiries WHERE lead_id = $1', [req.params.id]);
  res.json(result.rows[0] || null);
});

router.put('/:id/enquiry', requireAuth, loadAccessibleLead, async (req, res) => {
  const { variant, fuel_type, budget_min, budget_max, has_exchange, notes } = req.body;

  const result = await pool.query(
    `INSERT INTO enquiries (lead_id, variant, fuel_type, budget_min, budget_max, has_exchange, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (lead_id) DO UPDATE SET
       variant = EXCLUDED.variant,
       fuel_type = EXCLUDED.fuel_type,
       budget_min = EXCLUDED.budget_min,
       budget_max = EXCLUDED.budget_max,
       has_exchange = EXCLUDED.has_exchange,
       notes = EXCLUDED.notes
     RETURNING *`,
    [req.params.id, variant || null, fuel_type || null, budget_min || null, budget_max || null, !!has_exchange, notes || null]
  );

  await pool.query("UPDATE leads SET stage = 'enquiry_done' WHERE id = $1", [req.params.id]);

  res.json(result.rows[0]);
});

router.get('/:id/test-drive', requireAuth, loadAccessibleLead, async (req, res) => {
  const result = await pool.query('SELECT * FROM test_drives WHERE lead_id = $1', [req.params.id]);
  res.json(result.rows[0] || null);
});

router.put('/:id/test-drive', requireAuth, loadAccessibleLead, upload.single('dl_photo'), async (req, res) => {
  const { vehicle_reg_no, scheduled_at, consent_given, completed } = req.body;
  const dlPhotoUrl = req.file ? `/uploads/${req.file.filename}` : req.body.existing_dl_photo_url || null;

  const result = await pool.query(
    `INSERT INTO test_drives (lead_id, vehicle_reg_no, scheduled_at, dl_photo_url, dl_uploaded, consent_given, completed)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (lead_id) DO UPDATE SET
       vehicle_reg_no = EXCLUDED.vehicle_reg_no,
       scheduled_at = EXCLUDED.scheduled_at,
       dl_photo_url = EXCLUDED.dl_photo_url,
       dl_uploaded = EXCLUDED.dl_uploaded,
       consent_given = EXCLUDED.consent_given,
       completed = EXCLUDED.completed
     RETURNING *`,
    [
      req.params.id,
      vehicle_reg_no || null,
      scheduled_at || null,
      dlPhotoUrl,
      !!dlPhotoUrl,
      consent_given === 'true' || consent_given === true,
      completed === 'true' || completed === true,
    ]
  );

  await pool.query("UPDATE leads SET stage = 'demo_scheduled' WHERE id = $1", [req.params.id]);

  res.json(result.rows[0]);
});

router.get('/:id/quotation', requireAuth, loadAccessibleLead, async (req, res) => {
  const result = await pool.query('SELECT * FROM quotations WHERE lead_id = $1', [req.params.id]);
  res.json(result.rows[0] || null);
});

router.put('/:id/quotation', requireAuth, loadAccessibleLead, async (req, res) => {
  const {
    ex_showroom_price = 0,
    road_tax = 0,
    insurance = 0,
    rto_charges = 0,
    accessories = 0,
    exchange_bonus = 0,
  } = req.body;

  const onRoadPrice =
    Number(ex_showroom_price) + Number(road_tax) + Number(insurance) + Number(rto_charges) + Number(accessories) - Number(exchange_bonus);

  const result = await pool.query(
    `INSERT INTO quotations (lead_id, ex_showroom_price, road_tax, insurance, rto_charges, accessories, exchange_bonus, on_road_price)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     ON CONFLICT (lead_id) DO UPDATE SET
       ex_showroom_price = EXCLUDED.ex_showroom_price,
       road_tax = EXCLUDED.road_tax,
       insurance = EXCLUDED.insurance,
       rto_charges = EXCLUDED.rto_charges,
       accessories = EXCLUDED.accessories,
       exchange_bonus = EXCLUDED.exchange_bonus,
       on_road_price = EXCLUDED.on_road_price
     RETURNING *`,
    [req.params.id, ex_showroom_price, road_tax, insurance, rto_charges, accessories, exchange_bonus, onRoadPrice]
  );

  await pool.query("UPDATE leads SET stage = 'quoted' WHERE id = $1", [req.params.id]);

  res.json(result.rows[0]);
});

module.exports = router;
