require('dotenv').config();
const sequelize = require('../config/db');
const { User } = require('../models');
const bcrypt = require('bcryptjs');

async function resetAdminPassword() {
  try {
    await sequelize.authenticate();

    const admin = await User.findOne({ where: { username: 'admin' } });
    if (admin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await admin.update({ password: hashedPassword });
      console.log('Admin password reset successfully.');
      console.log('Username: admin');
      console.log('Password: admin123');
    } else {
      console.log('Admin user not found.');
    }

    process.exit(0);
  } catch (error) {
    console.error('Password reset failed:', error);
    process.exit(1);
  }
}

resetAdminPassword();
