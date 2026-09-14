const fs = require('fs');
const path = require('path');
const { Meal, Hotel } = require('../models');
const { addHotelFilter, addHotelId } = require('../middleware/hotel.middleware');

exports.getAll = async (req, res) => {
  try {
    const where = {};
    if (req.query.category) where.category = req.query.category;
    if (req.query.isAvailable !== undefined) where.isAvailable = req.query.isAvailable === 'true';
    addHotelFilter(where, req);
    const data = await Meal.findAll({
      where,
      include: [{ model: Hotel, attributes: ['id', 'name'], required: false }],
      order: [['category', 'ASC'], ['name', 'ASC']],
    });
    res.json(data);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getById = async (req, res) => {
  try {
    const item = await Meal.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Meal not found' });
    res.json(item);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.uploadImage = async (req, res) => {
  try {
    const { fileName, dataUrl } = req.body;
    if (!fileName || !dataUrl) return res.status(400).json({ message: 'fileName and dataUrl are required.' });

    const match = dataUrl.match(/^data:(image\/(png|jpe?g|gif|webp));base64,(.+)$/i);
    if (!match) return res.status(400).json({ message: 'Only PNG, JPG, GIF, or WEBP images are allowed.' });

    const extension = match[2].toLowerCase() === 'jpeg' ? 'jpg' : match[2].toLowerCase();
    const safeName = path.basename(fileName).replace(/[^a-z0-9._-]/gi, '-');
    const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'meals');
    fs.mkdirSync(uploadDir, { recursive: true });

    const storedName = `${Date.now()}-${safeName.replace(/\.[^.]+$/, '')}.${extension}`;
    const filePath = path.join(uploadDir, storedName);
    fs.writeFileSync(filePath, Buffer.from(match[3], 'base64'));

    res.status(201).json({ url: `/uploads/meals/${storedName}` });
  } catch (err) { res.status(500).json({ message: 'Image upload failed.', error: err.message }); }
};

exports.create = async (req, res) => {
  try {
    const item = await Meal.create(addHotelId(req.body, req));
    res.status(201).json(item);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.update = async (req, res) => {
  try {
    const item = await Meal.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Meal not found' });
    await item.update(req.body);
    res.json(item);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.remove = async (req, res) => {
  try {
    const item = await Meal.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Meal not found' });
    await item.destroy();
    res.json({ message: 'Meal deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
