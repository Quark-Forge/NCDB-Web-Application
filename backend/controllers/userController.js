import asyncHandler from 'express-async-handler';
import { createUser, getUserByEmail, getUser, updateUser } from '../models/userModel.js';
import { hashPassword, matchPassword } from '../utils/hash.js';
import generateToken from '../utils/generateToken.js';

// @desc Auth user/set token
// route POST /api/users/auth
// @access Public
const authUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const existingUser = await getUserByEmail(email);

    if (existingUser && await matchPassword(password, existingUser.password)) {
        const { id, name, email, role } = existingUser;
        generateToken(res, id);
        return res.status(200).json({ id, name, email, role });
    }
    res.status(401);
    throw new Error('Invalid email or password');

});

// @desc  Register a new User
// route POST /api/users
// @access Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    const existingUser = await getUserByEmail(email);

    if (existingUser) {
        res.status(400);
        throw new Error('User already exists');
    }
    const hashedPassword = await hashPassword(password);
    const user = await createUser({ name, email, password: hashedPassword });

    generateToken(res, user.insertId);
    res.status(201).json({ message: 'User created', id: user.insertId });
});

// @desc Logout User
// route POST /api/users/logout
// @access Public
const logoutUser = asyncHandler(async (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0),
    });
    res.json({ message: 'User logged out' });
});

// @desc  Get User Profile
// route Get /api/users/profile
// @access Private
const getUserProfile = asyncHandler(async (req, res) => {
    const user = {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role
    };
    res.status(200).json({ user });
});

// @desc Update User Profile
// @route PUT /api/users/profile
// @access Private
const updateUserProfile = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    const user = await getUser(req.user.id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }
    let hashedPassword = user.password;
    if (password) {
        hashedPassword = await hashPassword(password);
    }
    await updateUser(user.id, {
        name: name || user.name,
        email: email || user.email,
        password: hashedPassword,
    });
    const updatedUser = await getUser(req.user.id);
    res.status(200).json({
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
    });
});

export {
    authUser,
    registerUser,
    logoutUser,
    getUserProfile,
    updateUserProfile,
};