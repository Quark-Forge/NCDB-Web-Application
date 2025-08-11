import asyncHandler from 'express-async-handler';
import { Op } from 'sequelize';
import Order from '../models/orders.js';
import OrderItem from '../models/orderItems.js';
import Product from '../models/product.js';
import { generateOrderNumber } from '../utils/orderUtils.js';
import Cart from '../models/cart.js';
import CartItem from '../models/cartItems.js';
import SupplierItem from '../models/suplierItem.js';
import sequelize from '../config/db.js';


// checkout (create order)
// POST api/orders/checkout
export const checkoutCart = asyncHandler(async (req, res) => {
    const {
        shipping_name,
        shipping_phone,
        shipping_address_line1,
        shipping_address_line2,
        shipping_city,
        billing_address_same,
        billing_address
    } = req.body;

    const user_id = req.user.id;

    // Validate required shipping fields
    const requiredFields = [
        'shipping_name',
        'shipping_phone',
        'shipping_address_line1',
        'shipping_city'
    ];

    for (const field of requiredFields) {
        if (!req.body[field]) {
            res.status(400);
            throw new Error(`Missing required field: ${field}`);
        }
    }

    // Get user's cart with items
    const cart = await Cart.findOne({

        where: { user_id },
        include: [{
            model: CartItem,
            include: [Product],
            where: { quantity: { [Op.gt]: 0 } }
        }]
    });

    if (!cart || !cart.CartItems || cart.CartItems.length === 0) {
        res.status(400);
        throw new Error('Your cart is empty');
    }

    // Validate stock and calculate total
    let totalAmount = 0;
    const orderItems = [];
    const stockUpdates = [];

    for (const cartItem of cart.CartItems) {
        const product = cartItem.Product;

        // Check available stock across all suppliers
        const supplierItems = await SupplierItem.findAll({
            where: { product_id: product.id },
            attributes: ['id', 'stock_level'],
            order: [['stock_level', 'DESC']]
        });

        const totalAvailableStock = supplierItems.reduce((sum, item) => sum + item.stock_level, 0);

        if (totalAvailableStock < cartItem.quantity) {
            res.status(400);
            throw new Error(`Only ${totalAvailableStock} available for ${product.name}`);
        }

        totalAmount += product.price * cartItem.quantity;
        orderItems.push({
            product_id: product.id,
            quantity: cartItem.quantity,
            price: product.price
        });

        // Prepare stock allocation (FIFO or LIFO logic could be implemented here)
        stockUpdates.push({
            productId: product.id,
            quantity: cartItem.quantity,
            supplierItems: supplierItems
        });
    }

    const transaction = await sequelize.transaction();

    try {
        // Create the order
        const order = await Order.create({
            order_number: generateOrderNumber(),
            shipping_name,
            shipping_phone,
            shipping_address_line1,
            shipping_address_line2,
            shipping_city,
            billing_address_same,
            billing_address: billing_address_same ? null : billing_address,
            total_amount: totalAmount,
            user_id,
            status: 'pending'
        }, { transaction });

        // Create order items
        await OrderItem.bulkCreate(
            orderItems.map(item => ({
                ...item,
                order_id: order.id
            })),
            { transaction }
        );

        // Update supplier stock levels (allocating from highest stock first)
        for (const update of stockUpdates) {
            let remainingQuantity = update.quantity;

            for (const supplierItem of update.supplierItems) {
                if (remainingQuantity <= 0) break;

                const deduction = Math.min(remainingQuantity, supplierItem.stock_level);
                if (deduction > 0) {
                    await SupplierItem.decrement('stock_level', {
                        by: deduction,
                        where: { id: supplierItem.id },
                        transaction
                    });
                    remainingQuantity -= deduction;
                }
            }
        }

        // Clear the cart
        await CartItem.destroy({
            where: { cart_id: cart.id },
            transaction
        });

        await transaction.commit();

        // Fetch complete order details
        const createdOrder = await Order.findByPk(order.id, {
            include: [{
                model: OrderItem,
                include: [Product]
            }]
        });

        res.status(201).json({
            success: true,
            message: 'Order placed successfully',
            order: createdOrder
        });

    } catch (error) {
        await transaction.rollback();
        res.status(500);
        throw new Error(`Order processing failed: ${error.message}`);
    }
});