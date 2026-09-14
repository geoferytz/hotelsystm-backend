const { Worker, User } = require('../models');
const { Op } = require('sequelize');
const { addHotelFilter, addHotelId } = require('../middleware/hotel.middleware');

// GET /api/workers
exports.getAll = async (req, res) => {
  try {
    const { status, department, search } = req.query;
    const where = {};
    if (status) where.status = status;
    if (department) where.department = department;
    if (search) {
      where[Op.or] = [
        { fullName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { phone: { [Op.iLike]: `%${search}%` } },
      ];
    }
    addHotelFilter(where, req);
    const workers = await Worker.findAll({
      where,
      include: [{ model: User, as: 'User', attributes: ['id', 'username', 'role'] }],
      order: [['createdAt', 'DESC']],
    });
    res.json(workers);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch workers.', error: error.message });
  }
};

// GET /api/workers/:id
exports.getOne = async (req, res) => {
  try {
    const worker = await Worker.findByPk(req.params.id, {
      include: [{ model: User, as: 'User', attributes: ['id', 'username', 'role'] }],
    });
    if (!worker) return res.status(404).json({ message: 'Worker not found.' });
    res.json(worker);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch worker.', error: error.message });
  }
};

// POST /api/workers
exports.create = async (req, res) => {
  try {
    const worker = await Worker.create(addHotelId(req.body, req));
    res.status(201).json(worker);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create worker.', error: error.message });
  }
};

// PUT /api/workers/:id
exports.update = async (req, res) => {
  try {
    const worker = await Worker.findByPk(req.params.id);
    if (!worker) return res.status(404).json({ message: 'Worker not found.' });
    await worker.update(req.body);
    res.json(worker);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update worker.', error: error.message });
  }
};

// DELETE /api/workers/:id
exports.remove = async (req, res) => {
  try {
    const worker = await Worker.findByPk(req.params.id);
    if (!worker) return res.status(404).json({ message: 'Worker not found.' });
    await worker.destroy();
    res.json({ message: 'Worker deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete worker.', error: error.message });
  }
};
