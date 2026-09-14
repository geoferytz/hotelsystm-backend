const express = require('express');
const router = express.Router();
const roleController = require('../controllers/role.controller');
const { authenticate, authorizeRoles } = require('../middleware/auth.middleware');

// Read routes — any authenticated user can access (needed to load own permissions)
router.get('/', authenticate, roleController.getAll);
router.get('/permissions', authenticate, roleController.getAllPermissions);
router.get('/:id', authenticate, roleController.getOne);

// Write routes — admin only
router.post('/', authenticate, authorizeRoles('admin'), roleController.create);
router.put('/:id', authenticate, authorizeRoles('admin'), roleController.update);
router.delete('/:id', authenticate, authorizeRoles('admin'), roleController.remove);

router.post('/permissions', authenticate, authorizeRoles('admin'), roleController.createPermission);
router.delete('/permissions/:id', authenticate, authorizeRoles('admin'), roleController.removePermission);

module.exports = router;
