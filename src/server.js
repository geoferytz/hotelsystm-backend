const app = require('./app');
const sequelize = require('./config/db');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    // Sync all models (use { alter: true } in dev, { force: false } in prod)
    await sequelize.sync({ alter: true });
    console.log('Database synced.');

    app.listen(PORT, () => {
      console.log(`HMS Backend running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
}

startServer();
