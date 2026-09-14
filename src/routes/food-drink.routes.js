const express = require('express');
const router = express.Router();
const foodDrinkController = require('../controllers/food-drink.controller');

// Food Request Routes
router.post('/food-requests', foodDrinkController.createFoodRequest);
router.get('/food-requests', foodDrinkController.getAllFoodRequests);
router.get('/food-requests/room/:roomId', foodDrinkController.getFoodRequestsByRoom);
router.put('/food-requests/:id/status', foodDrinkController.updateFoodRequestStatus);

// Drink Request Routes
router.post('/drink-requests', foodDrinkController.createDrinkRequest);
router.get('/drink-requests', foodDrinkController.getAllDrinkRequests);
router.get('/drink-requests/room/:roomId', foodDrinkController.getDrinkRequestsByRoom);
router.put('/drink-requests/:id/status', foodDrinkController.updateDrinkRequestStatus);

module.exports = router;
