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

// // DELETE /api/cart/items/:productId
// export const removeFromCart = asyncHandler(async (req, res) => {
//     const userId = req.user.id;
//     const { productId } = req.params; // Use params instead of body for DELETE

//     if (!productId) {
//         return res.status(400).json({
//             success: false,
//             message: "Product ID is required"
//         });
//     }

//     // Find the user's cart
//     const cart = await Cart.findOne({
//         where: { user_id: userId }
//     });

//     if (!cart) {
//         return res.status(404).json({
//             success: false,
//             message: "Cart not found"
//         });
//     }

//     // Find and delete the cart item
//     const deletedItem = await CartItem.destroy({
//         where: {
//             cart_id: cart.id,
//             product_id: productId
//         }
//     });

//     if (deletedItem === 0) {
//         return res.status(404).json({
//             success: false,
//             message: "Product not found in cart"
//         });
//     }

//     // Fetch updated cart
//     const updatedCart = await Cart.findByPk(cart.id, {
//         include: [{
//             model: CartItem,
//             as: 'items',
//             include: [{ model: Product, as: 'product' }]
//         }]
//     });

//     return res.status(200).json({
//         success: true,
//         message: "Item removed from cart",
//         cart: updatedCart
//     });
// });

