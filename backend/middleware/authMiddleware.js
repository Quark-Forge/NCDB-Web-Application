import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/users.js';
import { getRoleNameById } from '../controllers/roleController.js';

const protect = asyncHandler(async (req, res, next) =>{
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
  return async (req, res, next) => {
    try {
      const role_id = Number(req.user?.role_id);
      if (!role_id) {
        return res.status(401).json({ message: 'Missing or invalid role ID' });
      }

      const roleName = await getRoleNameById(role_id);
      if (!roleName) {
        return res.status(404).json({ message: 'Role not found' });
      }

      if (!allowedRoles.includes(roleName)) {
        return res.status(403).json({ message: 'Access denied: insufficient permissions' });
      }

      next();
    } catch (error) {
      console.error('Authorization error:', error);
      res.status(500).json({ message: 'Server error during authorization' });
    }
  };
};


export { protect, authorize };