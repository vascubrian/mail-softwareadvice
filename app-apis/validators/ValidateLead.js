const { body, param, query } = require('express-validator');
const statuses = ['NEW','RESEARCHED','QUALIFIED','UNQUALIFIED','CONTACTED','REPLIED','INTERESTED','DEMO_BOOKED','NOT_INTERESTED','UNSUBSCRIBED'];
const fields = [
  body('email').isEmail().normalizeEmail(), body('name').optional({ nullable: true }).trim().isLength({ max: 200 }),
  body('first_name').optional({ nullable: true }).trim().isLength({ max: 100 }), body('last_name').optional({ nullable: true }).trim().isLength({ max: 100 }),
  body('job_title').optional({ nullable: true }).trim().isLength({ max: 180 }), body('company').optional({ nullable: true }).trim().isLength({ max: 200 }),
  body('status').optional().isIn(statuses), body('source').optional().isIn(['MANUAL','CSV','EXCEL','APOLLO','API']),
  body('qualification_score').optional({ nullable: true }).isInt({ min: 0, max: 100 })
];
module.exports.save = fields;
module.exports.key = [param('key').isUUID()];
module.exports.list = [query('page').optional().isInt({ min: 1 }), query('limit').optional().isInt({ min: 1, max: 100 })];
