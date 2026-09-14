const express = require('express');
const router = express.Router();
const roomController = require('../controllers/room.controller');
const { authenticate, authorizeRoles } = require('../middleware/auth.middleware');

router.get('/', authenticate, roomController.getAllRooms);
router.post('/upload-image', authenticate, authorizeRoles('admin', 'receptionist'), roomController.uploadImage);
router.get('/:id', authenticate, roomController.getRoomById);
router.post('/bulk', authenticate, authorizeRoles('admin', 'receptionist'), roomController.createBulkRooms);
router.post('/', authenticate, authorizeRoles('admin', 'receptionist'), roomController.createRoom);
router.put('/:id', authenticate, authorizeRoles('admin', 'receptionist'), roomController.updateRoom);
router.delete('/:id', authenticate, authorizeRoles('admin'), roomController.deleteRoom);

module.exports = router;
