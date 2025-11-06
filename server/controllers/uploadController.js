import asyncHandler from 'express-async-handler';
import { Product, SupplierItem, User } from '../models/index.js';
import cloudinary from '../config/cloudinary.js';

// Upload product image
export const uploadProductImage = asyncHandler(async (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: 'No image file provided in the request'
        });
    }

    const productId = req.params.id;

    try {
        const product = await Product.findByPk(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Validate file buffer exists
        if (!req.file.buffer) {
            return res.status(400).json({
                success: false,
                message: 'File buffer is empty or invalid'
            });
        }

        // Delete old image if exists
        if (product.base_image_url) {
            const publicId = extractPublicId(product.base_image_url);
            if (publicId) {
                try {
                    await cloudinary.uploader.destroy(publicId);
                } catch (cloudinaryError) {
                    console.warn('Could not delete old Cloudinary image:', cloudinaryError);
                }
            }
        }

        // Convert buffer to base64 for Cloudinary
        const b64 = Buffer.from(req.file.buffer).toString('base64');
        const dataURI = `data:${req.file.mimetype};base64,${b64}`;

        // Upload directly to Cloudinary
        const result = await cloudinary.uploader.upload(dataURI, {
            folder: 'products',
            transformation: [
                { width: 800, height: 800, crop: 'limit' },
                { quality: 'auto' },
                { format: 'webp' }
            ]
        });

        // Update product with Cloudinary URL
        await product.update({ base_image_url: result.secure_url });

        // Also update all supplier items for this product
        await SupplierItem.update(
            { image_url: result.secure_url },
            { where: { product_id: productId } }
        );

        res.status(200).json({
            success: true,
            message: 'Product image uploaded successfully',
            data: {
                image_url: result.secure_url,
                cloudinary_public_id: result.public_id,
                product: {
                    id: product.id,
                    name: product.name,
                    sku: product.sku
                }
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: `Failed to upload image: ${error.message}`
        });
    }
});

// Upload profile photo
export const uploadProfilePhoto = asyncHandler(async (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: 'No photo file provided'
        });
    }

    const userId = req.user.id;
    const user = await User.findByPk(userId);

    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found'
        });
    }

    try {
        // Delete old photo if exists - using image_url
        if (user.image_url) {
            const publicId = extractPublicId(user.image_url);
            if (publicId) {
                await cloudinary.uploader.destroy(publicId);
            }
        }

        // Convert buffer to base64 for Cloudinary
        const b64 = Buffer.from(req.file.buffer).toString('base64');
        const dataURI = `data:${req.file.mimetype};base64,${b64}`;

        // Upload directly to Cloudinary
        const result = await cloudinary.uploader.upload(dataURI, {
            folder: 'profiles',
            transformation: [
                { width: 400, height: 400, crop: 'thumb', gravity: 'face' },
                { quality: 'auto' },
                { format: 'webp' }
            ]
        });

        // Update user with Cloudinary URL - using image_url
        await user.update({ image_url: result.secure_url });

        res.status(200).json({
            success: true,
            message: 'Profile photo uploaded successfully',
            data: {
                profile_photo: result.secure_url, // For frontend compatibility
                image_url: result.secure_url, // Main field for database
                cloudinary_public_id: result.public_id,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    image_url: result.secure_url // Include in user object
                }
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: `Failed to upload profile photo: ${error.message}`
        });
    }
});

// Delete product image
export const deleteProductImage = asyncHandler(async (req, res) => {
    const productId = req.params.id;

    const product = await Product.findByPk(productId);
    if (!product) {
        return res.status(404).json({
            success: false,
            message: 'Product not found'
        });
    }

    if (!product.base_image_url) {
        return res.status(400).json({
            success: false,
            message: 'Product does not have an image'
        });
    }

    try {
        // Extract public ID and delete from Cloudinary
        const publicId = extractPublicId(product.base_image_url);
        if (publicId) {
            await cloudinary.uploader.destroy(publicId);
        }

        // Update product and supplier items to remove image reference
        await product.update({ base_image_url: null });
        await SupplierItem.update(
            { image_url: null },
            { where: { product_id: productId } }
        );

        res.status(200).json({
            success: true,
            message: 'Product image deleted successfully',
            data: {
                product: {
                    id: product.id,
                    name: product.name,
                    sku: product.sku
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: `Failed to delete image: ${error.message}`
        });
    }
});

// Delete profile photo
export const deleteProfilePhoto = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const user = await User.findByPk(userId);

    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found'
        });
    }

    // Check using image_url
    if (!user.image_url) {
        return res.status(400).json({
            success: false,
            message: 'User does not have a profile photo'
        });
    }

    try {
        // Extract public ID and delete from Cloudinary
        const publicId = extractPublicId(user.image_url);
        if (publicId) {
            await cloudinary.uploader.destroy(publicId);
        }

        // Update user to remove photo reference - using image_url
        await user.update({ image_url: null });

        res.status(200).json({
            success: true,
            message: 'Profile photo deleted successfully',
            data: {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: `Failed to delete profile photo: ${error.message}`
        });
    }
});

// Helper function to extract public ID from Cloudinary URL
const extractPublicId = (url) => {
    if (!url) return null;

    // Cloudinary URL format: https://res.cloudinary.com/cloudname/image/upload/v1234567/folder/filename.jpg
    const matches = url.match(/\/upload\/(?:v\d+\/)?(.+?)\.(?:jpg|jpeg|png|gif|webp)/);
    return matches ? matches[1] : null;
};

export const getProductImage = asyncHandler(async (req, res) => {
    res.status(410).json({
        success: false,
        message: 'This endpoint is no longer available. Images are served directly from Cloudinary.'
    });
});

export const getProfilePhoto = asyncHandler(async (req, res) => {
    res.status(410).json({
        success: false,
        message: 'This endpoint is no longer available. Profile photos are served directly from Cloudinary.'
    });
});