import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import { getUser } from '../models/userModel.js';

const protect = asyncHandler(async (req, res, next) =>{
    let token;
    token = req.cookies.jwt;
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await getUser(decoded.userID);
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

export { protect };