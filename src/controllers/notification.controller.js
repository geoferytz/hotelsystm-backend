const { Notification } = require('../models');
const { addHotelFilter } = require('../middleware/hotel.middleware');

// GET /api/notifications
exports.getAll = async (req, res) => {
  try {
    const where = {};
    addHotelFilter(where, req);
    const notifications = await Notification.findAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: 100,
    });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch notifications.', error: error.message });
  }
};

// GET /api/notifications/unread-count
exports.getUnreadCount = async (req, res) => {
  try {
    const where = { isRead: false };
    addHotelFilter(where, req);
    const count = await Notification.count({ where });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get count.', error: error.message });
  }
};

// PUT /api/notifications/:id/read
exports.markRead = async (req, res) => {
  try {
    const n = await Notification.findByPk(req.params.id);
    if (!n) return res.status(404).json({ message: 'Not found.' });
    await n.update({ isRead: true });
    res.json(n);
  } catch (error) {
    res.status(500).json({ message: 'Failed.', error: error.message });
  }
};

// PUT /api/notifications/read-all
exports.markAllRead = async (req, res) => {
  try {
    const where = { isRead: false };
    addHotelFilter(where, req);
    await Notification.update({ isRead: true }, { where });
    res.json({ message: 'All notifications marked as read.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed.', error: error.message });
  }
};

// Helper to create a notification (used by other controllers)
exports.createNotification = async (type, title, message, referenceId = null, referenceType = null, hotelId = null) => {
  try {
    await Notification.create({ type, title, message, referenceId, referenceType, hotelId });
  } catch (e) {
    console.error('Notification error:', e.message);
  }
};
