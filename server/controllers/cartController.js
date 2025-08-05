import asyncHandler from 'express-async-handler';
import { Cart, CartItem, Product } from '../models/index.js';


// GET cart item
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
