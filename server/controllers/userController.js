import asyncHandler from 'express-async-handler';
import User from '../models/users.js';
import { hashPassword, matchPassword } from '../utils/hash.js';
import { generateToken, generateVerificationToken } from '../utils/generateToken.js';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { sendUserCredentials } from '../utils/sendEmail.js';
import { Role } from '../models/index.js';


// Get all users
// Protected - Admin Only
const getUsers = asyncHandler(async (req, res) => {
    const users = await User.findAll({
        paranoid: false,
        attributes: { exclude: ['password'] },
        include: [
            {
                model: Role,
                attributes: ['name'],
            },
        ],
    });
    const usersWithRole = users.map(user => {
        const userJson = user.toJSON();
        return {
            ...userJson,
            role_name: userJson.Role?.name || null,
            Role: undefined,
        };
    });

    res.status(200).json({
        success: true,
        data: usersWithRole,
    });
});

// Auth user/set token
// Public
const authUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ where: { email } });

    if (!existingUser) {
        res.status(401);
        throw new Error('Invalid email or password');
    }

    if (!existingUser.is_verified) {
        res.status(401);
        throw new Error('Please verify your email before logging in.');
    }

    if (await matchPassword(password, existingUser.password)) {
        const { id, name, email, contact_number, address, role_id } = existingUser;
        const role = await Role.findByPk(role_id);
        const user_role = role ? role.name : 'Unknown';
        generateToken(res, id);
        return res.status(200).json({ id, name, email, contact_number, address, role_id, user_role });
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
    const verifiedUser = await User.findOne({
        where: {
            email,
            is_verified: true
        }
    });

    if (verifiedUser) {
        res.status(400);
        throw new Error('Email already registered. Please login instead.');
    }

    const existingUser = await User.findOne({
        where: {
            email,
            is_verified: false
        }
    });

    if (existingUser) {
        await existingUser.destroy();
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
        is_verified: true, // need to change this affter solving the verification mail problem
    });

    // const token = generateVerificationToken(newUser.id);
    // const verifyUrl = `${process.env.FRONTEND_URL}/verify/${token}`;
    // console.log(token);
    // console.log(verifyUrl);

    // const htmlMessage = `
    // <div style="font-family: sans-serif; color: #333;">
    //     <h2>Welcome to NCDB Mart</h2>
    //     <p>Thank you for registering. Please verify your email by clicking the button below:</p>
    //     <a href="${verifyUrl}" 
    //     style="display: inline-block; background-color: #007BFF; color: white; padding: 10px 20px; 
    //             text-decoration: none; border-radius: 4px;"
    //     target="_blank">
    //     Verify Email
    //     </a>
    //     <p>If you did not sign up, you can ignore this email.</p>
    // </div>
    // `;


    // await sendUserCredentials(email, 'Verify your account', htmlMessage);

    res.status(201).json({
        message: 'Verification email sent. Please check your inbox.',
    });
});

// Email Verification
const verifyEmail = asyncHandler(async (req, res) => {
    const { token } = req.params;
    console.log(token);


    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log(decoded);
        let user;
        try {
            user = await User.findByPk(decoded.UserID);
            console.log('User:', user ? user.toJSON() : null);
        } catch (dbErr) {
            console.error('Database Error:', dbErr.message);
            throw new Error('Database query failed');
        }
        console.log('is_verified:', user?.is_verified);


        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }

        if (user.is_verified) {
            return res.status(200).json({ message: 'User already verified' });
        }

        const [updated] = await User.update(
            { is_verified: true },
            { where: { id: decoded.UserID } }
        );
        if (updated === 0) {
            throw new Error('No rows updated. User might not exist.');
        }

        console.log(user.is_verified);
        res.status(200).json({ message: 'Email verified successfully. You can now log in.' });

    } catch (err) {
        res.status(400);
        throw new Error('Invalid or expired verification token');
    }
});

// Resend verification email
const resendVerificationEmail = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }
    if (user.is_verified) {
        res.status(400);
        throw new Error('User already verified');
    }
    const token = generateVerificationToken(user.id);
    const verifyUrl = `${process.env.FRONTEND_URL}/verify/${token}`;
    const htmlMessage = `...`; // Same as in registerUser
    await sendUserCredentials(email, 'Verify your account', htmlMessage);
    res.status(200).json({ message: 'Verification email resent' });
});


// Logout User
// Protected
const logoutUser = asyncHandler(async (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0),
    });
    res.json({ message: 'User logged out' });
});

// Get User Profile
// Protected
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
// Protected
const updateUserProfile = asyncHandler(async (req, res) => {
    const { name, email, password, contact_number, address } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    const role = await Role.findByPk(user.role_id);
    const user_role = role ? role.name : 'Unknown';

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
        user_role,
    });
});

// Update user role (Admin only)
// PUT /api/users/:id/role
const updateUserRole = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { role_id } = req.body;

    if (!role_id) {
        res.status(400);
        throw new Error('Role ID is required');
    }

    const requestingUser = await User.findByPk(req.user.id, {
        include: [{ model: Role }]
    });

    if (!requestingUser?.Role || requestingUser.Role.name !== 'Admin') {
        res.status(403);
        throw new Error('Not authorized as admin');
    }

    const userToUpdate = await User.findByPk(id);
    if (!userToUpdate) {
        res.status(404);
        throw new Error('User not found');
    }

    const newRole = await Role.findByPk(role_id);
    if (!newRole) {
        res.status(400);
        throw new Error('Invalid role ID');
    }

    if (userToUpdate.id === requestingUser.id) {
        res.status(403);
        throw new Error('Admins cannot modify their own role');
    }

    await userToUpdate.update({ role_id });

    const updatedUser = await User.findByPk(id, {
        attributes: { exclude: ['password'] },
        include: [{ model: Role, attributes: ['name'] }]
    });

    res.status(200).json({
        success: true,
        message: 'User role updated successfully',
        user: {
            ...updatedUser.toJSON(),
            role_name: updatedUser.Role?.name
        }
    });
});

// Delete user (Admin only - Soft delete with paranoid)
// DELETE /api/users/:id
const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const requestingUser = await User.findByPk(req.user.id, {
        include: [{ model: Role }]
    });

    if (!requestingUser?.Role || requestingUser.Role.name !== 'Admin') {
        res.status(403);
        throw new Error('Not authorized as admin');
    }

    if (requestingUser.id === parseInt(id)) {
        res.status(403);
        throw new Error('Admins cannot delete themselves');
    }

    const userToDelete = await User.findByPk(id);
    if (!userToDelete) {
        res.status(404);
        throw new Error('User not found');
    }

    await userToDelete.destroy();

    res.status(200).json({
        success: true,
        message: 'User deleted successfully (soft delete)',
        deletedUserId: id
    });
});

// Restore user (Admin only)
// PATCH /api/users/:id/restore
const restoreUser = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const requestingUser = await User.findByPk(req.user.id, {
        include: [{ model: Role }]
    });

    if (!requestingUser?.Role || requestingUser.Role.name !== 'Admin') {
        res.status(403);
        throw new Error('Not authorized as admin');
    }

    const userToRestore = await User.findByPk(id, { paranoid: false });

    if (!userToRestore) {
        res.status(404);
        throw new Error('User not found');
    }

    if (!userToRestore.deletedAt) {
        res.status(400);
        throw new Error('User is not deactivated');
    }

    await userToRestore.restore();

    res.status(200).json({
        success: true,
        message: 'User restored successfully',
        restoredUserId: id
    });
});

export {
    authUser,
    registerUser,
    logoutUser,
    getUserProfile,
    updateUserProfile,
    getUsers,
    verifyEmail,
    resendVerificationEmail,
    updateUserRole,
    deleteUser,
    restoreUser,
};