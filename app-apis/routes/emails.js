const router=require('express').Router(),auth=require('../middleware/AuthApi');router.get('/',auth,require('../controllers/EmailController').list);module.exports=router;
