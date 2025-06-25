import asyncHandler from 'express-async-handler';
import { createUser, getUserByEmail, getUser, updateUser, getAllUsers } from '../models/userModel.js';
import { hashPassword, matchPassword } from '../utils/hash.js';
import generateToken from '../utils/generateToken.js';
import { sendUserCredentials } from '../utils/sendEmail.js';


// @desc    Get all users
// @route   GET /api/users
// @access  Protected - Admin Only
const getUsers = asyncHandler(async (req, res) => {
    const users = await getAllUsers();
    res.status(200).json(users);
});

/* @desc Auth user/set token
// @route POST /api/users/auth
// @access Public
*/
const authUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const existingUser = await getUserByEmail(email);

    if (existingUser && await matchPassword(password, existingUser.password)) {
        const { id, name, email, contact_number, address, role, } = existingUser;
        generateToken(res, id);
        return res.status(200).json({ id, name, email, contact_number, address, role });
    }
    res.status(401);
    throw new Error('Invalid email or password');

});

// @desc  Register a new User
// @route POST /api/users
// @access Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, contact_number, address} = req.body;
    if (!name || !email || !password || !contact_number || !address) {
        res.status(400);
        throw new Error('All fields are required');
    }
    const existingUser = await getUserByEmail(email);

    if (existingUser) {
        res.status(400);
        throw new Error('User already exists');
    }
    const hashedPassword = await hashPassword(password);
    const user = await createUser({ name, email, contact_number, address, password: hashedPassword });
    generateToken(res, user.insertId);
    res.status(201).json({
        message: 'User created',
        user: {
            id: user.insertId,
            name,
            email,
            contact_number,
            address,
        },
    });
});

// @desc Logout User
// @route POST /api/users/logout
// @access Public
const logoutUser = asyncHandler(async (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0),
    });
    res.json({ message: 'User logged out' });
});

// @desc  Get User Profile
// @route Get /api/users/profile
// @access Private
const getUserProfile = asyncHandler(async (req, res) => {
    const user = {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        contact_number: req.user.contact_number,
        address: req.user.address,
        role: req.user.role
    };
    res.status(200).json({ user });
});

// @desc Update User Profile
// @route PUT /api/users/profile
// @access Private
const updateUserProfile = asyncHandler(async (req, res) => {
    const { name, email, password, contact_number, address } = req.body;
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
        contact_number: contact_number || user.contact_number,
        address: address || user.address,
        password: hashedPassword,
    });
    const updatedUser = await getUser(req.user.id);
    res.status(200).json({
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        contact_number: updatedUser.contact_number,
        address: updatedUser.address,
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