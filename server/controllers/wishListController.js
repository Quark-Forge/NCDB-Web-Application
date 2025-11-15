import asyncHandler from "express-async-handler";
import db from "../models/index.js";

const { Wishlist, WishlistItem, Product, SupplierItem, Category } = db;

// @desc    Add product to wishlist with specific supplier
// @route   POST /api/wishlist
// @access  Private
export const addToWishList = asyncHandler(async (req, res) => {
    const { product_id, supplier_item_id } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!product_id) {
        res.status(400);
        throw new Error("Product ID is required");
    }

    if (!supplier_item_id) {
        res.status(400);
        throw new Error("Supplier Item ID is required");
    }

    // Check if product exists and is active
    const product = await Product.findOne({
        where: {
            id: product_id,
            deleted_at: null
        }
    });

    if (!product) {
        res.status(404);
        throw new Error("Product not found");
    }

    // Check if supplier item exists and is active
    const supplierItem = await SupplierItem.findOne({
        where: {
            id: supplier_item_id,
            product_id: product_id,
            is_active: true
        },
        include: [{
            model: Product,
            include: [Category]
        }]
    });

    if (!supplierItem) {
        res.status(404);
        throw new Error("Supplier item not found or inactive");
    }

    // Find or create wishlist for user
    let [wishlist, created] = await Wishlist.findOrCreate({
        where: { user_id: userId },
        defaults: { user_id: userId, name: "My Wishlist" }
    });

    // Check if product already exists in wishlist (with same supplier)
    const existingItem = await WishlistItem.findOne({
        where: {
            wishlist_id: wishlist.id,
            supplier_item_id: supplier_item_id
        }
    });

    if (existingItem) {
        res.status(400);
        throw new Error("Product with this supplier already in wishlist");
    }

    // Add product to wishlist with supplier info
    await WishlistItem.create({
        wishlist_id: wishlist.id,
        supplier_item_id: supplier_item_id
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
// @route   DELETE /api/wishlist/:itemId
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
            id: productId,
            wishlist_id: wishlist.id
        }
    });

    if (!wishlistItem) {
        res.status(404);
        throw new Error("Wishlist item not found");
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
    try {
        const wishlistItems = await WishlistItem.findAll({
            where: { wishlist_id: wishlistId },
            include: [
                {
                    model: SupplierItem,
                    as: 'SupplierItem',
                    required: true,
                    include: [
                        {
                            model: Product,
                            where: { deleted_at: null },
                            required: true,
                            include: [
                                {
                                    model: Category,
                                    attributes: ['id', 'name'],
                                    required: false
                                }
                            ]
                        }
                    ]
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        if (!wishlistItems || wishlistItems.length === 0) {
            return { items: [], count: 0 };
        }

        const processedItems = wishlistItems.map(item => {
            const supplierItem = item.SupplierItem;
            const product = supplierItem.Product;

            // Check if the supplier item is still available
            const is_available = supplierItem && supplierItem.is_active && supplierItem.stock_level > 0;

            return {
                id: item.id,
                product: {
                    id: product.id,
                    name: product.name,
                    sku: product.sku,
                    description: product.description,
                    base_image_url: product.base_image_url,
                    category: product.Category
                },
                supplier_info: {
                    supplier_id: supplierItem.supplier_id,
                    supplier_item_id: supplierItem.id,
                    original_price: supplierItem.price,
                    discount_price: supplierItem.discount_price,
                    unit_symbol: supplierItem.unit_symbol,
                    quantity_per_unit: supplierItem.quantity_per_unit,
                    current_stock: supplierItem.stock_level,
                    current_lead_time: supplierItem.lead_time_days,
                    is_available: is_available,
                    is_active: supplierItem.is_active
                },
                added_at: item.createdAt
            };
        });

        return {
            id: wishlistId,
            items: processedItems,
            count: processedItems.length
        };
    } catch (error) {
        console.error('Error in getWishlistWithDetails:', error);
        return { items: [], count: 0 };
    }
};

// @desc    Check if product is in wishlist
// @route   GET /api/wishlist/check/:productId
// @access  Private
export const checkWishlistItem = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const userId = req.user.id;

    // Validate productId (now accepting UUIDs)
    if (!productId || productId === 'undefined' || productId === 'null') {
        return res.status(400).json({
            success: false,
            message: 'Valid product ID is required'
        });
    }

    // Find user's wishlist
    const wishlist = await Wishlist.findOne({
        where: { user_id: userId }
    });

    if (!wishlist) {
        return res.status(200).json({
            success: true,
            data: { in_wishlist: false, items: [] }
        });
    }

    // Check if product exists in wishlist (any supplier)
    const wishlistItems = await WishlistItem.findAll({
        where: {
            wishlist_id: wishlist.id
        },
        include: [{
            model: SupplierItem,
            as: 'SupplierItem',
            where: {
                product_id: productId // Use the UUID directly
            },
            required: true,
            attributes: ['id', 'stock_level', 'product_id', 'is_active']
        }]
    });

    res.status(200).json({
        success: true,
        data: {
            in_wishlist: wishlistItems.length > 0,
            items: wishlistItems.map(item => ({
                wishlist_item_id: item.id,
                supplier_item_id: item.supplier_item_id,
                is_available: item.SupplierItem ?
                    (item.SupplierItem.is_active && item.SupplierItem.stock_level > 0) :
                    false
            }))
        }
    });
});

// @desc    Update wishlist item supplier
// @route   PUT /api/wishlist/:itemId
// @access  Private
export const updateWishlistItem = asyncHandler(async (req, res) => {
    const { itemId } = req.params;
    const { supplier_item_id } = req.body;
    const userId = req.user.id;

    if (!supplier_item_id) {
        res.status(400);
        throw new Error("Supplier Item ID is required");
    }

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
            id: itemId,
            wishlist_id: wishlist.id
        },
        include: [{
            model: SupplierItem,
            as: 'SupplierItem'
        }]
    });

    if (!wishlistItem) {
        res.status(404);
        throw new Error("Wishlist item not found");
    }

    // Check if new supplier item exists, is active, and belongs to the same product
    const newSupplierItem = await SupplierItem.findOne({
        where: {
            id: supplier_item_id,
            product_id: wishlistItem.SupplierItem.product_id, // Ensure same product
            is_active: true
        }
    });

    if (!newSupplierItem) {
        res.status(404);
        throw new Error("Supplier item not found, inactive, or for different product");
    }

    // Check if the new supplier item is already in wishlist
    const existingItem = await WishlistItem.findOne({
        where: {
            wishlist_id: wishlist.id,
            supplier_item_id: supplier_item_id,
            id: { [db.Sequelize.Op.ne]: itemId } // Exclude current item
        }
    });

    if (existingItem) {
        res.status(400);
        throw new Error("This supplier item is already in your wishlist");
    }

    // Update the wishlist item with new supplier
    await wishlistItem.update({
        supplier_item_id: supplier_item_id
    });

    // Get updated wishlist with details
    const updatedWishlist = await getWishlistWithDetails(wishlist.id);

    res.status(200).json({
        success: true,
        message: "Wishlist item updated successfully",
        data: updatedWishlist
    });
});