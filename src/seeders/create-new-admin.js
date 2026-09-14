require('dotenv').config();
const sequelize = require('../config/db');
const { User } = require('../models');

async function createNewAdmin() {
  try {
    await sequelize.authenticate();

    // Delete existing admin
    await User.destroy({ where: { username: 'admin' } });
    console.log('Old admin deleted.');

    // Create new admin
    const admin = await User.create({
      fullName: 'System Admin',
      username: 'admin',
      email: 'admin@hms.com',
      password: 'admin123',
      role: 'admin',
    });
    console.log('New admin created successfully.');
    console.log('Username: admin');
    console.log('Password: admin123');

    process.exit(0);
  } catch (error) {
    console.error('Admin creation failed:', error);
    process.exit(1);
  }
}

createNewAdmin();
