const Shift = require('../models/shift.model');
const User = require('../models/user.model');
const { Op } = require('sequelize');
const { addHotelFilter, addHotelId } = require('../middleware/hotel.middleware');

// GET /api/shifts
exports.getAllShifts = async (req, res) => {
  try {
    const { shiftType, status, date } = req.query;
    const where = {};
    if (shiftType) where.shiftType = shiftType;
    if (status) where.status = status;
    if (date) where.shiftDate = date;
    addHotelFilter(where, req);

    const shifts = await Shift.findAll({
      where,
      include: [{ model: User, attributes: ['id', 'fullName', 'username', 'role'] }],
      order: [['shiftDate', 'DESC'], ['startTime', 'ASC']],
    });
    res.json(shifts);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch shifts.', error: error.message });
  }
};

// GET /api/shifts/:id
exports.getShiftById = async (req, res) => {
  try {
    const shift = await Shift.findByPk(req.params.id, {
      include: [{ model: User, attributes: ['id', 'fullName', 'username', 'role'] }],
    });
    if (!shift) return res.status(404).json({ message: 'Shift not found.' });
    res.json(shift);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch shift.', error: error.message });
  }
};

// POST /api/shifts
exports.createShift = async (req, res) => {
  try {
    const { userId, shiftDate, startTime, endTime, shiftType, notes } = req.body;

    const conflict = await Shift.findOne({
      where: {
        userId,
        shiftDate,
        status: { [Op.notIn]: ['absent'] },
        [Op.or]: [
          { startTime: { [Op.between]: [startTime, endTime] } },
          { endTime: { [Op.between]: [startTime, endTime] } },
        ],
      },
    });

    if (conflict) {
      return res.status(400).json({ message: 'Staff member already has a shift at this time.' });
    }

    const shift = await Shift.create(addHotelId({ userId, shiftDate, startTime, endTime, shiftType, notes }, req));
    const fullShift = await Shift.findByPk(shift.id, {
      include: [{ model: User, attributes: ['id', 'fullName', 'username', 'role'] }],
    });
    res.status(201).json({ message: 'Shift created successfully.', shift: fullShift });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create shift.', error: error.message });
  }
};

// PUT /api/shifts/:id
exports.updateShift = async (req, res) => {
  try {
    const shift = await Shift.findByPk(req.params.id);
    if (!shift) return res.status(404).json({ message: 'Shift not found.' });

    await shift.update(req.body);
    const updated = await Shift.findByPk(shift.id, {
      include: [{ model: User, attributes: ['id', 'fullName', 'username', 'role'] }],
    });
    res.json({ message: 'Shift updated successfully.', shift: updated });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update shift.', error: error.message });
  }
};

// DELETE /api/shifts/:id
exports.deleteShift = async (req, res) => {
  try {
    const shift = await Shift.findByPk(req.params.id);
    if (!shift) return res.status(404).json({ message: 'Shift not found.' });

    await shift.destroy();
    res.json({ message: 'Shift deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete shift.', error: error.message });
  }
};
