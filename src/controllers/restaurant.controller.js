const fs = require('fs');
const path = require('path');
const { Restaurant, RestaurantMenu } = require('../models');
const { addHotelFilter, addHotelId } = require('../middleware/hotel.middleware');

exports.getRestaurants = async (req, res) => {
  try {
    const where = {};
    if (req.query.isActive !== undefined) where.isActive = req.query.isActive === 'true';
    addHotelFilter(where, req);
    const data = await Restaurant.findAll({ where, include: [{ model: RestaurantMenu, as: 'Menus' }], order: [['name', 'ASC']] });
    res.json(data);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getRestaurantById = async (req, res) => {
  try {
    const item = await Restaurant.findByPk(req.params.id, { include: [{ model: RestaurantMenu, as: 'Menus' }] });
    if (!item) return res.status(404).json({ message: 'Restaurant not found' });
    res.json(item);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.uploadRestaurantImage = async (req, res) => {
  try {
    const { fileName, dataUrl } = req.body;
    if (!fileName || !dataUrl) return res.status(400).json({ message: 'fileName and dataUrl are required.' });

    const match = dataUrl.match(/^data:(image\/(png|jpe?g|gif|webp));base64,(.+)$/i);
    if (!match) return res.status(400).json({ message: 'Only PNG, JPG, GIF, or WEBP images are allowed.' });

    const extension = match[2].toLowerCase() === 'jpeg' ? 'jpg' : match[2].toLowerCase();
    const safeName = path.basename(fileName).replace(/[^a-z0-9._-]/gi, '-');
    const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'restaurants');
    fs.mkdirSync(uploadDir, { recursive: true });

    const storedName = `${Date.now()}-${safeName.replace(/\.[^.]+$/, '')}.${extension}`;
    const filePath = path.join(uploadDir, storedName);
    fs.writeFileSync(filePath, Buffer.from(match[3], 'base64'));

    res.status(201).json({ url: `/uploads/restaurants/${storedName}` });
  } catch (err) { res.status(500).json({ message: 'Image upload failed.', error: err.message }); }
};

exports.createRestaurant = async (req, res) => {
  try {
    const item = await Restaurant.create(addHotelId(req.body, req));
    res.status(201).json(item);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.updateRestaurant = async (req, res) => {
  try {
    const item = await Restaurant.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Restaurant not found' });
    await item.update(req.body);
    res.json(item);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.deleteRestaurant = async (req, res) => {
  try {
    const item = await Restaurant.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Restaurant not found' });
    await item.destroy();
    res.json({ message: 'Restaurant deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getMenus = async (req, res) => {
  try {
    const where = {};
    if (req.query.restaurantId) where.restaurantId = req.query.restaurantId;
    if (req.query.category) where.category = req.query.category;
    if (req.query.isAvailable !== undefined) where.isAvailable = req.query.isAvailable === 'true';
    addHotelFilter(where, req);
    const data = await RestaurantMenu.findAll({ where, include: [{ model: Restaurant, as: 'Restaurant' }], order: [['category', 'ASC'], ['name', 'ASC']] });
    res.json(data);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.uploadMenuImage = async (req, res) => {
  try {
    const { fileName, dataUrl } = req.body;
    if (!fileName || !dataUrl) return res.status(400).json({ message: 'fileName and dataUrl are required.' });

    const match = dataUrl.match(/^data:(image\/(png|jpe?g|gif|webp));base64,(.+)$/i);
    if (!match) return res.status(400).json({ message: 'Only PNG, JPG, GIF, or WEBP images are allowed.' });

    const extension = match[2].toLowerCase() === 'jpeg' ? 'jpg' : match[2].toLowerCase();
    const safeName = path.basename(fileName).replace(/[^a-z0-9._-]/gi, '-');
    const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'restaurant-menus');
    fs.mkdirSync(uploadDir, { recursive: true });

    const storedName = `${Date.now()}-${safeName.replace(/\.[^.]+$/, '')}.${extension}`;
    const filePath = path.join(uploadDir, storedName);
    fs.writeFileSync(filePath, Buffer.from(match[3], 'base64'));

    res.status(201).json({ url: `/uploads/restaurant-menus/${storedName}` });
  } catch (err) { res.status(500).json({ message: 'Image upload failed.', error: err.message }); }
};

exports.createMenu = async (req, res) => {
  try {
    const item = await RestaurantMenu.create(addHotelId(req.body, req));
    res.status(201).json(item);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.updateMenu = async (req, res) => {
  try {
    const item = await RestaurantMenu.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Menu item not found' });
    await item.update(req.body);
    res.json(item);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.deleteMenu = async (req, res) => {
  try {
    const item = await RestaurantMenu.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Menu item not found' });
    await item.destroy();
    res.json({ message: 'Menu item deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
