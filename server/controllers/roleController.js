import { Role } from "../models/index.js";
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
  const { id } = req.params; // UUID is a string
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