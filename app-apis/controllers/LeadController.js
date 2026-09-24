const { Op } = require('sequelize');
const { Lead, Activity } = require('../models');
const editable = ['name','first_name','last_name','job_title','company','email','phone','linkedin_url','company_website','country','company_size','industry','source','status','qualification_status','qualification_score','qualification_reason','buying_signals','notes','last_contact_time'];
const clean = (body) => Object.fromEntries(editable.filter((key) => body[key] !== undefined).map((key) => [key, body[key] === '' ? null : body[key]]));
exports.list = async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1), limit = Math.min(Number(req.query.limit) || 25, 100);
    const where = { deleted: 0 };
    if (req.query.search) where[Op.or] = ['name','email','company','job_title'].map((field) => ({ [field]: { [Op.like]: `%${req.query.search}%` } }));
    ['status','country','qualification_status'].forEach((field) => { if (req.query[field]) where[field] = req.query[field]; }); if (req.query.source === 'APOLLO') where.source = 'APOLLO'; else if (req.query.source === 'MANUAL_IMPORT') where.source = { [Op.in]: ['MANUAL','CSV','EXCEL','API'] };
    const allowedSort = ['created_time','name','email','company','status','last_contact_time'];
    const sort = allowedSort.includes(req.query.sort) ? req.query.sort : 'created_time';
    const direction = req.query.direction === 'asc' ? 'ASC' : 'DESC';
    const result = await Lead.findAndCountAll({ where, attributes: { exclude: ['id'] }, limit, offset: (page - 1) * limit, order: [[sort, direction]] });
    res.json({ success: true, message: 'Leads retrieved successfully', data: result.rows, pagination: { page, limit, total: result.count, pages: Math.ceil(result.count / limit) } });
  } catch (e) { next(e); }
};
exports.get = async (req, res, next) => { try { const lead = await Lead.findOne({ where: { public_key: req.params.key, deleted: 0 }, attributes: { exclude: ['id'] }, include: [{ model: Activity, as: 'activities', attributes: { exclude: ['id','lead_id'] } }] }); if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' }); res.json({ success: true, message: 'Lead retrieved successfully', data: lead }); } catch (e) { next(e); } };
exports.save = async (req, res, next) => {
  try {
    let lead;
    if (req.params.key) { lead = await Lead.findOne({ where: { public_key: req.params.key, deleted: 0 } }); if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' }); await lead.update({ ...clean(req.body), edited_by: req.user.id, edited_time: new Date() }); }
    else lead = await Lead.create({ ...clean(req.body), created_by: req.user.id, source: req.body.source || 'MANUAL' });
    await Activity.create({ lead_id: lead.id, type: req.params.key ? 'LEAD_EDITED' : 'LEAD_CREATED', description: req.params.key ? 'Lead edited' : 'Lead created manually', created_by: req.user.id });
    res.status(req.params.key ? 200 : 201).json({ success: true, message: req.params.key ? 'Lead updated successfully' : 'Lead created successfully', data: { public_key: lead.public_key } });
  } catch (e) { next(e); }
};
exports.remove = async (req, res, next) => { try { const [count] = await Lead.update({ deleted: 1, edited_by: req.user.id, edited_time: new Date() }, { where: { public_key: req.params.key, deleted: 0 } }); if (!count) return res.status(404).json({ success: false, message: 'Lead not found' }); res.json({ success: true, message: 'Lead deleted successfully' }); } catch (e) { next(e); } };
