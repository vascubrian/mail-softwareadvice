const { body } = require('express-validator');
module.exports.login = [body('email').isEmail().normalizeEmail(), body('password').isString().isLength({ min: 8, max: 128 })];
