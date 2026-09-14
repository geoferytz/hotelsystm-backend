const router = require('express').Router();
const ctrl = require('../controllers/restaurant.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.get('/', authenticate, ctrl.getRestaurants);
router.post('/upload-image', authenticate, ctrl.uploadRestaurantImage);
router.post('/', authenticate, ctrl.createRestaurant);
router.get('/menus', authenticate, ctrl.getMenus);
router.post('/menus/upload-image', authenticate, ctrl.uploadMenuImage);
router.post('/menus', authenticate, ctrl.createMenu);
router.put('/menus/:id', authenticate, ctrl.updateMenu);
router.delete('/menus/:id', authenticate, ctrl.deleteMenu);
router.get('/:id', authenticate, ctrl.getRestaurantById);
router.put('/:id', authenticate, ctrl.updateRestaurant);
router.delete('/:id', authenticate, ctrl.deleteRestaurant);

module.exports = router;
