const router = require('express').Router();
const ctrl = require('../controllers/hotel.controller');
const { authenticate } = require('../middleware/auth.middleware');

// Public routes (no auth required)
router.get('/public', ctrl.getPublicHotels);
router.get('/public/:id', ctrl.getPublicHotelDetails);

// Protected routes
router.get('/my-hotels', authenticate, ctrl.getMyHotels);
router.get('/:id', authenticate, ctrl.getById);
router.post('/', authenticate, ctrl.create);
router.put('/:id', authenticate, ctrl.update);
router.delete('/:id', authenticate, ctrl.remove);
router.get('/:id/members', authenticate, ctrl.getMembers);
router.post('/:id/members', authenticate, ctrl.addMember);
router.delete('/:id/members/:userId', authenticate, ctrl.removeMember);

module.exports = router;
