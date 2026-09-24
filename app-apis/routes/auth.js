const router = require('express').Router();
const auth = require('../middleware/AuthApi');
const validate = require('../middleware/Validation');
const rules = require('../validators/ValidateAuth');
const controller = require('../controllers/AuthController');
router.post('/login', rules.login, validate, controller.login);
router.get('/me', auth, controller.me);
module.exports = router;
