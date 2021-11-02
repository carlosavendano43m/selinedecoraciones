const express = require('express');
const router = express.Router();

const NotificationController=require('../controllers/NotificationController');

router.post('/notification-send',NotificationController.sendNotification);

module.exports = router;