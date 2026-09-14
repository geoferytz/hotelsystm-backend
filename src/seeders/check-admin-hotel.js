require('dotenv').config();
const sequelize = require('../config/db');
const { User, Hotel, UserHotel } = require('../models');

async function checkAdminHotel() {
  try {
    await sequelize.authenticate();

    const admin = await User.findOne({ where: { username: 'admin' } });
    console.log('Admin user:', admin ? { id: admin.id, username: admin.username } : 'Not found');

    const hotels = await Hotel.findAll();
    console.log('Hotels in database:', hotels.map(h => ({ id: h.id, name: h.name })));

    const userHotels = await UserHotel.findAll({ where: { userId: admin?.id } });
    console.log('UserHotel links for admin:', userHotels.map(uh => ({ userId: uh.userId, hotelId: uh.hotelId, role: uh.role })));

    if (admin && hotels.length > 0 && userHotels.length === 0) {
      console.log('No hotel link found. Creating link...');
      await UserHotel.create({ userId: admin.id, hotelId: hotels[0].id, role: 'owner' });
      console.log('Hotel link created successfully.');
    }

    process.exit(0);
  } catch (error) {
    console.error('Check failed:', error);
    process.exit(1);
  }
}

checkAdminHotel();
