import asyncHandler from 'express-async-handler';
import { Op, or, where } from 'sequelize';
import { generateOrderNumber } from '../utils/orderUtils.js';
import sequelize from '../config/db.js';
import {
    SupplierItem,
    Supplier,
    Product,
    OrderItem,
    Order,
    CartItem,
    Cart,
    Role,
    Address,
    ShippingCost
} from '../models/index.js';

// Valid order status transitions
const STATUS_TRANSITIONS = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['shipped', 'cancelled'],
    shipped: ['delivered'],
    delivered: [],
    cancelled: []
};

// checkout (create order)
export const checkoutCart = asyncHandler(async (req, res) => {
    const user_id = req.user.id;
    const { address_id } = req.body;

    // Validate shipping details
    if (!address_id) {
        res.status(400);
        throw new Error('Missing required shipping details (address_id)');
    }

    // Get cart with items including supplier info
    const cart = await Cart.findOne({
        where: { user_id },
        include: [{
            model: CartItem,
            include: [Product, Supplier],
            where: { quantity: { [Op.gt]: 0 } }
        }]
    });

    if (!cart?.CartItems?.length) {
        res.status(400).json({
            success: false,
            message: 'Cart is empty',
            code: 'EMPTY_CART'
        });
        return;
    }

    const transaction = await sequelize.transaction();

    try {
        // Verify stock and prepare order items
        const orderItems = [];
        let totalAmount = 0;
        const stockIssues = [];

        for (const cartItem of cart.CartItems) {
            const supplierItem = await SupplierItem.findOne({
                where: {
                    product_id: cartItem.product_id,
                    supplier_id: cartItem.supplier_id
                },
                transaction
            });

            if (!supplierItem) {
                stockIssues.push({
                    product_id: cartItem.product_id,
                    product_name: cartItem.Product.name,
                    message: 'Product no longer available from this supplier',
                    available: 0
                });
                continue;
            }

            if (supplierItem.stock_level < cartItem.quantity) {
                stockIssues.push({
                    product_id: cartItem.product_id,
                    product_name: cartItem.Product.name,
                    message: 'Insufficient stock',
                    available: supplierItem.stock_level,
                    requested: cartItem.quantity
                });
                continue;
            }

            totalAmount += cartItem.price * cartItem.quantity;

            orderItems.push({
                product_id: cartItem.product_id,
                supplier_id: cartItem.supplier_id,
                quantity: cartItem.quantity,
                price: cartItem.price,
                product_data: { // Store snapshot of product details
                    name: cartItem.Product.name,
                    sku: cartItem.Product.sku,
                    image_url: cartItem.Product.base_image_url
                },
                supplier_data: { // Store snapshot of supplier details
                    name: cartItem.Supplier.name,
                    contact: cartItem.Supplier.contact_number
                }
            });
        }

        // If any stock issues, abort the order
        if (stockIssues.length > 0) {
            await transaction.rollback();
            res.status(400).json({
                success: false,
                message: 'Some items are no longer available',
                issues: stockIssues,
                code: 'STOCK_ISSUES'
            });
            return;
        }

        // Create order
        const order = await Order.create({
            order_number: generateOrderNumber(),
            address_id,
            total_amount: totalAmount,
            user_id,
            status: 'pending',
            notes: 'Order created from cart checkout'
        }, { transaction });

        // Create order items
        await OrderItem.bulkCreate(
            orderItems.map(item => ({
                ...item,
                order_id: order.id
            })),
            { transaction }
        );

        // Update inventory
        for (const cartItem of cart.CartItems) {
            await SupplierItem.decrement('stock_level', {
                by: cartItem.quantity,
                where: {
                    product_id: cartItem.product_id,
                    supplier_id: cartItem.supplier_id
                },
                transaction
            });
        }

        // Clear cart
        await CartItem.destroy({
            where: { cart_id: cart.id },
            transaction
        });

        await transaction.commit();

        // Return complete order details
        try {
            const orderDetail = await Order.findByPk(order.id, {
                include: [
                    {
                        model: OrderItem,
                        include: [Product, Supplier]
                    },
                    {
                        model: Address,
                        where: { id: address_id },
                    }
                ]
            });
            const shippingCost = await ShippingCost.findOne({
                where: { city: orderDetail.Address.city }
            });
            const responseData = {
                id: orderDetail.id, order_number: orderDetail.order_number,
                status: orderDetail.status, total_amount: orderDetail.total_amount,
                items: orderDetail.OrderItems.map(item => ({

                    id: item.id, quantity: item.quantity,
                    product_id: item.Product.id, product_name: item.Product.name,
                    supplier_id: item.Supplier.id, supplier_name: item.Supplier.name,
                })),
                address_id: orderDetail.Address.id,
                city: orderDetail.Address.city,
                shipping_cost: shippingCost ? shippingCost.cost : 0
            };

            res.status(201).json({
                success: true,
                message: 'Order created successfully',
                data: responseData

            });
        } catch (fetchError) {
            console.error('Error fetching order details:', fetchError);
            res.status(201).json({
                success: true,
                message: 'Order created successfully but could not fetch complete details',
                data: { id: order.id } // At least return the order ID
            });
        }

    } catch (error) {
        await transaction.rollback();
        console.error('Checkout error:', error);
        res.status(500).json({
            success: false,
            message: 'Checkout failed',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            code: 'CHECKOUT_ERROR'
        });
    }
});

// GET all orders (Admin)
export const getAllOrders = asyncHandler(async (req, res) => {
    const { status, startDate, endDate, product_id, supplier_id, page = 1, limit = 10 } = req.query;

    const where = {};
    const include = [{
        model: OrderItem,
        include: []
    }];

    // Status filter
    if (status) where.status = status;

    // Date range filter
    if (startDate && endDate) {
        where.createdAt = {
            [Op.between]: [new Date(startDate), new Date(endDate)]
        };
    }

    // Product filter
    if (product_id) {
        include[0].where = include[0].where || {};
        include[0].where.product_id = product_id;
    }

    // Supplier filter
    if (supplier_id) {
        include[0].include.push({
            model: Supplier,
            where: { id: supplier_id }
        });
    }

    const orders = await Order.findAndCountAll({
        where,
        include,
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: (page - 1) * limit,
        distinct: true
    });

    res.json({
        success: true,
        data: orders.rows,
        meta: {
            total: orders.count,
            page: parseInt(page),
            totalPages: Math.ceil(orders.count / limit)
        }
    });
});

// GET user's orders
export const getUserOrders = asyncHandler(async (req, res) => {
    const user_id = req.user.id;
    const { status } = req.query;

    const where = { user_id };
    if (status) where.status = status;

    const orders = await Order.findAll({
        where,
        include: [{
            model: OrderItem,
            include: [Product]
        }],
        order: [['createdAt', 'DESC']]
    });

    res.json({
        success: true,
        data: orders
    });
});

// GET order details
export const getOrderDetails = asyncHandler(async (req, res) => {
    const order = await Order.findByPk(req.params.id, {
        include: [{
            model: OrderItem,
            include: [Product, Supplier]
        }]
    });

    if (!order) {
        res.status(404).json({
            success: false,
            message: 'Order not found',
            code: 'ORDER_NOT_FOUND'
        });
        return;
    }

    const role = await Role.findByPk(req.user.role_id);
    // Verify ownership (unless admin)
    if (order.user_id !== req.user.id && role.name !== 'Admin') {
        res.status(403).json({
            success: false,
            message: 'Not authorized to view this order',
            code: 'UNAUTHORIZED'
        });
        return;
    }
    const address = await Address.findByPk(order.address_id);
    const shippingCost = await ShippingCost.findOne({
        where: { city: address.city }
    });
    const orderDetail = {
        id:order.id, order_number:order.order_number, status:order.status,
        total:order.total_amount, createdAt:order.createdAt, updatedAt:order.updatedAt,
        items: order.OrderItems,
        address_id: address.id,
        shipping_name: address.shipping_name, shipping_phone: address.shipping_phone,
        address_line1: address.address_line1, address_line2:address.address_line2, city: address.city,
        shipping_cost: shippingCost.shipping_cost, estimated_delivery_date: shippingCost.estimated_delivery_date
    }

    res.json({
        success: true,
        data: orderDetail
    });
});

// UPDATE order status
export const updateOrderStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const orderId = req.params.id;

    if (!STATUS_TRANSITIONS[status]) {
        res.status(400).json({
            success: false,
            message: 'Invalid status value',
            code: 'INVALID_STATUS'
        });
        return;
    }

    const transaction = await sequelize.transaction();
    try {
        const order = await Order.findByPk(orderId, { transaction });
        if (!order) {
            await transaction.rollback();
            res.status(404).json({
                success: false,
                message: 'Order not found',
                code: 'ORDER_NOT_FOUND'
            });
            return;
        }

        // Validate status transition
        if (!STATUS_TRANSITIONS[order.status].includes(status)) {
            await transaction.rollback();
            res.status(400).json({
                success: false,
                message: `Cannot change status from ${order.status} to ${status}`,
                code: 'INVALID_STATUS_TRANSITION'
            });
            return;
        }

        // Handle canceled orders (restock items)
        if (status === 'cancelled' && order.status !== 'cancelled') {
            const orderItems = await OrderItem.findAll({
                where: { order_id: order.id },
                transaction
            });

            for (const item of orderItems) {
                await SupplierItem.increment('stock_level', {
                    by: item.quantity,
                    where: {
                        product_id: item.product_id,
                        supplier_id: item.supplier_id
                    },
                    transaction
                });
            }
        }

        // Update order
        order.status = status;
        await order.save({ transaction });

        await transaction.commit();

        res.json({
            success: true,
            message: 'Order status updated',
            data: order
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Status update error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update order status',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            code: 'STATUS_UPDATE_ERROR'
        });
    }
});

// GET order statistics
export const getOrderStats = asyncHandler(async (req, res) => {
    try {
        // Date calculations
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        thirtyDaysAgo.setHours(0, 0, 0, 0);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Execute all queries in parallel for better performance
        const [
            salesData,
            statusCounts,
            totalRevenue,
            avgOrderValue,
            totalOrders,
            completedOrders,
            pendingOrders,
            todayOrders,
            highValueOrders,
            recentCancellations
        ] = await Promise.all([
            // Last 30 days sales data
            Order.findAll({
                attributes: [
                    [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
                    [sequelize.fn('SUM', sequelize.col('total_amount')), 'total_sales'],
                    [sequelize.fn('COUNT', sequelize.col('id')), 'order_count']
                ],
                where: {
                    createdAt: { [Op.gte]: thirtyDaysAgo },
                    status: { [Op.notIn]: ['cancelled'] },
                },
                group: [sequelize.fn('DATE', sequelize.col('created_at'))],
                order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'ASC']],
                raw: true
            }),

            // Status distribution
            Order.findAll({
                attributes: [
                    'status',
                    [sequelize.fn('COUNT', sequelize.col('id')), 'count']
                ],
                group: ['status'],
                raw: true
            }),

            // Total revenue (only delivered orders)
            Order.sum('total_amount', {
                where: { status: 'delivered' }
            }),

            // Average order value
            Order.findOne({
                attributes: [
                    [sequelize.fn('AVG', sequelize.col('total_amount')), 'avg']
                ],
                where: { status: 'delivered' },
                raw: true
            }),

            // Total orders count (excluding cancelled)
            Order.count(),

            // Completed orders count (status = 'delivered')
            Order.count({
                where: { status: 'delivered' }
            }),

            // Pending orders count (status = 'pending' or 'processing')
            Order.count({
                where: {
                    status: { [Op.in]: ['pending', 'processing'] }
                }
            }),

            // Today's orders count
            Order.count({
                where: {
                    createdAt: { [Op.gte]: today },
                    status: { [Op.not]: 'cancelled' }
                }
            }),

            // High value orders (top 5 orders by amount)
            Order.findAll({
                attributes: ['id', 'total_amount', 'created_at', 'status'],
                where: { status: { [Op.not]: 'cancelled' } },
                order: [['total_amount', 'DESC']],
                limit: 5,
                raw: true
            }),

            // Recent cancellations (last 10)
            Order.findAll({
                attributes: ['id', 'total_amount', 'created_at'],
                where: { status: 'cancelled' },
                order: [['created_at', 'DESC']],
                limit: 10,
                raw: true
            })
        ]);

        // Calculate conversion rate (completed orders / total orders)
        const conversionRate = totalOrders > 0
            ? (completedOrders / totalOrders) * 100
            : 0;

        res.json({
            success: true,
            data: {
                // Time-based metrics
                sales_trend: salesData,
                today_orders: todayOrders,
                recent_cancellations: recentCancellations,

                // Status metrics
                status_distribution: statusCounts,
                total_orders: totalOrders,
                completed_orders: completedOrders,
                pending_orders: pendingOrders,
                conversion_rate: parseFloat(conversionRate.toFixed(2)),

                // Financial metrics
                total_revenue: totalRevenue || 0,
                average_order_value: avgOrderValue?.avg || 0,
                high_value_orders: highValueOrders,

                // Performance metrics
                orders_last_30_days: salesData.reduce((sum, day) => sum + day.order_count, 0),
                revenue_last_30_days: salesData.reduce((sum, day) => sum + parseFloat(day.total_sales || 0), 0)
            }
        });
    } catch (error) {
        console.error('Error fetching order stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching statistics',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            code: 'STATS_ERROR'
        });
    }
});