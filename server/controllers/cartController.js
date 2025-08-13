import asyncHandler from 'express-async-handler';
import { Cart, CartItem, Product, Supplier, SupplierItem } from '../models/index.js';
import sequelize from '../config/db.js';

// Constants
const MAX_QUANTITY_PER_ITEM = 10; // Maximum allowed quantity for a single cart item

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

    if (!cart) {
        res.status(200).json({
            message: "Cart is empty",
            cart: null
        });
        return;
    }

    res.status(200).json(cart);
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
            where: {
                product_id,
                supplier_id
            },
            include: [Product],
            transaction
        });

        if (!supplierItem) {
            await transaction.rollback();
            res.status(404);
            throw new Error('Product not available from this supplier');
        }

        if (supplierItem.stock_level < quantity) {
            await transaction.rollback();
            res.status(400);
            throw new Error(`Only ${supplierItem.stock_level} units available`);
        }

        // Get or create cart
        let cart = await Cart.findOne({
            where: { user_id: userId },
            transaction
        });

        if (!cart) {
            cart = await Cart.create({ user_id: userId }, { transaction });
        }

        // Check if item already in cart from same supplier
        const cartItem = await CartItem.findOne({
            where: {
                cart_id: cart.id,
                product_id,
                supplier_id
            },
            transaction
        });

        if (cartItem) {
            const newQuantity = cartItem.quantity + Number(quantity);
            if (newQuantity > MAX_QUANTITY_PER_ITEM) {
                await transaction.rollback();
                res.status(400);
                throw new Error(`Cannot exceed maximum quantity of ${MAX_QUANTITY_PER_ITEM} units`);
            }

            cartItem.quantity = newQuantity;
            await cartItem.save({ transaction });
        } else {
            await CartItem.create({
                cart_id: cart.id,
                product_id,
                supplier_id,
                quantity,
                price: supplierItem.price,
                purchase_price: supplierItem.purchase_price
            }, { transaction });
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
        res.status(200).json(updatedCart);
    } catch (error) {
        await transaction.rollback();
        throw error;
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
            await transaction.rollback();
            res.status(404);
            throw new Error('Cart not found');
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
            await transaction.rollback();
            res.status(404);
            throw new Error('Item not found in cart');
        }

        // Verify stock availability
        const supplierItem = await SupplierItem.findOne({
            where: {
                product_id,
                supplier_id
            },
            transaction
        });

        if (supplierItem.stock_level < quantity) {
            await transaction.rollback();
            res.status(400);
            throw new Error(`Only ${supplierItem.stock_level} units available`);
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
        res.status(200).json(updatedCart);
    } catch (error) {
        await transaction.rollback();
        throw error;
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
            await transaction.rollback();
            res.status(404);
            throw new Error('Cart not found');
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
            await transaction.rollback();
            res.status(404);
            throw new Error('Item not found in cart');
        }

        const updatedCart = await Cart.findByPk(cart.id, {
            include: [{
                model: CartItem,
                include: [Product, Supplier]
            }],
            transaction
        });

        await transaction.commit();
        res.status(200).json(updatedCart);
    } catch (error) {
        await transaction.rollback();
        throw error;
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
            await transaction.rollback();
            res.status(404);
            throw new Error('Cart not found');
        }

        await CartItem.destroy({
            where: {
                cart_id: cart.id
            },
            transaction
        });

        await transaction.commit();
        res.status(200).json({
            message: 'Cart cleared successfully',
            cart: {
                ...cart.get({ plain: true }),
                CartItems: []
            }
        });
    } catch (error) {
        await transaction.rollback();
        throw error;
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
            totalItems: 0,
            subtotal: 0,
            message: "Cart is empty"
        });
    }

    const totalItems = cart.CartItems.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cart.CartItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);

    res.status(200).json({
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
    });
});