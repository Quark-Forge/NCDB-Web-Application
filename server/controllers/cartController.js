import asyncHandler from 'express-async-handler';
import { Cart, CartItem, Product, Supplier, SupplierItem } from '../models/index.js';
import sequelize from '../config/db.js';

// Constants
const MAX_QUANTITY_PER_ITEM = 10;

// Helper function to handle transaction errors
const handleTransactionError = async (transaction, error, res) => {
    if (transaction && !transaction.finished) {
        await transaction.rollback();
    }
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: error.message
    });
};

// GET cart items
export const getCart = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const cart = await Cart.findOne({
        where: { user_id: userId },
        include: [{
            model: CartItem,
            include: [Product, Supplier]
        }]
    });

    res.status(200).json({
        success: true,
        data: cart || { CartItems: [] },
        message: cart ? 'Cart retrieved successfully' : 'Cart is empty'
    });
});

// POST add to cart
export const addToCart = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { product_id, supplier_id, quantity = 1 } = req.body;

    // Validate input
    if (!product_id || !supplier_id) {
        res.status(400);
        throw new Error('Product ID and Supplier ID are required');
    }

    if (quantity > MAX_QUANTITY_PER_ITEM) {
        res.status(400);
        throw new Error(`Maximum ${MAX_QUANTITY_PER_ITEM} units per item allowed`);
    }

    const transaction = await sequelize.transaction();
    try {
        // Check product-supplier relationship and stock
        const supplierItem = await SupplierItem.findOne({
            where: { product_id, supplier_id },
            include: [Product],
            transaction
        });

        if (!supplierItem) {
            throw Object.assign(new Error('Product not available from this supplier'), { statusCode: 404 });
        }

        if (supplierItem.stock_level < quantity) {
            throw Object.assign(new Error(`Only ${supplierItem.stock_level} units available`), { statusCode: 400 });
        }

        // Get or create cart
        let cart = await Cart.findOne({
            where: { user_id: userId },
            transaction
        }) || await Cart.create({ user_id: userId }, { transaction });

        // Check if item already in cart from same supplier
        const [cartItem, created] = await CartItem.findOrCreate({
            where: {
                cart_id: cart.id,
                product_id,
                supplier_id
            },
            defaults: {
                quantity,
                price: supplierItem.price,
            },
            transaction
        });

        if (!created) {
            const newQuantity = cartItem.quantity + Number(quantity);
            if (newQuantity > MAX_QUANTITY_PER_ITEM) {
                throw Object.assign(new Error(`Cannot exceed maximum quantity of ${MAX_QUANTITY_PER_ITEM} units`), { statusCode: 400 });
            }
            cartItem.quantity = newQuantity;
            await cartItem.save({ transaction });
        }

        // Return updated cart
        const updatedCart = await Cart.findByPk(cart.id, {
            include: [{
                model: CartItem,
                include: [Product, Supplier]
            }],
            transaction
        });

        await transaction.commit();
        res.status(200).json({
            success: true,
            data: updatedCart,
            message: 'Item added to cart successfully'
        });
    } catch (error) {
        await handleTransactionError(transaction, error, res);
    }
});

// PUT update cart item quantity
export const updateCartItem = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { product_id, supplier_id } = req.params;
    const { quantity } = req.body;

    if (!product_id || !supplier_id || quantity === undefined || quantity < 1) {
        res.status(400);
        throw new Error('Product ID, Supplier ID and valid quantity are required');
    }

    if (quantity > MAX_QUANTITY_PER_ITEM) {
        res.status(400);
        throw new Error(`Maximum ${MAX_QUANTITY_PER_ITEM} units per item allowed`);
    }

    const transaction = await sequelize.transaction();
    try {
        const cart = await Cart.findOne({
            where: { user_id: userId },
            transaction
        });

        if (!cart) {
            throw Object.assign(new Error('Cart not found'), { statusCode: 404 });
        }

        const cartItem = await CartItem.findOne({
            where: {
                cart_id: cart.id,
                product_id,
                supplier_id
            },
            transaction
        });

        if (!cartItem) {
            throw Object.assign(new Error('Item not found in cart'), { statusCode: 404 });
        }

        // Verify stock availability
        const supplierItem = await SupplierItem.findOne({
            where: { product_id, supplier_id },
            transaction
        });

        if (supplierItem.stock_level < quantity) {
            throw Object.assign(new Error(`Only ${supplierItem.stock_level} units available`), { statusCode: 400 });
        }

        cartItem.quantity = quantity;
        await cartItem.save({ transaction });

        const updatedCart = await Cart.findByPk(cart.id, {
            include: [{
                model: CartItem,
                include: [Product, Supplier]
            }],
            transaction
        });

        await transaction.commit();
        res.status(200).json({
            success: true,
            data: updatedCart,
            message: 'Cart item updated successfully'
        });
    } catch (error) {
        await handleTransactionError(transaction, error, res);
    }
});

// DELETE remove item from cart
export const removeFromCart = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { product_id, supplier_id } = req.params;

    if (!product_id || !supplier_id) {
        res.status(400);
        throw new Error('Product ID and Supplier ID are required');
    }

    const transaction = await sequelize.transaction();
    try {
        const cart = await Cart.findOne({
            where: { user_id: userId },
            transaction
        });

        if (!cart) {
            throw Object.assign(new Error('Cart not found'), { statusCode: 404 });
        }

        const deleted = await CartItem.destroy({
            where: {
                cart_id: cart.id,
                product_id,
                supplier_id
            },
            transaction
        });

        if (deleted === 0) {
            throw Object.assign(new Error('Item not found in cart'), { statusCode: 404 });
        }

        const updatedCart = await Cart.findByPk(cart.id, {
            include: [{
                model: CartItem,
                include: [Product, Supplier]
            }],
            transaction
        });

        await transaction.commit();
        res.status(200).json({
            success: true,
            data: updatedCart,
            message: 'Item removed from cart successfully'
        });
    } catch (error) {
        await handleTransactionError(transaction, error, res);
    }
});

// DELETE clear entire cart
export const clearCart = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const transaction = await sequelize.transaction();
    try {
        const cart = await Cart.findOne({
            where: { user_id: userId },
            transaction
        });

        if (!cart) {
            throw Object.assign(new Error('Cart not found'), { statusCode: 404 });
        }

        await CartItem.destroy({
            where: { cart_id: cart.id },
            transaction
        });

        await transaction.commit();
        res.status(200).json({
            success: true,
            data: {
                ...cart.get({ plain: true }),
                CartItems: []
            },
            message: 'Cart cleared successfully'
        });
    } catch (error) {
        await handleTransactionError(transaction, error, res);
    }
});

// GET cart total
export const getCartTotal = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const cart = await Cart.findOne({
        where: { user_id: userId },
        include: [{
            model: CartItem,
            include: [Product, Supplier]
        }]
    });

    if (!cart || !cart.CartItems || cart.CartItems.length === 0) {
        return res.status(200).json({
            success: true,
            data: {
                totalItems: 0,
                subtotal: 0,
                items: []
            },
            message: "Cart is empty"
        });
    }

    const totalItems = cart.CartItems.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cart.CartItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);

    res.status(200).json({
        success: true,
        data: {
            totalItems,
            subtotal,
            currency: 'LKR',
            items: cart.CartItems.map(item => ({
                id: item.id,
                product_id: item.product_id,
                product_name: item.Product.name,
                supplier_id: item.supplier_id,
                supplier_name: item.Supplier.name,
                quantity: item.quantity,
                price: item.price,
                item_total: item.quantity * item.price
            }))
        },
        message: 'Cart total calculated successfully'
    });
});