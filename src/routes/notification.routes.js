const express = require('express');
const router = express.Router();
const notifController = require('../controllers/notification.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);
router.get('/', notifController.getAll);
router.get('/unread-count', notifController.getUnreadCount);
router.put('/:id/read', notifController.markRead);
router.put('/read-all', notifController.markAllRead);

module.exports = router;
