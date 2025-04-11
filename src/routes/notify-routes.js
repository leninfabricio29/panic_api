const express = require('express');
const router = express.Router();
const notifyController = require('../controllers/notify-controllers');

router.get('/all/:id', notifyController.getNotificationsByUser);
router.post('/readCheck/:id', notifyController.markReadNotification);
router.get('/some/:id', notifyController.getNotificationById)

module.exports = router;