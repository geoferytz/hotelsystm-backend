const { RoomType } = require('../models');
const { addHotelFilter, addHotelId } = require('../middleware/hotel.middleware');

exports.getAll = async (req, res) => {
  try {
    const where = {};
    if (req.query.isActive !== undefined) where.isActive = req.query.isActive === 'true';
    addHotelFilter(where, req);
    const data = await RoomType.findAll({ where, order: [['name', 'ASC']] });
    res.json(data);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getById = async (req, res) => {
  try {
    const item = await RoomType.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Room type not found' });
    res.json(item);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.create = async (req, res) => {
  try {
    const item = await RoomType.create(addHotelId(req.body, req));
    res.status(201).json(item);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.update = async (req, res) => {
  try {
    const item = await RoomType.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Room type not found' });
    await item.update(req.body);
    res.json(item);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.remove = async (req, res) => {
  try {
    const item = await RoomType.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Room type not found' });
    await item.destroy();
    res.json({ message: 'Room type deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
