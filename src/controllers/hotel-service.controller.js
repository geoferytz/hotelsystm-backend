const fs = require('fs');
const path = require('path');
const { HotelService } = require('../models');
const { addHotelFilter, addHotelId } = require('../middleware/hotel.middleware');

exports.getAll = async (req, res) => {
  try {
    const where = {};
    if (req.query.category) where.category = req.query.category;
    if (req.query.isActive !== undefined) where.isActive = req.query.isActive === 'true';
    addHotelFilter(where, req);
    const data = await HotelService.findAll({ where, order: [['category', 'ASC'], ['name', 'ASC']] });
    res.json(data);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getById = async (req, res) => {
  try {
    const item = await HotelService.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Service not found' });
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
    const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'services');
    fs.mkdirSync(uploadDir, { recursive: true });

    const storedName = `${Date.now()}-${safeName.replace(/\.[^.]+$/, '')}.${extension}`;
    const filePath = path.join(uploadDir, storedName);
    fs.writeFileSync(filePath, Buffer.from(match[3], 'base64'));

    res.status(201).json({ url: `/uploads/services/${storedName}` });
  } catch (err) { res.status(500).json({ message: 'Image upload failed.', error: err.message }); }
};

exports.create = async (req, res) => {
  try {
    const item = await HotelService.create(addHotelId(req.body, req));
    res.status(201).json(item);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.update = async (req, res) => {
  try {
    const item = await HotelService.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Service not found' });
    await item.update(req.body);
    res.json(item);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.remove = async (req, res) => {
  try {
    const item = await HotelService.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Service not found' });
    await item.destroy();
    res.json({ message: 'Service deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
