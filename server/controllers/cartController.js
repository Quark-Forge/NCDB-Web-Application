import asyncHandler from 'express-async-handler';
import { Cart, CartItem, Product } from '../models/index.js';

// GET cart items
export const getCart = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const cart = await Cart.findOne({
        where: { user_id: userId },
        include: [{
            model: CartItem,
            include: [Product]
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
    const { product_id, quantity = 1 } = req.body;

    if (!product_id) {
        res.status(400);
        throw new Error('Product ID is required');
    }

    const product = await Product.findByPk(product_id);
    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    let cart = await Cart.findOne({ where: { user_id: userId } });
    if (!cart) {
        cart = await Cart.create({ user_id: userId });
    }

    let cartItem = await CartItem.findOne({
        where: {
            cart_id: cart.id,
            product_id
        }
    });

    if (cartItem) {
        cartItem.quantity += Number(quantity);
        await cartItem.save();
    } else {
        cartItem = await CartItem.create({
            cart_id: cart.id,
            product_id,
            quantity,
            price: product.price
        });
    }

    const updatedCart = await Cart.findByPk(cart.id, {
        include: [{
            model: CartItem,
            include: [Product]
        }]
    });

    res.status(200).json(updatedCart);
});

// PUT update cart item quantity
export const updateCartItem = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { product_id } = req.params;
    const { quantity } = req.body;

    if (!product_id || quantity === undefined || quantity < 1) {
        res.status(400);
        throw new Error('Product ID and valid quantity are required');
    }

    const cart = await Cart.findOne({ where: { user_id: userId } });
    if (!cart) {
        res.status(404);
        throw new Error('Cart not found');
    }

    const cartItem = await CartItem.findOne({
        where: {
            cart_id: cart.id,
            product_id
        }
    });

    if (!cartItem) {
        res.status(404);
        throw new Error('Item not found in cart');
    }

    cartItem.quantity = quantity;
    await cartItem.save();

    const updatedCart = await Cart.findByPk(cart.id, {
        include: [{
            model: CartItem,
            include: [Product]
        }]
    });

    res.status(200).json(updatedCart);
});

// DELETE remove item from cart
export const removeFromCart = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { product_id } = req.params;

    if (!product_id) {
        res.status(400);
        throw new Error('Product ID is required');
    }

    const cart = await Cart.findOne({ where: { user_id: userId } });
    if (!cart) {
        res.status(404);
        throw new Error('Cart not found');
    }

    const deleted = await CartItem.destroy({
        where: {
            cart_id: cart.id,
            product_id
        }
    });

    if (deleted === 0) {
        res.status(404);
        throw new Error('Item not found in cart');
    }

    const updatedCart = await Cart.findByPk(cart.id, {
        include: [{
            model: CartItem,
            include: [Product]
        }]
    });

    res.status(200).json(updatedCart);
});

// DELETE clear entire cart
export const clearCart = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const cart = await Cart.findOne({ where: { user_id: userId } });
    if (!cart) {
        res.status(404);
        throw new Error('Cart not found');
    }

    await CartItem.destroy({
        where: {
            cart_id: cart.id
        }
    });

    res.status(200).json({
        message: 'Cart cleared successfully',
        cart: {
            ...cart.get({ plain: true }),
            CartItems: []
        }
    });
});

// GET cart total
export const getCartTotal = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const cart = await Cart.findOne({
        where: { user_id: userId },
        include: [{
            model: CartItem,
            include: [Product]
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
        currency: 'LKR'
    });
});