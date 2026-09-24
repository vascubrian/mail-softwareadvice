const { body } = require('express-validator');
module.exports.confirm = [
  body('filename').isString().trim().isLength({ min: 1, max: 255 }), body('source').isIn(['CSV','EXCEL']),
  body('rows').isArray({ max: 10000 }), body('rows.*.email').optional({ values: 'falsy' }).isEmail()
];
