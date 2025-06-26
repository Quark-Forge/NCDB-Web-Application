import sequelize from '../config/db.js';
import Role from '../models/roles.js';
import User from '../models/users.js';

async function syncDatabase() {
  try {
    // Sync all models with the database
    await sequelize.sync({ force: false });
    console.log('Tables created successfully');
  } catch (error) {
    console.error('Error syncing database:', error.message);
  }
}

syncDatabase();