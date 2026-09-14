const express = require('express');
const router = express.Router();
const workerController = require('../controllers/worker.controller');
const { authenticate, authorizeRoles } = require('../middleware/auth.middleware');

router.use(authenticate);
router.get('/', workerController.getAll);
router.get('/:id', workerController.getOne);
router.post('/', authorizeRoles('admin'), workerController.create);
router.put('/:id', authorizeRoles('admin'), workerController.update);
router.delete('/:id', authorizeRoles('admin'), workerController.remove);

module.exports = router;
