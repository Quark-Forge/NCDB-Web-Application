import asyncHandler from 'express-async-handler';
import { hashPassword, matchPassword } from '../utils/hash.js';
import { generatePasswordResetToken, generateToken, generateVerificationToken } from '../utils/generateToken.js';
import jwt from 'jsonwebtoken';
import { sendUserCredentials } from '../utils/sendEmail.js';
import { Role, User } from '../models/index.js';
import {
    passwordResetTemplate,
    verificationEmailTemplate,
    welcomeEmailTemplate
} from '../templates/emailTemplates.js';

// Get all users
// Protected - Admin Only
const getUsers = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: users } = await User.findAndCountAll({
        paranoid: false,
        attributes: { exclude: ['password'] },
        include: [
            {
                model: Role,
                attributes: ['name'],
            },
        ],
        limit,
        offset,
        order: [['createdAt', 'DESC']]
    });

    const usersWithRole = users.map(user => {
        const userJson = user.toJSON();
        return {
            ...userJson,
            role_name: userJson.Role?.name || null,
            Role: undefined,
        };
    });

    const totalPages = Math.ceil(count / limit);

    res.status(200).json({
        success: true,
        data: usersWithRole,
        totalCount: count,
        totalPages,
        currentPage: page
    });
});

// Auth user/set token
// Public
const authUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ 
        where: { email },
        paranoid: false,
    });

    if (!existingUser) {
        res.status(401);
        throw new Error('Invalid email or password');
    }

    // Check password first
    if (!(await matchPassword(password, existingUser.password))) {
        res.status(401);
        throw new Error('Invalid email or password');
    }

    // If password is correct but user is not verified
    if (!existingUser.is_verified) {
        return res.status(200).json({
            id: existingUser.id,
            name: existingUser.name,
            email: existingUser.email,
            contact_number: existingUser.contact_number,
            address: existingUser.address,
            role_id: existingUser.role_id,
            image_url: existingUser.image_url,
            is_verified: false,
            requires_verification: true
        });
    }

    // User is verified - proceed with normal login
    const { id, name, email: userEmail, contact_number, address, role_id, image_url } = existingUser;
    const role = await Role.findByPk(role_id);
    const user_role = role ? role.name : 'Unknown';

    generateToken(res, id);

    return res.status(200).json({
        id,
        name,
        email: userEmail,
        contact_number,
        address,
        role_id,
        user_role,
        image_url,
        is_verified: true
    });
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
        is_verified: false,
    });

    try {
        const token = generateVerificationToken(newUser.id);
        const verifyUrl = `${process.env.FRONTEND_URL}/auth/verify/${token}`;

        // Use template function
        const htmlMessage = verificationEmailTemplate(verifyUrl);

        await sendUserCredentials(email, 'Verify Your Email Address', htmlMessage);

        res.status(201).json({
            message: 'Verification email sent. Please check your inbox.',
        });
    } catch (emailError) {
        // If email fails, delete the user and return error
        await newUser.destroy();
        console.error('Email sending failed:', emailError);
        res.status(500);
        throw new Error('Failed to send verification email. Please try again.');
    }
});

// Email Verification
const verifyEmail = asyncHandler(async (req, res) => {
    const { token } = req.params;
    console.log('Verification token received:', token);

    try {
        const decoded = jwt.verify(token, process.env.JWT_VERIFICATION_SECRET);
        console.log('Decoded token:', decoded);

        let user;
        try {
            user = await User.findByPk(decoded.userID);
            console.log('User found:', user ? user.toJSON() : null);
        } catch (dbErr) {
            console.error('Database Error:', dbErr.message);
            throw new Error('Database query failed');
        }

        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }

        if (user.is_verified) {
            return res.status(200).json({ message: 'User already verified' });
        }

        const [updated] = await User.update(
            { is_verified: true },
            { where: { id: decoded.userID } }
        );

        if (updated === 0) {
            throw new Error('No rows updated. User might not exist.');
        }

        console.log('User verification status updated');

        // Send welcome email after successful verification
        try {
            const welcomeHtml = welcomeEmailTemplate(user.name);
            await sendUserCredentials(user.email, 'Welcome to NCDB Mart!', welcomeHtml);
        } catch (welcomeError) {
            console.error('Failed to send welcome email:', welcomeError);
            // Don't throw error, just log it
        }

        res.status(200).json({ message: 'Email verified successfully. You can now log in.' });

    } catch (err) {
        console.error('Token verification error:', err.message);
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
    const verifyUrl = `${process.env.FRONTEND_URL}/auth/verify/${token}`;

    // Use the same template function
    const htmlMessage = verificationEmailTemplate(verifyUrl);

    await sendUserCredentials(email, 'Verify Your Email Address', htmlMessage);
    res.status(200).json({ message: 'Verification email resent successfully' });
});

// Forgot Password - Send reset email
const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        res.status(400);
        throw new Error('Email is required');
    }

    const user = await User.findOne({ where: { email } });

    // Don't reveal if user exists or not for security
    if (user) {
        const resetToken = generatePasswordResetToken(user.id);
        const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password/${resetToken}`;

        const htmlMessage = passwordResetTemplate(resetUrl, user.name);

        try {
            await sendUserCredentials(email, 'Reset Your Password - NCDB Mart', htmlMessage);
        } catch (emailError) {
            console.error('Password reset email failed:', emailError);
            res.status(500);
            throw new Error('Failed to send password reset email');
        }
    }

    // Always return success to prevent email enumeration
    res.status(200).json({
        message: 'If an account with that email exists, a password reset link has been sent.'
    });
});

// Reset Password - Verify token and update password
const resetPassword = asyncHandler(async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
        res.status(400);
        throw new Error('Password is required');
    }

    if (password.length < 8) {
        res.status(400);
        throw new Error('Password must be at least 8 characters');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_VERIFICATION_SECRET);
        const user = await User.findByPk(decoded.userID);

        if (!user) {
            res.status(400);
            throw new Error('Invalid or expired reset token');
        }

        const hashedPassword = await hashPassword(password);
        await User.update(
            { password: hashedPassword },
            { where: { id: decoded.userID } }
        );

        res.status(200).json({
            message: 'Password reset successfully. You can now login with your new password.'
        });

    } catch (err) {
        console.error('Password reset error:', err);
        res.status(400);
        throw new Error('Invalid or expired reset token');
    }
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

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser && existingUser.id !== req.user.id) {
        res.status(400);
        throw new Error('Email is already in use');
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

    if (requestingUser.id === id) {
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
    resetPassword,
    forgotPassword,
    getUserProfile,
    updateUserProfile,
    getUsers,
    verifyEmail,
    resendVerificationEmail,
    updateUserRole,
    deleteUser,
    restoreUser,
};