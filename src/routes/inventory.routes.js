const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventory.controller');
const { authenticate, authorizeRoles } = require('../middleware/auth.middleware');

// Categories
router.get('/categories', authenticate, inventoryController.getAllCategories);
router.get('/categories/:id', authenticate, inventoryController.getCategoryById);
router.post('/categories', authenticate, authorizeRoles('admin', 'receptionist'), inventoryController.createCategory);
router.put('/categories/:id', authenticate, authorizeRoles('admin', 'receptionist'), inventoryController.updateCategory);
router.delete('/categories/:id', authenticate, authorizeRoles('admin'), inventoryController.deleteCategory);

// Items
router.get('/items', authenticate, inventoryController.getAllItems);
router.get('/items/:id', authenticate, inventoryController.getItemById);
router.post('/items', authenticate, authorizeRoles('admin', 'receptionist'), inventoryController.createItem);
router.put('/items/:id', authenticate, authorizeRoles('admin', 'receptionist'), inventoryController.updateItem);
router.delete('/items/:id', authenticate, authorizeRoles('admin'), inventoryController.deleteItem);

// Stock Movements
router.get('/stock', authenticate, inventoryController.getAllStockMovements);
router.post('/stock', authenticate, authorizeRoles('admin', 'receptionist'), inventoryController.createStockMovement);
router.get('/summary', authenticate, inventoryController.getStockSummary);

module.exports = router;
