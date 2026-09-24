const { Op } = require('sequelize');
const { Lead, LeadImport, Activity, sequelize } = require('../models');
const importer = require('../library/LeadFileImport');
const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const assess = async (mapped) => {
  const emails = mapped.map((r) => r.email?.toLowerCase()).filter(Boolean);
  const existing = new Set((await Lead.findAll({ where: { email: { [Op.in]: emails } }, attributes: ['email'] })).map((r) => r.email.toLowerCase()));
  const seen = new Set();
  return mapped.map((row, index) => { const email = row.email?.toLowerCase(); let import_status = 'VALID'; if (!email) import_status = 'MISSING EMAIL'; else if (!validEmail.test(email)) import_status = 'INVALID EMAIL'; else if (existing.has(email) || seen.has(email)) import_status = 'DUPLICATE'; seen.add(email); return { row_number: index + 2, ...row, email, import_status }; });
};
exports.preview = async (req, res, next) => {
  try { if (!req.file) return res.status(422).json({ success: false, message: 'Choose a CSV or XLSX file' }); const parsed = importer.parse(req.file.buffer); const mapping = importer.suggestMapping(parsed.columns); const rows = await assess(importer.mapRows(parsed.rows, mapping)); res.json({ success: true, message: 'File parsed successfully', data: { filename: req.file.originalname, source: req.file.originalname.toLowerCase().endsWith('.csv') ? 'CSV' : 'EXCEL', columns: parsed.columns, mapping, rawRows: parsed.rows, rows } }); } catch (e) { e.publicMessage = 'Unable to read this file'; next(e); }
};
exports.remap = async (req, res, next) => { try { const rows = await assess(importer.mapRows(req.body.rawRows || [], req.body.mapping || {})); res.json({ success: true, message: 'Column mapping applied', data: rows }); } catch (e) { next(e); } };
exports.confirm = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const rows = await assess(req.body.rows); const summary = { total_rows: rows.length, imported: 0, duplicates: 0, missing_emails: 0, invalid_emails: 0, skipped: 0, failed: 0 };
    for (const row of rows) {
      if (row.skip) { summary.skipped++; continue; }
      if (row.import_status !== 'VALID') { const key = row.import_status === 'DUPLICATE' ? 'duplicates' : row.import_status === 'MISSING EMAIL' ? 'missing_emails' : 'invalid_emails'; summary[key]++; continue; }
      try { const lead = await Lead.create({ ...row, source: req.body.source, created_by: req.user.id }, { transaction }); await Activity.create({ lead_id: lead.id, type: 'LEAD_IMPORTED', description: `Imported from ${req.body.filename}`, created_by: req.user.id }, { transaction }); summary.imported++; } catch { summary.failed++; }
    }
    const history = await LeadImport.create({ filename: req.body.filename, source: req.body.source, ...summary, created_by: req.user.id }, { transaction });
    await transaction.commit(); res.status(201).json({ success: true, message: 'Import completed', data: { public_key: history.public_key, ...summary } });
  } catch (e) { await transaction.rollback(); next(e); }
};
exports.history = async (req, res, next) => { try { const rows = await LeadImport.findAll({ where: { deleted: 0 }, attributes: { exclude: ['id'] }, order: [['created_time','DESC']], limit: 100 }); res.json({ success: true, message: 'Import history retrieved successfully', data: rows }); } catch (e) { next(e); } };
