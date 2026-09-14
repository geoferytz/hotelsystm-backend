const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate, authorizeRoles } = require('../middleware/auth.middleware');

router.use(authenticate, authorizeRoles('admin'));

router.get('/', userController.getAll);
router.get('/:id', userController.getOne);
router.post('/', userController.create);
router.put('/:id', userController.update);
router.put('/:id/password', userController.changePassword);
router.put('/:id/toggle-active', userController.toggleActive);
router.delete('/:id', userController.remove);

module.exports = router;
