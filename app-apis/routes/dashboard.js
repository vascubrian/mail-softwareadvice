const router = require('express').Router();
const auth = require('../middleware/AuthApi');
router.get('/', auth, require('../controllers/DashboardController').summary);
module.exports = router;
