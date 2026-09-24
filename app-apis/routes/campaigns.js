const router = require('express').Router();

const auth = require('../middleware/AuthApi');
const campaignController = require('../controllers/CampaignController');
const campaignSendController = require('../controllers/CampaignSendController');

router.get('/', auth, campaignController.list);
router.get('/:key', auth, campaignController.get);
router.post('/', auth, campaignController.save);
router.put('/:key', auth, campaignController.save);
router.delete('/:key', auth, campaignController.remove);
router.post('/:key/send', auth, campaignSendController.send);

module.exports = router;
