require('dotenv').config();
const sequelize = require('../config/db');
const { User, Hotel, UserHotel } = require('../models');

async function seedAdmin() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();

    // Create admin user
    let admin = await User.findOne({ where: { username: 'admin' } });
    if (!admin) {
      admin = await User.create({
        fullName: 'System Admin',
        username: 'admin',
        email: 'admin@hms.com',
        password: 'admin123',
        role: 'admin',
      });
      console.log('Admin user created successfully.');
      console.log('Username: admin');
      console.log('Password: admin123');
    } else {
      console.log('Admin user already exists.');
    }

    // Create default hotel
    let hotel = await Hotel.findOne({ where: { name: 'My Hotel' } });
    if (!hotel) {
      hotel = await Hotel.create({
        name: 'My Hotel',
        address: 'Main Street',
        city: 'Dar es Salaam',
        country: 'Tanzania',
        phone: '+255 700 000 000',
        email: 'info@myhotel.co.tz',
        description: 'Default hotel',
        starRating: 3,
        isActive: true,
      });
      console.log('Default hotel created: My Hotel');
    } else {
      console.log('Default hotel already exists.');
    }

    // Link admin to hotel as owner
    const link = await UserHotel.findOne({ where: { userId: admin.id, hotelId: hotel.id } });
    if (!link) {
      await UserHotel.create({ userId: admin.id, hotelId: hotel.id, role: 'owner' });
      console.log('Admin linked to default hotel as owner.');
    }

    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seedAdmin();
