import {
  sequelize,
  Role,
  User,
  Cart,
  Order,
  Category,
  Product,
  Supplier,
  Wishlist,
  WishlistItem,
  CartItem,
  OrderItem,
  Payment,
  SupplierItem,
  SupplierItemRequest,
  ShippingCost,
  Address
} from '../models/index.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const DEFAULT_ROLES = [
  { name: 'Admin' },
  { name: 'Customer' },
  { name: 'Inventory Manager' },
  { name: 'Order Manager' },
  { name: 'Supplier' }
];

// Check if setup is needed
async function needsInitialSetup() {
  try {
    // Check if users table exists and has data
    const userCount = await User.count();
    return userCount === 0;
  } catch (error) {
    // If query fails, assume setup is needed
    console.log('Setup check failed, assuming first-time setup:', error.message);
    return true;
  }
}

async function initializeData() {
  const transaction = await sequelize.transaction();
  try {
    console.log('Initializing default data...');

    // Create roles if they don't exist
    for (const role of DEFAULT_ROLES) {
      await Role.findOrCreate({
        where: { name: role.name },
        defaults: role,
        transaction
      });
    }
    console.log('Default roles created');

    // Create admin user if doesn't exist
    const adminEmail = process.env.INITIAL_ADMIN_EMAIL || 'admin@ncdbmart.com';
    const adminExists = await User.findOne({
      where: { email: adminEmail },
      transaction
    });

    if (!adminExists) {
      const tempPassword = process.env.INITIAL_ADMIN_PASSWORD || crypto.randomBytes(12).toString('hex');
      const hashedPassword = await bcrypt.hash(tempPassword, 12);
      const adminRole = await Role.findOne({
        where: { name: 'Admin' },
        transaction
      });

      if (!adminRole) {
        throw new Error('Admin role not found in database');
      }

      await User.create({
        name: 'System Admin',
        email: adminEmail,
        password: hashedPassword,
        role_id: adminRole.id,
        is_verified: true,
        contact_number: '0771234567',
        address: 'System Address'
      }, { transaction });

      if (!process.env.INITIAL_ADMIN_PASSWORD) {
        console.warn(`\n⚠️  Temporary admin password: ${tempPassword}`);
        console.warn(`⚠️  Please change this immediately after login!\n`);
      } else {
        console.log('Admin user created with provided password');
      }
    } else {
      console.log('Admin user already exists');
    }

    await transaction.commit();
    console.log('Database initialized with default data');
  } catch (error) {
    await transaction.rollback();
    console.error('Initialization failed:', error);
    throw error;
  }
}

async function syncModels() {
  try {
    console.log('Syncing database models...');

    // Disable foreign key checks temporarily
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');

    // Sync in proper hierarchical order
    await Role.sync({ force: false });
    await User.sync({ force: false });
    await Category.sync({ force: false });
    await Product.sync({ force: false });
    await Supplier.sync({ force: false });
    await ShippingCost.sync({ force: false });
    await Address.sync({ force: false });
    await Cart.sync({ force: false });
    await Wishlist.sync({ force: false });
    await Payment.sync({ force: false });
    await Order.sync({ force: false });
    await SupplierItem.sync({ force: false });
    await SupplierItemRequest.sync({ force: false });
    await WishlistItem.sync({ force: false });
    await CartItem.sync({ force: false });
    await OrderItem.sync({ force: false });

    // Re-enable foreign key checks
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('All models synchronized successfully');
  } catch (error) {
    console.error('Model synchronization failed:', error);
    throw error;
  }
}

export async function setupDatabase() {
  try {
    console.log('🔄 Starting database setup...');

    // Verify database connection first
    await sequelize.authenticate();
    console.log('Database connection verified');

    // Check if setup is already done
    const requiresSetup = await needsInitialSetup();

    if (!requiresSetup) {
      console.log('Database already set up - skipping initialization');
      return true;
    }

    console.log('First-time setup detected - initializing database...');

    // Sync models in correct order
    await syncModels();

    // Initialize default data
    await initializeData();

    // Verification
    const roles = await Role.findAll();
    const admin = await User.findOne({
      where: { email: process.env.INITIAL_ADMIN_EMAIL || 'admin@ncdbmart.com' },
      include: [{ model: Role }]
    });

    console.log('\nCurrent roles:');
    console.table(roles.map(r => ({ id: r.id, name: r.name })));

    if (admin) {
      console.log('\n👤 Admin user created:');
      console.table([{
        name: admin.name,
        email: admin.email,
        role: admin.Role.name,
        verified: admin.is_verified
      }]);
    } else {
      console.warn('\nAdmin user not found after setup');
    }

    console.log('Database setup completed successfully');
    return true;
  } catch (error) {
    console.error('Database setup failed:', error);
    throw error;
  }
}