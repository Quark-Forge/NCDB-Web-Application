import asyncHandler from "express-async-handler";
import { Supplier, User, Role } from "../models/index.js";
import { hashPassword } from "../utils/hash.js";
import { sendUserCredentials } from "../utils/sendEmail.js";
import { supplierCredentialsTemplate } from "../templates/emailTemplates.js";

// Helper to format supplier response
const formatSupplierResponse = (supplier) => ({
  id: supplier.id,
  name: supplier.name,
  contact_number: supplier.contact_number,
  email: supplier.email,
  address: supplier.address,
  user_id: supplier.user_id,
  createdAt: supplier.createdAt,
  updatedAt: supplier.updatedAt,
  deletedAt: supplier.deletedAt,
  user: supplier.User ? {
    id: supplier.User.id,
    email: supplier.User.email,
    is_verified: supplier.User.is_verified,
    role_id: supplier.User.role_id
  } : undefined
});

// Helper function to get supplier role ID
const getSupplierRoleId = async () => {
  const supplierRole = await Role.findOne({ where: { name: 'Supplier' } });
  if (!supplierRole) {
    throw new Error('Supplier role not found in database');
  }
  return supplierRole.id;
};

// Add new supplier
export const addSupplier = asyncHandler(async (req, res) => {
  const { name, contact_number, address, email, password, role_id } = req.body;

  // Validate required fields
  if (!name || !contact_number || !address || !password) {
    res.status(400);
    throw new Error('Name, contact number, address and password are required');
  }

  // Check for existing supplier by contact number
  const existingSupplier = await Supplier.findOne({
    where: { contact_number }
  });

  if (existingSupplier) {
    res.status(409);
    throw new Error('Supplier with this contact number already exists');
  }

  // Check for existing user with same email
  if (email) {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      res.status(409);
      throw new Error('User with this email already exists');
    }
  }

  let newSupplier;
  let userAccount;

  try {
    // Start a transaction to ensure both operations succeed or fail together
    const result = await Supplier.sequelize.transaction(async (t) => {
      // Hash the password before storing
      const hashedPassword = await hashPassword(password);

      // Create user first
      userAccount = await User.create({
        name,
        email: email || `${contact_number}@supplier.temp`,
        contact_number,
        address,
        password: hashedPassword,
        is_verified: true,
        role_id: role_id || await getSupplierRoleId()
      }, { transaction: t });

      // Create supplier with user_id
      newSupplier = await Supplier.create({
        name,
        contact_number,
        address,
        email: email || `${contact_number}@supplier.temp`,
        user_id: userAccount.id,
        is_active: true
      }, { transaction: t });

      return newSupplier;
    });

    // Fetch the complete supplier with user data
    const completeSupplier = await Supplier.findByPk(result.id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'email', 'is_verified', 'role_id']
      }]
    });

    // Send email with credentials to supplier
    try {
      const loginUrl = `${process.env.FRONTEND_URL}/auth/login`;
      const htmlMessage = supplierCredentialsTemplate(
        name,
        userAccount.email,
        password, // Send the plain password (this is the only time it's available)
        loginUrl
      );

      await sendUserCredentials(userAccount.email, 'Your Supplier Account Credentials', htmlMessage);

      console.log(`Supplier credentials email sent to: ${userAccount.email}`);
    } catch (emailError) {
      console.error('Failed to send supplier credentials email:', emailError);
      // Don't throw error, just log it - the supplier was created successfully
    }

    res.status(201).json({
      message: 'Supplier created successfully. Login credentials have been sent to the supplier.',
      data: formatSupplierResponse(completeSupplier)
    });

  } catch (error) {
    // If there was an error and we created the user, clean up
    if (userAccount) {
      try {
        await User.destroy({ where: { id: userAccount.id }, force: true });
      } catch (cleanupError) {
        console.error('Error cleaning up user account:', cleanupError);
      }
    }

    if (error.name === 'SequelizeUniqueConstraintError') {
      res.status(409);
      throw new Error('Duplicate entry - contact number or email already exists');
    }
    throw error;
  }
});

// Update existing supplier
export const updateSupplier = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, address, contact_number, email, is_active, password } = req.body;

  // Find supplier with user data
  const supplier = await Supplier.findByPk(id, {
    include: [{
      model: User,
      as: 'user'
    }]
  });

  if (!supplier) {
    res.status(404);
    throw new Error('Supplier not found');
  }

  // Check for duplicate contact number
  if (contact_number && contact_number !== supplier.contact_number) {
    const contactExists = await Supplier.findOne({ where: { contact_number } });
    if (contactExists) {
      res.status(409);
      throw new Error('Another supplier already uses this contact number');
    }
  }

  // Check for duplicate email
  if (email && email !== supplier.email) {
    const emailExists = await Supplier.findOne({ where: { email } });
    if (emailExists) {
      res.status(409);
      throw new Error('Another supplier already uses this email');
    }

    // Also check if email exists in users table
    const userEmailExists = await User.findOne({ where: { email } });
    if (userEmailExists && userEmailExists.id !== supplier.user_id) {
      res.status(409);
      throw new Error('Another user already uses this email');
    }
  }

  try {
    await Supplier.sequelize.transaction(async (t) => {
      // Update supplier
      supplier.name = name || supplier.name;
      supplier.address = address || supplier.address;
      supplier.contact_number = contact_number || supplier.contact_number;
      if (email) supplier.email = email;
      if (is_active !== undefined) supplier.is_active = is_active;

      await supplier.save({ transaction: t });

      // Update associated user
      if (supplier.user) {
        supplier.user.name = name || supplier.user.name;
        supplier.user.address = address || supplier.user.address;
        supplier.user.contact_number = contact_number || supplier.user.contact_number;
        if (email) supplier.user.email = email;

        // Hash password if provided
        if (password) {
          supplier.user.password = await hashPassword(password);
        }

        await supplier.user.save({ transaction: t });
      }
    });

    // Reload supplier with updated user data
    await supplier.reload({
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'email', 'is_verified', 'role_id']
      }]
    });

    res.status(200).json({
      success: true,
      message: 'Supplier updated successfully',
      data: formatSupplierResponse(supplier)
    });

  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      res.status(409);
      throw new Error('Duplicate entry - contact number or email already exists');
    }
    throw error;
  }
});

// Delete (or deactivate) supplier
export const removeSupplier = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { deleteUser = false } = req.body; // Option to also delete user account

  const supplier = await Supplier.findByPk(id, {
    include: [{
      model: User,
      as: 'user'
    }]
  });

  if (!supplier) {
    res.status(404);
    throw new Error('Supplier not found');
  }

  try {
    await Supplier.sequelize.transaction(async (t) => {
      // Soft delete supplier
      await supplier.destroy({ transaction: t });

      // Optionally soft delete user account
      if (deleteUser && supplier.user) {
        await supplier.user.destroy({ transaction: t });
      }
    });

    res.status(200).json({
      success: true,
      message: deleteUser
        ? 'Supplier and user account removed successfully'
        : 'Supplier removed successfully (user account preserved)',
      data: { id }
    });

  } catch (error) {
    res.status(500);
    throw new Error('Failed to remove supplier: ' + error.message);
  }
});

// Restore a soft-deleted supplier
export const restoreSupplier = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { restoreUser = false } = req.body;

  // Include soft-deleted records
  const supplier = await Supplier.findByPk(id, {
    paranoid: false,
    include: [{
      model: User,
      as: 'user',
      paranoid: false
    }]
  });

  if (!supplier) {
    res.status(404);
    throw new Error('Supplier not found');
  }

  // If not deleted, nothing to restore
  if (!supplier.deletedAt) {
    res.status(400);
    throw new Error('Supplier is not deleted');
  }

  try {
    await Supplier.sequelize.transaction(async (t) => {
      // Restore the supplier
      await supplier.restore({ transaction: t });

      // Optionally restore user account
      if (restoreUser && supplier.user && supplier.user.deletedAt) {
        await supplier.user.restore({ transaction: t });
      }
    });

    // Reload to get current timestamps/state
    await supplier.reload({
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'email', 'is_verified', 'role_id']
      }]
    });

    res.status(200).json({
      success: true,
      message: restoreUser
        ? 'Supplier and user account restored successfully'
        : 'Supplier restored successfully',
      data: formatSupplierResponse(supplier)
    });

  } catch (error) {
    res.status(500);
    throw new Error('Failed to restore supplier: ' + error.message);
  }
});

// Get all active suppliers
export const getAllActiveSuppliers = asyncHandler(async (req, res) => {
  const suppliers = await Supplier.findAll({
    include: [{
      model: User,
      as: 'user',
      attributes: ['id', 'email', 'is_verified', 'role_id']
    }],
    order: [['createdAt', 'DESC']]
  });

  res.status(200).json({
    success: true,
    count: suppliers.length,
    data: suppliers.map(formatSupplierResponse)
  });
});

// Get all suppliers (including inactive/soft-deleted)
export const getAllSuppliers = asyncHandler(async (req, res) => {
  const suppliers = await Supplier.findAll({
    include: [{
      model: User,
      as: 'user',
      attributes: ['id', 'email', 'is_verified', 'role_id']
    }],
    order: [['createdAt', 'DESC']],
    paranoid: false,
  });

  res.status(200).json({
    success: true,
    count: suppliers.length,
    data: suppliers.map(formatSupplierResponse)
  });
});

// Get single supplier
export const getSupplier = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const supplier = await Supplier.findByPk(id, {
    include: [{
      model: User,
      as: 'user',
      attributes: ['id', 'email', 'is_verified', 'role_id']
    }]
  });

  if (!supplier) {
    res.status(404);
    throw new Error('Supplier not found');
  }

  res.status(200).json({
    success: true,
    data: formatSupplierResponse(supplier)
  });
});