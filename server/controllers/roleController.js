// controllers/roleController.js
import { Role, User, Supplier } from "../models/index.js";
import asyncHandler from 'express-async-handler';

// Create role
export const createRole = asyncHandler(async (req, res) => {
  const { name } = req.body;
  if (!name || name.trim() === '') {
    res.status(400);
    throw new Error('Name must be a non-empty string');
  }

  const role = await Role.create({ name });
  res.status(201).json({ message: 'Role created successfully', role });
});

// Get all roles
export const getAllRoles = asyncHandler(async (req, res) => {
  const roles = await Role.findAll();
  res.status(200).json({
    success: true,
    data: roles,
  });
});

// Get role by ID (UUID)
export const getRoleById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const role = await Role.findByPk(id);

  if (!role) {
    res.status(404);
    throw new Error('Role not found');
  }

  res.status(200).json(role);
});

// Get role name by ID (for internal use)
export const getRoleNameById = async (id) => {
  const role = await Role.findByPk(id);
  return role ? role.name : null;
};

// Helper function to create supplier for user
const createSupplierForUser = async (user) => {
  try {
    const existingSupplier = await Supplier.findOne({
      where: { email: user.email }
    });

    if (existingSupplier) {
      return existingSupplier;
    }

    const supplier = await Supplier.create({
      name: user.name,
      email: user.email,
      contact_number: user.contact_number,
      address: user.address
    });

    console.log('✅ Auto-created supplier for user:', user.email);
    return supplier;
  } catch (error) {
    console.error('❌ Error creating supplier for user:', error);
    throw error;
  }
};

// Helper function to delete supplier for user
const deleteSupplierForUser = async (user) => {
  try {
    const supplier = await Supplier.findOne({
      where: { email: user.email }
    });

    if (supplier) {
      await supplier.destroy();
      console.log('🗑️ Auto-deleted supplier for user:', user.email);
      return true;
    }
    return false;
  } catch (error) {
    console.error('❌ Error deleting supplier for user:', error);
    throw error;
  }
};

// Update user role with auto supplier management
export const updateUserRole = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { role_id } = req.body;

  if (!role_id) {
    res.status(400);
    throw new Error('Role ID is required');
  }

  const user = await User.findByPk(userId);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const newRole = await Role.findByPk(role_id);
  if (!newRole) {
    res.status(404);
    throw new Error('Role not found');
  }

  const currentRoleName = await getRoleNameById(user.role_id);
  const newRoleName = newRole.name;

  console.log(`🔄 Changing role for ${user.email}: ${currentRoleName} → ${newRoleName}`);

  // Store old role for comparison
  const oldRoleId = user.role_id;

  // Update user role
  await user.update({ role_id });

  // Handle supplier creation/deletion based on role changes
  if (newRoleName === 'Supplier' && currentRoleName !== 'Supplier') {
    // User is being assigned Supplier role - create supplier
    try {
      const supplier = await createSupplierForUser(user);
      console.log(`✅ Created supplier for new supplier user: ${user.email}`);
    } catch (error) {
      console.error('⚠️ Failed to create supplier, but user role was updated:', error);
    }
  } else if (newRoleName !== 'Supplier' && currentRoleName === 'Supplier') {
    // User is being removed from Supplier role - delete supplier
    try {
      await deleteSupplierForUser(user);
      console.log(`🗑️ Removed supplier for user no longer in supplier role: ${user.email}`);
    } catch (error) {
      console.error('⚠️ Failed to delete supplier, but user role was updated:', error);
    }
  }

  const updatedUser = await User.findByPk(userId, {
    attributes: { exclude: ['password'] },
    include: ['role']
  });

  res.json({
    success: true,
    data: updatedUser,
    message: `User role updated to ${newRoleName} successfully`
  });
});

// Bulk update user roles with supplier management
export const bulkUpdateUserRoles = asyncHandler(async (req, res) => {
  const { users, role_id } = req.body;

  if (!users || !Array.isArray(users) || users.length === 0) {
    res.status(400);
    throw new Error('Users array is required');
  }

  if (!role_id) {
    res.status(400);
    throw new Error('Role ID is required');
  }

  const newRole = await Role.findByPk(role_id);
  if (!newRole) {
    res.status(404);
    throw new Error('Role not found');
  }

  const newRoleName = newRole.name;
  const results = [];

  for (const userId of users) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        results.push({ userId, status: 'ERROR', message: 'User not found' });
        continue;
      }

      const currentRoleName = await getRoleNameById(user.role_id);

      // Update user role
      await user.update({ role_id });

      // Handle supplier management
      if (newRoleName === 'Supplier' && currentRoleName !== 'Supplier') {
        try {
          await createSupplierForUser(user);
          results.push({ userId, status: 'SUCCESS', message: `Role updated to ${newRoleName} and supplier created` });
        } catch (error) {
          results.push({ userId, status: 'WARNING', message: `Role updated but supplier creation failed: ${error.message}` });
        }
      } else if (newRoleName !== 'Supplier' && currentRoleName === 'Supplier') {
        try {
          await deleteSupplierForUser(user);
          results.push({ userId, status: 'SUCCESS', message: `Role updated to ${newRoleName} and supplier removed` });
        } catch (error) {
          results.push({ userId, status: 'WARNING', message: `Role updated but supplier deletion failed: ${error.message}` });
        }
      } else {
        results.push({ userId, status: 'SUCCESS', message: `Role updated to ${newRoleName}` });
      }

    } catch (error) {
      results.push({ userId, status: 'ERROR', message: error.message });
    }
  }

  res.json({
    success: true,
    message: `Processed ${users.length} users`,
    results: results
  });
});

// Fix missing suppliers for existing supplier users
export const fixMissingSuppliers = asyncHandler(async (req, res) => {
  // Get supplier role ID first
  const supplierRole = await Role.findOne({ where: { name: 'Supplier' } });
  if (!supplierRole) {
    res.status(404);
    throw new Error('Supplier role not found in database');
  }

  // Get all users with supplier role
  const supplierUsers = await User.findAll({
    where: { role_id: supplierRole.id }
  });

  const results = [];

  for (const user of supplierUsers) {
    try {
      const existingSupplier = await Supplier.findOne({
        where: { email: user.email }
      });

      if (existingSupplier) {
        results.push({
          user: user.email,
          status: 'EXISTS',
          supplierId: existingSupplier.id
        });
      } else {
        const supplier = await Supplier.create({
          name: user.name,
          email: user.email,
          contact_number: user.contact_number,
          address: user.address
        });
        results.push({
          user: user.email,
          status: 'CREATED',
          supplierId: supplier.id
        });
      }
    } catch (error) {
      results.push({
        user: user.email,
        status: 'ERROR',
        error: error.message
      });
    }
  }

  res.json({
    success: true,
    message: `Processed ${supplierUsers.length} supplier users`,
    results: results
  });
});

// Update role
export const updateRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name || name.trim() === '') {
    res.status(400);
    throw new Error('Name must be a non-empty string');
  }

  const role = await Role.findByPk(id);
  if (!role) {
    res.status(404);
    throw new Error('Role not found');
  }

  await role.update({ name });
  res.status(200).json({ message: 'Role updated successfully', role });
});

// Delete role
export const deleteRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const role = await Role.findByPk(id);

  if (!role) {
    res.status(404);
    throw new Error('Role not found');
  }

  await role.destroy();
  res.status(200).json({ message: 'Role deleted successfully' });
});