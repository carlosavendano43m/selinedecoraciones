const express = require('express');
const router = express.Router();
/////////////////////////////// controller ////////////////////
const PayPalController=require('../controllers/PayPalController');
/////////////////////////////// router ///////////////////////
router.post('/create-transaction',PayPalController.createTransaction);
router.get('/execute-payment',PayPalController.executePayment);

module.exports = router