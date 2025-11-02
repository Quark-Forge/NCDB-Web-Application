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

// Add this function to check if setup is needed
async function needsInitialSetup() {
  try {
    // Check if users table exists
    const [results] = await sequelize.query(`
      SELECT COUNT(*) as table_count 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name = 'users'
    `);

    return results[0].table_count === 0;
  } catch (error) {
    // If query fails, assume setup is needed
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
        address: 'Temp Address'
      }, { transaction });

      if (!process.env.INITIAL_ADMIN_PASSWORD) {
        console.warn(`\n⚠️ Temporary admin password: ${tempPassword}\n` +
          `⚠️ Please change this immediately after login!`);
      }
      console.log('✅ Admin user created');
    } else {
      console.log('✅ Admin user already exists');
    }

    await transaction.commit();
    console.log('🎉 Database initialized with default data');
  } catch (error) {
    await transaction.rollback();
    console.error('Initialization failed:', error);
    throw error;
  }
}

async function syncModels() {
  try {
    console.log('🔄 Syncing database models...');

    // Temporary disable foreign key checks
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');

    // Verify essential models are registered
    if (!Role || !User) {
      throw new Error('Essential models not registered');
    }

    // Sync in proper hierarchical order
    await Role.sync({ force: false });
    await User.sync({ force: false });

    // Sync independent models
    await Category.sync({ force: false });
    await Product.sync({ force: false });
    await Supplier.sync({ force: false });

    // Sync models that depend only on User
    await ShippingCost.sync({ force: false });
    await Address.sync({ force: false });
    await Cart.sync({ force: false });
    await Wishlist.sync({ force: false });

    // Sync Payment first, then Order
    await Payment.sync({ force: false });
    await Order.sync({ force: false });

    // Sync SupplierItem before SupplierItemRequest
    await SupplierItem.sync({ force: false });

    // Sync SupplierItemRequest after all its dependencies
    await SupplierItemRequest.sync({ force: false });

    // Sync junction/association models last
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
    // Verify database connection
    await sequelize.authenticate();
    console.log('Database connection established');

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
    console.table(roles.map(r => r.toJSON()));

    if (admin) {
      console.log('\nAdmin user:');
      console.table([{
        name: admin.name,
        email: admin.email,
        role: admin.Role.name,
        verified: admin.is_verified
      }]);
    } else {
      console.warn('\nAdmin user not found');
    }

    console.log('Database setup completed successfully');
    return true;
  } catch (error) {
    console.error('Database setup failed:', error);
    throw error;
  }
}