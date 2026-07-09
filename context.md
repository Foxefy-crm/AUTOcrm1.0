# AutoCRM — Project Context

An automotive dealership CRM built phase-by-phase per `CRM_Step_by_Step_Beginner_Guide.md` (7-phase roadmap, Phases 0-6). This file exists so a new session (or a future you) can pick up without re-deriving everything below.

## Stack

- **Backend**: `server/` — Node/Express, plain `pg` (no ORM), JWT auth (`jsonwebtoken` + `bcrypt`), file uploads via `multer`.
- **Database**: Postgres 16 in Docker (`docker-compose.yml`), schema lives in `server/db/init.sql`.
- **Frontend**: `client/` — React 19 + Vite, using the **Refine** framework (`@refinedev/core` ^5, `@refinedev/antd` ^6, `@refinedev/react-router` ^2, `@refinedev/simple-rest` ^6) with **Ant Design** as the UI kit. Note the core/antd major-version mismatch (5 vs 6) — that's intentional, it's what's currently on npm and it works; don't "fix" it by pinning matching majors without checking.

## Why this stack, not the guide's exact one

The guide's Phase 0 says plain React + Node/Express/JWT — the backend matches that literally. The frontend was later rewritten from plain React/react-router-dom to Refine+antd at the user's request (mid-project pivot, not part of the original guide).

There is **also** a separate, older, unrelated project at `C:\Users\Ajay\autocrm` (FastAPI/Python + SQLAlchemy + plain React/Vite) that implements the same guide independently. It may still have Docker containers running. **This project (`autocrmexpress`) uses different ports specifically to avoid clashing with it:**

| Service | autocrmexpress | autocrm (other project) |
|---|---|---|
| Postgres | `5433` | `5432` |
| API | `8001` | `8000` |
| Client (Vite) | `5174` | `5173` |

Don't assume the "usual" ports 5432/8000/5173 are free or correct for this project.

## Running it

```bash
docker compose up -d                 # Postgres on 5433
cd server && npm run dev             # nodemon, http://localhost:8001
cd client && npm run dev             # http://localhost:5174
```

`server/.env` holds `DATABASE_URL`, `JWT_SECRET`, `PORT` (gitignored — recreate if missing, see `docker-compose.yml`/`server/db.js` for the values currently in use).

Git note: git in this environment is scoped to the whole home directory (`C:\Users\Ajay`), not this project alone. Be careful with any git operations here.

## Auth

JWT-based, not session/cookie-based. Token stored in `localStorage['token']`, sent as `Authorization: Bearer <token>`.

- `POST /auth/signup`, `POST /auth/login`, `GET /auth/me` — see `server/routes/auth.js`.
- `server/middleware/auth.js` exports `requireAuth`, which loads `req.user` (`id, name, email, role, outlet_id`) from the token. All protected routes use it.
- Frontend: `client/src/authProvider.js` implements Refine's `authProvider` interface, hitting the endpoints above directly with `fetch`.
- **Important gotcha already hit once**: Refine's `dataProvider` (simple-rest) does NOT automatically use `authProvider`'s token. `client/src/dataProvider.js` manually attaches the bearer token via an axios interceptor on the `axiosInstance` exported by `@refinedev/simple-rest`. If a new top-level resource stops working with 401s that redirect to `/login`, check this first.

## RBAC

Extremely simple by design (per the guide, not meant to be built out further until Phase 6): `users.role` is either `'sales_consultant'` or `'sales_manager'` (text column, no enum/table). Consultants only see/edit leads where `assigned_to = their id`; managers see everything. Enforced with plain `if` checks in route handlers (`server/routes/leads.js`: list filtering, `loadAccessibleLead` middleware for per-lead nested routes). No UI exists yet to change a user's role — currently only doable via direct SQL (`UPDATE users SET role='sales_manager' WHERE email=...`).

## Database schema (as of Phase 2)

- `users(id, name, email, password_hash, role, outlet_id, created_at)`
- `leads(id, customer_name, phone, source, model_interest, assigned_to → users, outlet_id, stage, created_at)` — `stage` is the pipeline heart: `new → enquiry_done → demo_scheduled → quoted → ...` (later phases add more).
- `enquiries(id, lead_id UNIQUE → leads, variant, fuel_type, budget_min, budget_max, has_exchange, notes)`
- `test_drives(id, lead_id UNIQUE → leads, vehicle_reg_no, scheduled_at, dl_photo_url, dl_uploaded, consent_given, completed)`
- `quotations(id, lead_id UNIQUE → leads, ex_showroom_price, road_tax, insurance, rto_charges, accessories, exchange_bonus, on_road_price, created_at)`

`enquiries`/`test_drives`/`quotations` are all `UNIQUE` on `lead_id` — one row per lead, upserted via `INSERT ... ON CONFLICT (lead_id) DO UPDATE`, not a growing history. That's intentional for now (matches the guide's "fill it once, move the stage forward" model).

## Established pattern for pipeline stages (Phase 2+)

Each pipeline sub-resource (enquiry, test drive, quotation, and presumably finance/booking/PDI/delivery/follow-up/service in later phases) follows the same shape:

1. Backend: `GET /leads/:id/<thing>` (fetch existing or null) + `PUT /leads/:id/<thing>` (upsert, then `UPDATE leads SET stage = '<next-stage>'`). Both behind `requireAuth` + `loadAccessibleLead`.
2. These are **not** registered as Refine "resources" — they're 1:1 nested sub-objects of a lead, not independent CRUD collections, so the Lead Detail page (`client/src/pages/LeadShow.jsx`) talks to them directly via the shared `axiosInstance` from `dataProvider.js` (plain GET/PUT), not via `useTable`/`useForm`. Top-level collections (`leads` itself) do use Refine's resource/`useTable`/`useForm` machinery.
3. Frontend: one `Card` per stage, its own `Form.useForm()` instance, fetches on mount, upserts on submit, calls a parent `onSaved` callback so the lead's stage badge (fetched via `useOne`) refetches and stays in sync.

File uploads (DL photo in test drive) go through `multer` to `server/uploads/` (gitignored except `.gitkeep`), served statically at `/uploads/<filename>`. Same pattern will apply to KYC docs in Phase 3.

## Non-obvious library gotchas hit so far

- `@refinedev/antd@6.x` exports `ThemedLayout`, **not** `ThemedLayoutV2` (that name is from older Refine docs/tutorials still floating around).
- `@refinedev/core`'s `useOne` in the installed version returns `{ query, result }`, **not** `{ data, isLoading }` — `result` is already the unwrapped record, and loading/error state is on `query` (a react-query `QueryObserverResult`). Don't trust older Refine tutorials' hook signatures without checking `node_modules/@refinedev/core/dist/hooks/**/*.d.ts` first.
- React 19 + antd 5 needs `@ant-design/v5-patch-for-react-19` imported once in `main.jsx`.

## Progress vs. the guide's roadmap

- ✅ **Phase 0** — signup/login/JWT/dashboard.
- ✅ **Phase 1** — `leads` table, capture form, list, round-robin assignment (fewest-leads-among-`sales_consultant`s), role-based list filtering.
- ✅ **Phase 2** — Lead Detail page; Enquiry → Test Drive (+ DL photo upload) → Quotation (+ on-road price calc), each advancing `leads.stage`.
- ⬜ **Phase 3** — Finance & Booking (`finance_applications`, `bookings` + KYC doc upload). Same nested-resource pattern as Phase 2 should apply directly.
- ⬜ Phases 4-6 — not started.

## Testing approach used so far

No automated test suite exists yet (not requested). Each phase has been verified manually via a throwaway Playwright script (Node + `playwright` package, installed ad hoc in the scratchpad directory, not part of this repo) driving the real dev servers headlessly, then screenshotted. Test fixtures (throwaway users/leads created during verification) are cleaned up afterward via direct SQL, taking care never to touch the real accounts that exist in the DB (currently `Ajay`/`demoacc` and `Hasan`/`demohasan` — these are the actual user's own manual testing accounts, not fixtures, and must not be deleted).
