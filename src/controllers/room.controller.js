const fs = require('fs');
const path = require('path');
const Room = require('../models/room.model');
const { Op } = require('sequelize');
const { addHotelFilter, addHotelId } = require('../middleware/hotel.middleware');

// GET /api/rooms
exports.getAllRooms = async (req, res) => {
  try {
    const { status, type } = req.query;
    const where = {};
    if (status) where.status = status;
    if (type) where.type = type;
    addHotelFilter(where, req);

    const rooms = await Room.findAll({ where, order: [['roomNumber', 'ASC']] });
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch rooms.', error: error.message });
  }
};

// GET /api/rooms/:id
exports.getRoomById = async (req, res) => {
  try {
    const room = await Room.findByPk(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found.' });
    res.json(room);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch room.', error: error.message });
  }
};

exports.uploadImage = async (req, res) => {
  try {
    const { fileName, dataUrl } = req.body;
    if (!fileName || !dataUrl) return res.status(400).json({ message: 'fileName and dataUrl are required.' });

    const match = dataUrl.match(/^data:(image\/(png|jpe?g|gif|webp));base64,(.+)$/i);
    if (!match) return res.status(400).json({ message: 'Only PNG, JPG, GIF, or WEBP images are allowed.' });

    const extension = match[2].toLowerCase() === 'jpeg' ? 'jpg' : match[2].toLowerCase();
    const safeName = path.basename(fileName).replace(/[^a-z0-9._-]/gi, '-');
    const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'rooms');
    fs.mkdirSync(uploadDir, { recursive: true });

    const storedName = `${Date.now()}-${safeName.replace(/\.[^.]+$/, '')}.${extension}`;
    const filePath = path.join(uploadDir, storedName);
    fs.writeFileSync(filePath, Buffer.from(match[3], 'base64'));

    res.status(201).json({ url: `/uploads/rooms/${storedName}` });
  } catch (error) { res.status(500).json({ message: 'Image upload failed.', error: error.message }); }
};

// POST /api/rooms
exports.createRoom = async (req, res) => {
  try {
    const { roomNumber, type, price, floor, description, imageUrl, images } = req.body;

    const existing = await Room.findOne({ where: { roomNumber } });
    if (existing) {
      return res.status(400).json({ message: 'Room number already exists.' });
    }

    const room = await Room.create(addHotelId({ roomNumber, type, price, floor, description, imageUrl, images }, req));
    res.status(201).json({ message: 'Room created successfully.', room });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create room.', error: error.message });
  }
};

// PUT /api/rooms/:id
exports.updateRoom = async (req, res) => {
  try {
    const room = await Room.findByPk(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found.' });

    await room.update(req.body);
    res.json({ message: 'Room updated successfully.', room });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update room.', error: error.message });
  }
};

// POST /api/rooms/bulk - create multiple rooms at once
exports.createBulkRooms = async (req, res) => {
  try {
    const { rooms } = req.body;
    if (!Array.isArray(rooms) || rooms.length === 0) {
      return res.status(400).json({ message: 'Rooms array is required.' });
    }

    const roomNumbers = rooms.map(r => r.roomNumber);
    const existing = await Room.findAll({ where: { roomNumber: { [Op.in]: roomNumbers } } });
    if (existing.length > 0) {
      const existingNums = existing.map(r => r.roomNumber).join(', ');
      return res.status(400).json({ message: `Room numbers already exist: ${existingNums}` });
    }

    const hotelId = req.hotelId;
    const roomsToCreate = rooms.map(r => addHotelId({ ...r }, req));
    const created = await Room.bulkCreate(roomsToCreate);

    res.status(201).json({ message: `${created.length} rooms created successfully.`, rooms: created });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create rooms.', error: error.message });
  }
};

// DELETE /api/rooms/:id
exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findByPk(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found.' });

    await room.destroy();
    res.json({ message: 'Room deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete room.', error: error.message });
  }
};
