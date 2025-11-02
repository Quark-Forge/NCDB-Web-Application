import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

let sequelize;

console.log('Environment:', process.env.NODE_ENV);
console.log('Database URL:', process.env.DATABASE_URL ? 'Present' : 'Not present');

if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL) {
  // Production - Railway
  console.log('Connecting to Railway database...');
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'mysql',
    dialectOptions: {
      ssl: {
        rejectUnauthorized: false
      }
    },
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    retry: {
      max: 3,
      timeout: 60000
    }
  });
} else {
  // Development - Local or fallback
  console.log('Connecting to local database...');
  sequelize = new Sequelize(
    process.env.DB_NAME || 'ncdb_mart',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      dialect: 'mysql',
      logging: false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    }
  );
}

// Test connection with better error handling
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error.message);

    // Provide specific guidance based on error
    if (error.original) {
      console.error('Original error code:', error.original.code);

      if (error.original.code === 'ETIMEDOUT') {
        console.log('💡 Solution: Check if your database server is running and accessible');
      } else if (error.original.code === 'ER_ACCESS_DENIED_ERROR') {
        console.log('💡 Solution: Check your database credentials');
      } else if (error.original.code === 'ECONNREFUSED') {
        console.log('💡 Solution: Database server is not running or port is blocked');
      }
    }

    return false;
  }
};

export { sequelize, testConnection };
export default sequelize;