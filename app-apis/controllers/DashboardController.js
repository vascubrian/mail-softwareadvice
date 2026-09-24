const { Op, fn, col } = require('sequelize');
const { Lead, LeadImport } = require('../models');
exports.summary = async (_req, res, next) => {
  try {
    const [total, newest, qualified, contacted, interested, demos, imports] = await Promise.all([
      Lead.count({ where: { deleted: 0 } }), Lead.count({ where: { deleted: 0, status: 'NEW' } }),
      Lead.count({ where: { deleted: 0, status: 'QUALIFIED' } }), Lead.count({ where: { deleted: 0, status: 'CONTACTED' } }),
      Lead.count({ where: { deleted: 0, status: 'INTERESTED' } }), Lead.count({ where: { deleted: 0, status: 'DEMO_BOOKED' } }),
      LeadImport.count({ where: { deleted: 0 } })
    ]);
    const byStatus = await Lead.findAll({ where: { deleted: 0 }, attributes: ['status', [fn('COUNT', col('id')), 'count']], group: ['status'], raw: true });
    res.json({ success: true, message: 'Dashboard retrieved successfully', data: { cards: { total, new: newest, qualified, contacted, interested, demos, imports }, byStatus } });
  } catch (e) { next(e); }
};
