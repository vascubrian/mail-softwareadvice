# Mail Software Advice — Lead Generation & Email Outreach

A standalone lead-management and outreach application. Phase 1 provides login-only authentication, a responsive dashboard, manual lead management, server-side filtering/pagination, CSV/XLSX column mapping, validation, duplicate detection, preview, confirmed import, and import history. Apollo and OpenAI are intentionally optional and are not required for this workflow.

## Requirements

- Node.js 20+
- MySQL 8+
- npm 10+

## Installation

1. Create the database:

   ```sql
   CREATE DATABASE lead_outreach CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

2. Copy `.env.example` to `.env` and set the database credentials and a long random `AUTH_SECRET`.
3. Install packages and create the schema:

   ```bash
   npm install
   npm run db:sync
   ```

4. Create the first administrator (there is intentionally no public signup):

   ```bash
   npm run user:create -- "Admin Name" admin@example.com your-secure-password
   ```

5. Start both the Express API and Vite frontend:

   ```bash
   npm run dev
   ```

Open `http://localhost:5173`. The API runs on `http://localhost:4000`.

For production, run `npm run build`, set `NODE_ENV=production`, and run `npm start`. Serve `dist/` with your web server and proxy `/api` to the Express process.

## CSV / Excel import

Open **Lead Management → Import leads** and choose a `.csv` or `.xlsx` file. The server reads the first worksheet, recognizes common headings, and returns a preview. Adjust mappings, review valid/duplicate/invalid rows, select the valid leads, and explicitly confirm the import. No email is ever sent during import.

- The supplied development workbook is `canada_hr_leads.csv.xlsx` in the project root.
- A small template is available at `samples/leads-import-sample.csv` and from **Download sample CSV** in the UI.
- Email is the only required lead field.
- File limit: 10 MB; row limit: 10,000 per preview.

## Environment variables

All supported variables are documented in `.env.example`. Database credentials and provider keys remain server-side. Never commit `.env`.

## Future provider configuration

Phase 1 does not invoke Resend, OpenAI, or Apollo. Their placeholders are disabled by default so the manual workflow remains independent.

- **Resend:** set `RESEND_API_KEY`, sender name, and sender email. A later phase will add sending, test messages, webhook verification, suppression, and event tracking.
- **OpenAI:** set `OPENAI_ENABLED=true`, a server-side key, and a model only after the AI module is added. AI actions will always be user-triggered.
- **Apollo:** set `APOLLO_ENABLED=true` and a server-side key only after lead discovery is added. Apollo results will require review/import and will never initiate sending.

For future Resend webhooks, configure the public HTTPS API URL in Resend and verify webhook signatures before accepting events. Do not point production webhooks at the Vite development server.

## Structure

- `app-apis/routes` — route declarations only
- `app-apis/middleware` — authentication, validation, errors
- `app-apis/validators` — request validation rules
- `app-apis/controllers` — business workflows
- `app-apis/library` — file/provider adapters
- `app-apis/models` — Sequelize `Mod*.js` definitions
- `src/services` — organized frontend API clients
- `src/pages` and `src/layouts` — React/MUI application UI
- `scripts` — database and administrator utilities

External APIs use UUID `public_key` values; internal integer IDs are never exposed in application URLs. Business records use soft deletion.

## API response shape

Successful APIs return `{ "success": true, "message": "...", "data": ... }`. Errors return `{ "success": false, "message": "..." }`; list endpoints also include pagination metadata.
