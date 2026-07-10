CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'sales_consultant',
  outlet_id INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS leads (
  id SERIAL PRIMARY KEY,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  source TEXT NOT NULL,
  model_interest TEXT,
  assigned_to INTEGER REFERENCES users(id),
  outlet_id INTEGER,
  stage TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS enquiries (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER UNIQUE REFERENCES leads(id),
  variant TEXT,
  fuel_type TEXT,
  budget_min INTEGER,
  budget_max INTEGER,
  has_exchange BOOLEAN DEFAULT false,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS test_drives (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER UNIQUE REFERENCES leads(id),
  vehicle_reg_no TEXT,
  scheduled_at TIMESTAMP,
  dl_photo_url TEXT,
  dl_uploaded BOOLEAN DEFAULT false,
  consent_given BOOLEAN DEFAULT false,
  completed BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS quotations (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER UNIQUE REFERENCES leads(id),
  ex_showroom_price INTEGER,
  road_tax INTEGER,
  insurance INTEGER,
  rto_charges INTEGER,
  accessories INTEGER DEFAULT 0,
  exchange_bonus INTEGER DEFAULT 0,
  on_road_price INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS finance_applications (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER UNIQUE REFERENCES leads(id),
  lender_name TEXT,
  loan_amount INTEGER,
  status TEXT DEFAULT 'pending',
  insurer_name TEXT,
  policy_number TEXT
);

CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER UNIQUE REFERENCES leads(id),
  token_amount INTEGER,
  kyc_doc_url TEXT,
  aadhaar_verified BOOLEAN DEFAULT false,
  booked_at TIMESTAMP DEFAULT NOW()
);
