import { sequelize } from '../models/index.js';

async function syncDatabase() {
  try {
    // Sync all models with the database
    await sequelize.sync({ alter: true });
    console.log('Tables created successfully');
  } catch (error) {
    console.error('Error syncing database:', error.message);
  }
}

syncDatabase();