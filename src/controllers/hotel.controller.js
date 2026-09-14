const { Hotel, UserHotel, User, Room, HotelService, Meal } = require('../models');

// Public: Get all active hotels (no auth required)
exports.getPublicHotels = async (req, res) => {
  try {
    const hotels = await Hotel.findAll({
      where: { isActive: true },
      include: [
        {
          model: HotelService,
          where: { isActive: true },
          required: false,
        },
      ],
      order: [['name', 'ASC']],
    });
    res.json(hotels);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Get all hotels the current user has access to
exports.getMyHotels = async (req, res) => {
  try {
    console.log('Getting hotels for user:', req.user.id, req.user.username, 'Role:', req.user.role);
    
    // If admin, return all hotels
    if (req.user.role === 'admin') {
      const allHotels = await Hotel.findAll({
        where: { isActive: true },
        order: [['name', 'ASC']],
      });
      console.log('Admin user - returning all hotels:', allHotels.length);
      const hotels = allHotels.map(h => ({ ...h.toJSON(), role: 'owner' }));
      res.json(hotels);
      return;
    }
    
    // For other users, return only their assigned hotels
    const userHotels = await UserHotel.findAll({
      where: { userId: req.user.id },
      include: [{ model: Hotel, as: 'Hotel' }],
    });
    console.log('UserHotels found:', userHotels.length);
    const hotels = userHotels.map(uh => ({ ...uh.Hotel.toJSON(), role: uh.role }));
    console.log('Hotels returned:', hotels);
    res.json(hotels);
  } catch (err) { 
    console.error('Error getting hotels:', err);
    res.status(500).json({ message: err.message }); 
  }
};

// Public: Get hotel details with rooms, services, meals (no auth required)
exports.getPublicHotelDetails = async (req, res) => {
  try {
    const hotel = await Hotel.findByPk(req.params.id, {
      include: [
        {
          model: Room,
          where: { status: 'available' },
          required: false,
        },
        {
          model: HotelService,
          where: { isActive: true },
          required: false,
        },
        {
          model: Meal,
          where: { isAvailable: true },
          required: false,
        },
      ],
    });
    if (!hotel) return res.status(404).json({ message: 'Hotel not found' });
    res.json(hotel);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Get single hotel
exports.getById = async (req, res) => {
  try {
    const hotel = await Hotel.findByPk(req.params.id);
    if (!hotel) return res.status(404).json({ message: 'Hotel not found' });
    res.json(hotel);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Create a new hotel (current user becomes owner)
exports.create = async (req, res) => {
  try {
    const hotel = await Hotel.create(req.body);
    // Assign current user as owner
    await UserHotel.create({ userId: req.user.id, hotelId: hotel.id, role: 'owner' });
    res.status(201).json(hotel);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

// Update hotel
exports.update = async (req, res) => {
  try {
    const hotel = await Hotel.findByPk(req.params.id);
    if (!hotel) return res.status(404).json({ message: 'Hotel not found' });
    if (req.user.role !== 'admin') {
      const access = await UserHotel.findOne({ where: { userId: req.user.id, hotelId: hotel.id, role: 'owner' } });
      if (!access) return res.status(403).json({ message: 'Only hotel owner can update details' });
    }
    await hotel.update(req.body);
    res.json(hotel);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

// Delete hotel
exports.remove = async (req, res) => {
  try {
    const hotel = await Hotel.findByPk(req.params.id);
    if (!hotel) return res.status(404).json({ message: 'Hotel not found' });
    if (req.user.role !== 'admin') {
      const access = await UserHotel.findOne({ where: { userId: req.user.id, hotelId: hotel.id, role: 'owner' } });
      if (!access) return res.status(403).json({ message: 'Only hotel owner can delete' });
    }
    await UserHotel.destroy({ where: { hotelId: hotel.id } });
    await hotel.destroy();
    res.json({ message: 'Hotel deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Add a user/staff member to hotel
exports.addMember = async (req, res) => {
  try {
    const { userId, role } = req.body;
    const hotelId = req.params.id;
    // Verify current user is owner/manager
    const access = await UserHotel.findOne({ where: { userId: req.user.id, hotelId } });
    if (!access || access.role === 'staff') {
      return res.status(403).json({ message: 'Only owner or manager can add members' });
    }
    const existing = await UserHotel.findOne({ where: { userId, hotelId } });
    if (existing) return res.status(400).json({ message: 'User already has access to this hotel' });
    const member = await UserHotel.create({ userId, hotelId, role: role || 'staff' });
    res.status(201).json(member);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

// Remove a user from hotel
exports.removeMember = async (req, res) => {
  try {
    const { id: hotelId, userId } = req.params;
    const access = await UserHotel.findOne({ where: { userId: req.user.id, hotelId } });
    if (!access || access.role === 'staff') {
      return res.status(403).json({ message: 'Only owner or manager can remove members' });
    }
    await UserHotel.destroy({ where: { userId, hotelId } });
    res.json({ message: 'Member removed' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Get all members of a hotel
exports.getMembers = async (req, res) => {
  try {
    const members = await UserHotel.findAll({
      where: { hotelId: req.params.id },
      include: [{ model: User, as: 'User', attributes: ['id', 'fullName', 'email', 'role'] }],
    });
    res.json(members);
  } catch (err) { res.status(500).json({ message: err.message }); }
};
