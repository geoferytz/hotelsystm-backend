const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate, authorizeRoles } = require('../middleware/auth.middleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/profile', authenticate, authController.getProfile);
router.get('/users', authenticate, authorizeRoles('admin'), authController.getAllUsers);

module.exports = router;
