import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/users.js';
import { getRoleNameById } from '../controllers/roleController.js';

const protect = asyncHandler(async (req, res, next) => {
  let token;
  token = req.cookies.jwt;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.userID);
      if (!user) {
        res.status(401);
        throw new Error('Not authorized, user not found');
      }
      req.user = user;
      next();
    } catch (error) {
      res.status(401);
      throw new Error('Not authorized, Invalid token');
    }
  } else {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

const authorize = (...allowedRoles) => {
  return asyncHandler(async (req, res, next) => {
    const role_id = req.user?.role_id;
    if (!role_id) {
      res.status(401);
      throw new Error('Missing or invalid role ID');
    }

    const roleName = await getRoleNameById(role_id);
    if (!roleName) {
      res.status(404);
      throw new Error('Role not found');
    }

    const normalizedRoles = allowedRoles.map(r => r.toLowerCase());
    if (!normalizedRoles.includes(roleName.toLowerCase())) {
      res.status(403);
      throw new Error('Access denied: insufficient permissions');
    }

    next();
  });
};


export { protect, authorize };