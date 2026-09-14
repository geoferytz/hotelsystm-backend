const express = require('express');
const router = express.Router();
const shiftController = require('../controllers/shift.controller');
const { authenticate, authorizeRoles } = require('../middleware/auth.middleware');

router.get('/', authenticate, shiftController.getAllShifts);
router.get('/:id', authenticate, shiftController.getShiftById);
router.post('/', authenticate, authorizeRoles('admin'), shiftController.createShift);
router.put('/:id', authenticate, authorizeRoles('admin'), shiftController.updateShift);
router.delete('/:id', authenticate, authorizeRoles('admin'), shiftController.deleteShift);

module.exports = router;
