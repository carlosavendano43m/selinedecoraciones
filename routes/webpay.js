const express = require('express');
const router = express.Router();
/////////////////////////////// controller ////////////////////
const WebpayController=require('../controllers/WebpayController');

router.post('/webpay-token',WebpayController.InitTransaction);
router.post('/webpay-return',WebpayController.returnTransaction);

module.exports = router