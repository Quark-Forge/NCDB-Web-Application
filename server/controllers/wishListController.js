import asyncHandler from "express-async-handler";
import db from "../models/index.js";

const { Wishlist, WishlistItem, Product, SupplierItem, Category } = db;

// @desc    Add product to wishlist
// @route   POST /api/wishlist
// @access  Private
export const addToWishList = asyncHandler(async (req, res) => {
    const { productId } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!productId) {
        res.status(400);
        throw new Error("Product ID is required");
    }

    // Check if product exists and is active
    const product = await Product.findOne({
        where: {
            id: productId,
            deleted_at: null
        },
        include: [{
            model: SupplierItem,
            where: { is_active: true },
            required: false
        }]
    });

    if (!product) {
        res.status(404);
        throw new Error("Product not found");
    }

    // Find or create wishlist for user
    let [wishlist, created] = await Wishlist.findOrCreate({
        where: { user_id: userId },
        defaults: { user_id: userId, name: "My Wishlist" }
    });

    // Check if product already exists in wishlist
    const existingItem = await WishlistItem.findOne({
        where: {
            wishlist_id: wishlist.id,
            product_id: productId
        }
    });

    if (existingItem) {
        res.status(400);
        throw new Error("Product already in wishlist");
    }

    // Add product to wishlist
    const wishlistItem = await WishlistItem.create({
        wishlist_id: wishlist.id,
        product_id: productId
    });

    // Get updated wishlist with populated data
    const updatedWishlist = await getWishlistWithDetails(wishlist.id);

    res.status(201).json({
        success: true,
        message: "Product added to wishlist",
        data: updatedWishlist
    });
});

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private
export const getWishList = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    // Find user's wishlist
    const wishlist = await Wishlist.findOne({
        where: { user_id: userId }
    });

    if (!wishlist) {
        return res.status(200).json({
            success: true,
            message: "Wishlist is empty",
            data: { items: [], count: 0 }
        });
    }

    // Get wishlist with populated details
    const wishlistWithDetails = await getWishlistWithDetails(wishlist.id);

    res.status(200).json({
        success: true,
        data: wishlistWithDetails
    });
});

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
export const removeFromWishList = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const userId = req.user.id;

    // Find user's wishlist
    const wishlist = await Wishlist.findOne({
        where: { user_id: userId }
    });

    if (!wishlist) {
        res.status(404);
        throw new Error("Wishlist not found");
    }

    // Find the wishlist item
    const wishlistItem = await WishlistItem.findOne({
        where: {
            wishlist_id: wishlist.id,
            product_id: productId
        }
    });

    if (!wishlistItem) {
        res.status(404);
        throw new Error("Product not found in wishlist");
    }

    // Remove the item
    await wishlistItem.destroy();

    // Get updated wishlist with details
    const updatedWishlist = await getWishlistWithDetails(wishlist.id);

    res.status(200).json({
        success: true,
        message: "Product removed from wishlist",
        data: updatedWishlist
    });
});

// @desc    Clear entire wishlist
// @route   DELETE /api/wishlist
// @access  Private
export const clearWishList = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    // Find user's wishlist
    const wishlist = await Wishlist.findOne({
        where: { user_id: userId }
    });

    if (!wishlist) {
        res.status(404);
        throw new Error("Wishlist not found");
    }

    // Remove all wishlist items
    await WishlistItem.destroy({
        where: { wishlist_id: wishlist.id }
    });

    res.status(200).json({
        success: true,
        message: "Wishlist cleared successfully",
        data: { items: [], count: 0 }
    });
});

// Helper function to get wishlist with populated details
const getWishlistWithDetails = async (wishlistId) => {
    const wishlist = await Wishlist.findByPk(wishlistId, {
        include: [{
            model: WishlistItem,
            include: [{
                model: Product,
                where: { deleted_at: null },
                include: [
                    {
                        model: Category,
                        attributes: ['id', 'name']
                    },
                    {
                        model: SupplierItem,
                        where: { is_active: true },
                        required: false,
                        attributes: [
                            'id', 'price', 'discount_price', 'stock_level',
                            'lead_time_days', 'unit_symbol', 'quantity_per_unit'
                        ]
                    }
                ]
            }]
        }]
    });

    if (!wishlist) {
        return { items: [], count: 0 };
    }

    // Process items to get the best available supplier item
    const processedItems = wishlist.WishlistItems.map(item => {
        const product = item.Product;

        // Find the best supplier item (lowest price, available stock)
        let bestSupplierItem = null;
        if (product.SupplierItems && product.SupplierItems.length > 0) {
            // Filter items with stock and sort by price
            const availableItems = product.SupplierItems.filter(si => si.stock_level > 0);
            if (availableItems.length > 0) {
                bestSupplierItem = availableItems.sort((a, b) => {
                    const priceA = a.discount_price || a.price;
                    const priceB = b.discount_price || b.price;
                    return priceA - priceB;
                })[0];
            }
        }

        return {
            id: item.id,
            product: {
                id: product.id,
                name: product.name,
                sku: product.sku,
                description: product.description,
                base_image_url: product.base_image_url,
                category: product.Category,
                price: bestSupplierItem ? (bestSupplierItem.discount_price || bestSupplierItem.price) : null,
                original_price: bestSupplierItem ? bestSupplierItem.price : null,
                stock_level: bestSupplierItem ? bestSupplierItem.stock_level : 0,
                lead_time_days: bestSupplierItem ? bestSupplierItem.lead_time_days : null,
                unit_symbol: bestSupplierItem ? bestSupplierItem.unit_symbol : null,
                quantity_per_unit: bestSupplierItem ? bestSupplierItem.quantity_per_unit : null,
                is_available: bestSupplierItem !== null,
                supplier_item_id: bestSupplierItem ? bestSupplierItem.id : null
            },
            added_at: item.created_at
        };
    }).filter(item => item.product !== null); // Filter out deleted products

    return {
        id: wishlist.id,
        name: wishlist.name,
        items: processedItems,
        count: processedItems.length,
        created_at: wishlist.created_at,
        updated_at: wishlist.updated_at
    };
};

// @desc    Check if product is in wishlist
// @route   GET /api/wishlist/check/:productId
// @access  Private
export const checkWishlistItem = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const userId = req.user.id;

    // Find user's wishlist
    const wishlist = await Wishlist.findOne({
        where: { user_id: userId }
    });

    if (!wishlist) {
        return res.status(200).json({
            success: true,
            data: { in_wishlist: false }
        });
    }

    // Check if product exists in wishlist
    const wishlistItem = await WishlistItem.findOne({
        where: {
            wishlist_id: wishlist.id,
            product_id: productId
        }
    });

    res.status(200).json({
        success: true,
        data: {
            in_wishlist: !!wishlistItem,
            wishlist_item_id: wishlistItem?.id
        }
    });
});