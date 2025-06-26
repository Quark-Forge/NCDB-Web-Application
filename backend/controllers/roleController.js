import Role from "../models/roles.js";
import asyncHandler from 'express-async-handler';

// Create role
export const createRole = asyncHandler(async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            res.status(400);
            throw new Error('Name is required');
        }
        const role = await Role.create({ name });
        res.status(201).json('Role created successfully');
        
    } catch (error) {
        throw new Error('Error creating new role');
    }
});

// Get all the roles
export const getAllRoles = asyncHandler(async (req, res) => {
    try {
        const roles = await Role.findAll();
        res.status(200).json(roles);
    } catch (error) {
        res.status(500);
        throw new Error('Error fetching roles');
    }
});

// Get role by id
export const getRoleById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const role = await Role.findByPk(id);
    if (!role) {
      res.status(404);
      throw new Error('Role not found');
    }
    res.status(200).json(role);
  } catch (error) {
    res.status(400);
    throw new Error('Error fetching role');
  }
};

export const getRoleNameById = async (id) => {
  const role = await Role.findByPk(id);
  return role ? role.name : null;
};

// Update a role
export const updateRole = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name } = req.body;
    const role = await Role.findByPk(id);
    if (!role) {
      res.status(404);
      throw new Error('Role not found');
    }
    if (!name) {
      res.status(400);
      throw new Error('Name is required');
    }
    await role.update({ name });
    res.status(200).json({ message: 'Role updated successfully', role });
  } catch (error) {
    console.log(error);
    
    res.status(500);
    throw new Error('Error updating role');
  }
};

// Delete a role
export const deleteRole = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const role = await Role.findByPk(id);
    if (!role) {
      res.status(404);
      throw new Error('Role not found');
    }
    await role.destroy();
    res.status(200).json({ message: 'Role deleted successfully' });
  } catch (error) {
    res.status(500);
    throw new Error('Error deleting role');
  }
};