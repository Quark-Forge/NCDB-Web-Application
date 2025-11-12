import asyncHandler from "express-async-handler";
import { Supplier } from "../models/index.js";

// Helper to format supplier response
const formatSupplierResponse = (supplier) => ({
  id: supplier.id,
  name: supplier.name,
  contact_number: supplier.contact_number,
  email: supplier.email,
  address: supplier.address,
  createdAt: supplier.createdAt,
  updatedAt: supplier.updatedAt,
  deletedAt: supplier.deletedAt,
});

// Add new supplier
export const addSupplier = asyncHandler(async (req, res) => {
  const { name, contact_number, address, email } = req.body;

  // Validate required fields
  if (!name || !contact_number || !address) {
    res.status(400);
    throw new Error('Name, contact number and address are required');
  }

  // Check for existing supplier by contact number or email
  const existingSupplier = await Supplier.findOne({
    where: {
        contact_number,
        email
    }
  });

  if (existingSupplier) {
    res.status(409); // 409 Conflict for duplicate resources
    throw new Error(existingSupplier.contact_number === contact_number
      ? 'Supplier with this contact number already exists'
      : 'Supplier with this email already exists');
  }

  // Create new supplier
  const newSupplier = await Supplier.create({
    name,
    contact_number,
    address,
    email,
    is_active: true
  });

  res.status(201).json({
    message: 'Supplier created successfully',
    data: formatSupplierResponse(newSupplier)
  });
});

// Update existing supplier
export const updateSupplier = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, address, contact_number, email, is_active } = req.body;
  
  // Find supplier
  const supplier = await Supplier.findByPk(id);
  if (!supplier) {
    res.status(404);
    throw new Error('Supplier not found');
  }

  // Check for duplicate contact number or email
  if (contact_number !== supplier.contact_number) {
    const contactExists = await Supplier.findOne({ where: { contact_number } });
    if (contactExists) {
      res.status(409);
      throw new Error('Another supplier already uses this contact number');
    }
  }

  if (email && email !== supplier.email) {
    const emailExists = await Supplier.findOne({ where: { email } });
    if (emailExists) {
      res.status(409);
      throw new Error('Another supplier already uses this email');
    }
  }

  // Update supplier
  supplier.name = name || supplier.name;
  supplier.address = address || supplier.address;
  supplier.contact_number = contact_number || supplier.contact_number;
  if (email) supplier.email = email;
  if (is_active !== undefined) supplier.is_active = is_active;

  await supplier.save();

  res.status(200).json({
    success: true,
    message: 'Supplier updated successfully',
    data: formatSupplierResponse(supplier)
  });
});

// Delete (or deactivate) supplier
export const removeSupplier = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const supplier = await Supplier.findByPk(id);
  if (!supplier) {
    res.status(404);
    throw new Error('Supplier not found');
  }

  // For soft delete (if paranoid is enabled)
  await supplier.destroy();

  // Alternative for deactivation instead of deletion:
  // supplier.is_active = false;
  // await supplier.save();

  res.status(200).json({
    success: true,
    message: 'Supplier removed successfully',
    data: { id }
  });
});

// Restore a soft-deleted supplier
export const restoreSupplier = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // include soft-deleted records
  const supplier = await Supplier.findByPk(id, { paranoid: false });
  if (!supplier) {
    res.status(404);
    throw new Error('Supplier not found');
  }

  // If not deleted, nothing to restore
  if (!supplier.deletedAt) {
    res.status(400);
    throw new Error('Supplier is not deleted');
  }

  // Restore the supplier (works when model is paranoid)
  await supplier.restore();

  // reload to get current timestamps/state
  await supplier.reload();

  res.status(200).json({
    success: true,
    message: 'Supplier restored successfully',
    data: formatSupplierResponse(supplier)
  });
});

// Get all active suppliers
export const getAllActiveSuppliers = asyncHandler(async (req, res) => {
  const suppliers = await Supplier.findAll({
    order: [['createdAt', 'DESC']]
  });

  res.status(200).json({
    success: true,
    count: suppliers.length,
    data: suppliers.map(formatSupplierResponse)
  });
});
// Get all suppliers
export const getAllSuppliers = asyncHandler(async (req, res) => {
  const suppliers = await Supplier.findAll({
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

  const supplier = await Supplier.findByPk(id);
  if (!supplier) {
    res.status(404);
    throw new Error('Supplier not found');
  }

  res.status(200).json({
    success: true,
    data: formatSupplierResponse(supplier)
  });
});