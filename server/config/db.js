import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

let sequelize;

if (process.env.NODE_ENV === 'production') {
  // Production - Railway
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'mysql',
    dialectOptions: {
      ssl: {
        rejectUnauthorized: false
      }
    },
  });
} else {
  // Development - Local
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      dialect: 'mysql',
      logging: false,
    }
  );
}

// Test connection
try {
  await sequelize.authenticate();
  console.log('Database connected successfully');
} catch (error) {
  console.error('Database connection failed:', error.message);
}

export default sequelize;