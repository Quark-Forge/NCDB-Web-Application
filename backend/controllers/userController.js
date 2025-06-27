import asyncHandler from 'express-async-handler';
import User from '../models/users.js';
import { hashPassword, matchPassword } from '../utils/hash.js';
import generateToken from '../utils/generateToken.js';
import { sendUserCredentials } from '../utils/sendEmail.js';
import Role from '../models/roles.js';


// Get all users
// Protected - Admin Only
const getUsers = asyncHandler(async (req, res) => {
    const users = await User.findAll({
        attributes: { exclude: ['password'] }
    });
    res.status(200).json(users);
});

// Auth user/set token
// Public
const authUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser && await matchPassword(password, existingUser.password)) {
        const { id, name, email, contact_number, address, role, } = existingUser;
        generateToken(res, id);
        return res.status(200).json({ id, name, email, contact_number, address, role });
    }
    res.status(401);
    throw new Error('Invalid email or password');

});

// Register a new User
// Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, contact_number, address } = req.body;
    if (!name || !email || !password || !contact_number || !address) {
        res.status(400);
        throw new Error('All fields are required');
    }
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
        res.status(400);
        throw new Error('User already exists');
    }
    const hashedPassword = await hashPassword(password);
    const role = await Role.findOne({ where: { name: 'Customer' } });
    const newUser = await User.create({
        name,
        email,
        contact_number,
        address,
        password: hashedPassword,
        role_id: role.id,
    });
    generateToken(res, newUser.id);
    res.status(201).json({
        message: 'User created',
        user: {
            id: newUser.id,
            name,
            email,
            contact_number,
            address,
        },
    });
});

// Logout User
// Public
const logoutUser = asyncHandler(async (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0),
    });
    res.json({ message: 'User logged out' });
});

// Get User Profile
// Private
const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findByPk(req.user.id, {
        attributes: { exclude: ['password'] }
    });

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }
    res.status(200).json({ user });
});

// Update User Profile
// Private
const updateUserProfile = asyncHandler(async (req, res) => {
    const { name, email, password, contact_number, address } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }
    
    if (password) {
        user.password = await hashPassword(password);
    }
    user.name = name || user.name;
    user.email = email || user.email;
    user.contact_number = contact_number || user.contact_number;
    user.address = address || user.address;

    await user.save();

    res.status(200).json({
        id: user.id,
        name: user.name,
        email: user.email,
        contact_number: user.contact_number,
        address: user.address,
    });
});

export {
    authUser,
    registerUser,
    logoutUser,
    getUserProfile,
    updateUserProfile,
    getUsers,
};