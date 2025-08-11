// server/scripts/initDatabase.js
import { sequelize } from '../models/index.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const DEFAULT_ROLES = [
  { name: 'Admin'},
  { name: 'Customer'},
  { name: 'Inventory Manager'},
  { name: 'Order Manager'}
];

async function initializeData() {
  const transaction = await sequelize.transaction();
  try {
    // Create roles if they don't exist
    for (const role of DEFAULT_ROLES) {
      await sequelize.models.Role.findOrCreate({
        where: { name: role.name },
        defaults: role,
        transaction
      });
    }

    // Create admin user if doesn't exist
    const adminEmail = process.env.INITIAL_ADMIN_EMAIL || 'admin@ncdbmart.com';
    const adminExists = await sequelize.models.User.findOne({
      where: { email: adminEmail },
      transaction
    });

    if (!adminExists) {
      const tempPassword = process.env.INITIAL_ADMIN_PASSWORD || crypto.randomBytes(12).toString('hex');
      const hashedPassword = await bcrypt.hash(tempPassword, 12);
      const adminRole = await sequelize.models.Role.findOne({
        where: { name: 'Admin' },
        transaction
      });

      await sequelize.models.User.create({
        name: 'System Admin',
        email: adminEmail,
        password: hashedPassword,
        role_id: adminRole.id,
        is_verified: true,
        contact_number: '0771234567',
        address: 'Temp Address'
      }, { transaction });

      if (!process.env.INITIAL_ADMIN_PASSWORD) {
        console.warn(`\n⚠️ Temporary admin password: ${tempPassword}\n` +
                    `⚠️ Please change this immediately after login!`);
      }
    }

    await transaction.commit();
    console.log('Database initialized with default data');
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

async function setupDatabase() {
  try {
    // First create tables
    await sequelize.sync({ alter: true });
    console.log('Tables synchronized successfully');
    
    // Then initialize data
    await initializeData();
    
    // Verify the data
    const roles = await sequelize.models.Role.findAll();
    const admin = await sequelize.models.User.findOne({
      where: { email: process.env.INITIAL_ADMIN_EMAIL || 'admin@ncdbmart.com' },
      include: [{ model: sequelize.models.Role }]
    });

    console.log('\nCurrent roles:');
    console.table(roles.map(r => r.toJSON()));
    
    console.log('\nAdmin user:');
    if (admin) {
      console.table([{
        name: admin.name,
        email: admin.email,
        role: admin.Role.name,
        verified: admin.is_verified
      }]);
    }
  } catch (error) {
    console.error('Database setup failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run the complete setup
setupDatabase();