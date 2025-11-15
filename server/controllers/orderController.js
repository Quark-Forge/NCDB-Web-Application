import asyncHandler from 'express-async-handler';
import { Op } from 'sequelize';
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
    ShippingCost,
    User,
    Payment
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
    const { address_id, selected_items, payment_method = 'cash_on_delivery' } = req.body;

    // Validate shipping details
    if (!address_id) {
        res.status(400);
        throw new Error('Missing required shipping details (address_id)');
    }

    if (!selected_items || !Array.isArray(selected_items) || selected_items.length === 0) {
        res.status(400);
        throw new Error('No items selected for checkout');
    }

    // Get cart with items including supplier info
    const cart = await Cart.findOne({
        where: { user_id },
        include: [{
            model: CartItem,
            include: [Product, Supplier],
            where: {
                quantity: { [Op.gt]: 0 },
                id: { [Op.in]: selected_items }
            }
        }]
    });

    if (!cart?.CartItems?.length) {
        res.status(400).json({
            success: false,
            message: 'No valid items selected for checkout',
            code: 'NO_SELECTED_ITEMS'
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
                product_data: {
                    name: cartItem.Product.name,
                    sku: cartItem.Product.sku,
                    image_url: cartItem.Product.base_image_url
                },
                supplier_data: {
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
                message: 'Some selected items are no longer available',
                issues: stockIssues,
                code: 'STOCK_ISSUES'
            });
            return;
        }

        // Get shipping cost for total calculation
        const address = await Address.findByPk(address_id, { transaction });
        const shippingCost = await ShippingCost.findOne({
            where: { city: address.city },
            transaction
        });

        const shippingAmount = shippingCost ? parseFloat(shippingCost.cost) : 0;
        const finalTotalAmount = totalAmount + shippingAmount;

        // Create order
        const order = await Order.create({
            order_number: generateOrderNumber(),
            address_id,
            total_amount: finalTotalAmount,
            user_id,
            status: 'pending',
            notes: 'Order created from selected cart items'
        }, { transaction });

        // Create order items
        await OrderItem.bulkCreate(
            orderItems.map(item => ({
                ...item,
                order_id: order.id
            })),
            { transaction }
        );

        // Create payment record with pending status
        const payment = await Payment.create({
            order_id: order.id,
            payment_method: payment_method,
            payment_status: 'pending',
            amount: finalTotalAmount,
            transaction_id: `TXN_${generateOrderNumber()}`,
            gateway_response: null
        }, { transaction });

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

        // Remove only the selected items from cart
        await CartItem.destroy({
            where: {
                cart_id: cart.id,
                id: { [Op.in]: selected_items }
            },
            transaction
        });

        await transaction.commit();

        // Return complete order details with payment info
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
                    },
                    {
                        model: Payment,
                        as: 'payment' // FIX: Added the alias here
                    }
                ]
            });

            const responseData = {
                id: orderDetail.id,
                order_number: orderDetail.order_number,
                status: orderDetail.status,
                total_amount: orderDetail.total_amount,
                items: orderDetail.OrderItems.map(item => ({
                    id: item.id,
                    quantity: item.quantity,
                    product_id: item.Product.id,
                    product_name: item.Product.name,
                    supplier_id: item.Supplier.id,
                    supplier_name: item.Supplier.name,
                })),
                address_id: orderDetail.Address.id,
                city: orderDetail.Address.city,
                shipping_cost: shippingAmount,
                payment: orderDetail.payment ? {
                    id: orderDetail.payment.id,
                    payment_method: orderDetail.payment.payment_method,
                    payment_status: orderDetail.payment.payment_status,
                    amount: orderDetail.payment.amount,
                    transaction_id: orderDetail.payment.transaction_id
                } : {
                    id: payment.id,
                    payment_method: payment.payment_method,
                    payment_status: payment.payment_status,
                    amount: payment.amount,
                    transaction_id: payment.transaction_id
                }
            };

            res.status(201).json({
                success: true,
                message: 'Order created successfully with selected items',
                data: responseData
            });
        } catch (fetchError) {
            console.error('Error fetching order details:', fetchError);
            res.status(201).json({
                success: true,
                message: 'Order created successfully but could not fetch complete details',
                data: {
                    id: order.id,
                    payment_id: payment.id
                }
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
    const { search, range = '90d', status, product_id, supplier_id, payment_status, page = 1, limit = 10 } = req.query;

    const where = {};
    const include = [
        {
            model: OrderItem,
            include: []
        },
        {
            model: Address,
        },
        {
            model: Payment,
            as: 'payment',
            attributes: ['id', 'payment_status', 'payment_method', 'amount', 'transaction_id', 'payment_date'] // Include specific payment fields
        }
    ];

    // Status filter
    if (status) where.status = status;

    // Payment status filter
    if (payment_status) {
        include[2].where = include[2].where || {};
        include[2].where.payment_status = payment_status;
    }

    // Date range filter - using only range parameter
    if (range && range !== 'all') {
        const now = new Date();
        let startDay = new Date();

        switch (range) {
            case '7d':
                startDay.setDate(now.getDate() - 7);
                break;
            case '30d':
                startDay.setDate(now.getDate() - 30);
                break;
            case '90d':
                startDay.setDate(now.getDate() - 90);
                break;
            default:
                startDay.setDate(now.getDate() - 90);
        }

        startDay.setHours(0, 0, 0, 0);
        where.createdAt = {
            [Op.between]: [startDay, now]
        };
    }

    // Search filter - Search by order_number and payment transaction_id
    if (search && search.trim() !== '') {
        const searchConditions = [];

        // Search by order_number (main search field)
        searchConditions.push({
            order_number: { [Op.like]: `%${search}%` }
        });

        // Also search by database ID if search is numeric
        if (!isNaN(search)) {
            searchConditions.push({
                id: parseInt(search)
            });
        }

        // Search by payment transaction_id
        searchConditions.push({
            '$payment.transaction_id$': { [Op.like]: `%${search}%` }
        });

        where[Op.or] = searchConditions;
    }

    // Product filter
    if (product_id) {
        include[0].where = include[0].where || {};
        include[0].where.product_id = product_id;
    }

    // Supplier filter
    if (supplier_id) {
        include[0].include = include[0].include || [];
        include[0].include.push({
            model: Supplier,
            where: { id: supplier_id }
        });
    }

    try {
        const orders = await Order.findAndCountAll({
            where,
            include,
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: (page - 1) * limit,
            distinct: true
        });

        const cities = [...new Set(orders.rows.map(order => order.Address?.city).filter(city => city))];

        // Fetch shipping costs for all cities in one query
        const shippingCosts = await ShippingCost.findAll({
            where: { city: cities }
        });

        // Create a map of city to shipping cost for quick lookup
        const shippingCostMap = {};
        shippingCosts.forEach(cost => {
            shippingCostMap[cost.city] = cost;
        });

        // Add shipping cost details to each order and format payment data
        const ordersWithShipping = orders.rows.map(order => {
            const orderData = order.get({ plain: true });
            const city = order.Address?.city;

            if (city && shippingCostMap[city]) {
                orderData.shippingCost = shippingCostMap[city];
            } else {
                orderData.shippingCost = null;
            }

            // Calculate total with shipping
            const shippingAmount = orderData.shippingCost ? parseFloat(orderData.shippingCost.cost) : 0;
            const orderAmount = parseFloat(orderData.total_amount) || 0;
            orderData.final_total = (orderAmount + shippingAmount).toFixed(2);

            // Format payment information for easier access
            if (orderData.payment) {
                orderData.payment_id = orderData.payment.id;
                orderData.payment_status = orderData.payment.payment_status;
                orderData.payment_method = orderData.payment.payment_method;
                orderData.payment_amount = orderData.payment.amount;
                orderData.transaction_id = orderData.payment.transaction_id;
                orderData.payment_date = orderData.payment.payment_date;
            } else {
                // Handle cases where payment record doesn't exist
                orderData.payment_id = null;
                orderData.payment_status = 'pending';
                orderData.payment_method = null;
                orderData.payment_amount = null;
                orderData.transaction_id = null;
                orderData.payment_date = null;
            }

            return orderData;
        });

        res.json({
            success: true,
            data: ordersWithShipping,
            meta: {
                total: orders.count,
                page: parseInt(page),
                totalPages: Math.ceil(orders.count / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching orders',
            error: error.message
        });
    }
});

// GET user's orders
export const getUserOrders = asyncHandler(async (req, res) => {
    const user_id = req.user.id;
    const { status, payment_status } = req.query;

    const where = { user_id };
    if (status) where.status = status;

    const include = [
        {
            model: OrderItem,
            include: [Product]
        },
        {
            model: Payment,
            as: 'payment',
            attributes: ['id', 'payment_status', 'payment_method', 'amount', 'transaction_id', 'payment_date']
        },
        {
            model: Address,
            attributes: ['id', 'city', 'shipping_name', 'address_line1']
        }
    ];

    // Payment status filter
    if (payment_status) {
        include[1].where = include[1].where || {};
        include[1].where.payment_status = payment_status;
    }

    const orders = await Order.findAll({
        where,
        include,
        order: [['createdAt', 'DESC']]
    });

    // Fetch shipping costs for all cities in one query
    const cities = [...new Set(orders.map(order => order.Address?.city).filter(city => city))];
    const shippingCosts = await ShippingCost.findAll({
        where: { city: cities }
    });

    // Create a map of city to shipping cost for quick lookup
    const shippingCostMap = {};
    shippingCosts.forEach(cost => {
        shippingCostMap[cost.city] = cost;
    });

    // Format orders with payment and shipping information
    const formattedOrders = orders.map(order => {
        const orderData = order.get({ plain: true });
        const city = order.Address?.city;

        // Add shipping cost
        if (city && shippingCostMap[city]) {
            orderData.shippingCost = shippingCostMap[city];
        } else {
            orderData.shippingCost = null;
        }

        // Calculate final total with shipping
        const shippingAmount = orderData.shippingCost ? parseFloat(orderData.shippingCost.cost) : 0;
        const orderAmount = parseFloat(orderData.total_amount) || 0;
        orderData.final_total = (orderAmount + shippingAmount).toFixed(2);

        // Format payment information
        if (orderData.payment) {
            orderData.payment_id = orderData.payment.id;
            orderData.payment_status = orderData.payment.payment_status;
            orderData.payment_method = orderData.payment.payment_method;
            orderData.payment_amount = orderData.payment.amount;
            orderData.transaction_id = orderData.payment.transaction_id;
            orderData.payment_date = orderData.payment.payment_date;
        } else {
            // Default values if no payment record exists
            orderData.payment_id = null;
            orderData.payment_status = 'pending';
            orderData.payment_method = null;
            orderData.payment_amount = null;
            orderData.transaction_id = null;
            orderData.payment_date = null;
        }

        // Simplify address data for user orders list
        orderData.shipping_address = {
            city: orderData.Address?.city,
            shipping_name: orderData.Address?.shipping_name,
            address_line1: orderData.Address?.address_line1
        };

        // Remove the full Address object to reduce response size
        delete orderData.Address;

        return orderData;
    });

    res.json({
        success: true,
        data: formattedOrders
    });
});
// GET order details
export const getOrderDetails = asyncHandler(async (req, res) => {
    const orderId = req.params.id;

    try {
        const order = await Order.findByPk(orderId, {
            include: [
                {
                    model: OrderItem,
                    include: [Product, Supplier]
                },
                {
                    model: Payment,
                    as: 'payment',
                    attributes: ['id', 'payment_status', 'payment_method', 'amount', 'transaction_id', 'payment_date', 'gateway_response']
                },
                {
                    model: Address
                }
            ]
        });

        if (!order) {
            res.status(404).json({
                success: false,
                message: 'Order not found',
                code: 'ORDER_NOT_FOUND'
            });
            return;
        }

        // Check permissions:
        // - Admin/Manager can view any order
        // - Customers can only view their own orders
        // const isAdminOrManager = ['admin', 'order manager', 'inventory manager'].includes(req.user.user_role?.toLowerCase());
        // const isOrderOwner = order.user_id === req.user.id;

        // if (!isAdminOrManager && !isOrderOwner) {
        //     res.status(403).json({
        //         success: false,
        //         message: 'Access denied. You can only view your own orders.',
        //         code: 'ACCESS_DENIED'
        //     });
        //     return;
        // }

        const address = order.Address || await Address.findByPk(order.address_id);
        const shippingCost = await ShippingCost.findOne({
            where: { city: address.city }
        });

        const shippingAmount = parseFloat(shippingCost?.cost) || 0;
        const orderAmount = parseFloat(order?.total_amount) || 0;
        const total = (orderAmount + shippingAmount).toFixed(2);

        const orderDetail = {
            id: order.id,
            order_number: order.order_number,
            status: order.status,
            total_amount: order.total_amount,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
            items: order.OrderItems.map(item => ({
                id: item.id,
                quantity: item.quantity,
                price: item.price,
                product: {
                    id: item.Product.id,
                    name: item.Product.name,
                    sku: item.Product.sku,
                    base_image_url: item.Product.base_image_url
                },
                supplier: {
                    id: item.Supplier.id,
                    name: item.Supplier.name,
                    contact: item.Supplier.contact_number
                }
            })),
            // Payment information
            payment: order.payment ? {
                id: order.payment.id,
                payment_status: order.payment.payment_status,
                payment_method: order.payment.payment_method,
                amount: order.payment.amount,
                transaction_id: order.payment.transaction_id,
                payment_date: order.payment.payment_date,
                gateway_response: order.payment.gateway_response
            } : {
                id: null,
                payment_status: 'pending',
                payment_method: null,
                amount: null,
                transaction_id: null,
                payment_date: null,
                gateway_response: null
            },
            // Address information
            address: {
                id: address.id,
                shipping_name: address.shipping_name,
                shipping_phone: address.shipping_phone,
                address_line1: address.address_line1,
                address_line2: address.address_line2,
                city: address.city,
                state: address.state,
                country: address.country,
                postal_code: address.postal_code
            },
            // Shipping information
            shipping: {
                cost: shippingCost?.cost || 0,
                estimated_delivery_date: shippingCost?.estimated_delivery_date,
                city: address.city
            },
            // Totals
            subtotal: orderAmount.toFixed(2),
            shipping_cost: shippingAmount.toFixed(2),
            final_total: total
        };

        res.json({
            success: true,
            data: orderDetail
        });
    } catch (error) {
        console.error('Error fetching order details:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching order details',
            error: error.message
        });
    }
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

        // Update order status
        order.status = status;
        await order.save({ transaction });

        // Update or create payment status based on order status
        let payment = await Payment.findOne({
            where: { order_id: order.id },
            transaction
        });

        if (status === 'delivered') {
            if (payment) {
                payment.payment_status = 'paid';
                payment.payment_date = new Date();
                await payment.save({ transaction });
            } else {
                payment = await Payment.create({
                    order_id: order.id,
                    payment_method: 'cash_on_delivery',
                    payment_status: 'paid',
                    amount: order.total_amount,
                    transaction_id: `TXN_${generateOrderNumber()}`,
                    payment_date: new Date()
                }, { transaction });
            }
        } else if (status === 'cancelled') {
            if (payment) {
                payment.payment_status = 'failed';
                payment.payment_date = new Date();
                await payment.save({ transaction });
            } else {
                payment = await Payment.create({
                    order_id: order.id,
                    payment_method: 'cash_on_delivery',
                    payment_status: 'failed',
                    amount: order.total_amount,
                    transaction_id: `TXN_${generateOrderNumber()}`,
                    payment_date: new Date()
                }, { transaction });
            }
        }

        await transaction.commit();

        res.json({
            success: true,
            message: 'Order status updated',
            data: {
                order,
                payment: payment || null
            }
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

// Cancel order by user (only allowed before 'shipped')
export const cancelUserOrder = asyncHandler(async (req, res) => {
    const orderId = req.params.id;
    const user_id = req.user.id;

    const transaction = await sequelize.transaction();
    try {
        // Load order with items
        const order = await Order.findByPk(orderId, {
            include: [{ model: OrderItem }],
            transaction
        });

        if (!order) {
            await transaction.rollback();
            res.status(404).json({
                success: false,
                message: 'Order not found',
                code: 'ORDER_NOT_FOUND'
            });
            return;
        }

        // Ensure ownership (admins allowed to cancel as well)
        if (order.user_id !== user_id && req.user.role !== 'admin') {
            await transaction.rollback();
            res.status(403).json({
                success: false,
                message: 'Access denied. You can only cancel your own orders.',
                code: 'ACCESS_DENIED'
            });
            return;
        }

        // Only allow cancellation before shipped
        const notCancelable = ['shipped', 'delivered', 'cancelled'];
        if (notCancelable.includes(order.status)) {
            await transaction.rollback();
            res.status(400).json({
                success: false,
                message: `Cannot cancel order with status '${order.status}'. Orders can only be cancelled before 'shipped'.`,
                code: 'CANNOT_CANCEL'
            });
            return;
        }

        // Restock supplier items
        const items = order.OrderItems || await OrderItem.findAll({
            where: { order_id: order.id },
            transaction
        });

        for (const item of items) {
            await SupplierItem.increment('stock_level', {
                by: item.quantity,
                where: {
                    product_id: item.product_id,
                    supplier_id: item.supplier_id
                },
                transaction
            });
        }

        // Update order status
        order.status = 'cancelled';
        await order.save({ transaction });

        // Update or create payment as failed
        let payment = await Payment.findOne({
            where: { order_id: order.id },
            transaction
        });

        if (payment) {
            payment.payment_status = 'failed';
            payment.payment_date = new Date();
            await payment.save({ transaction });
        } else {
            payment = await Payment.create({
                order_id: order.id,
                payment_method: 'cash_on_delivery',
                payment_status: 'failed',
                amount: order.total_amount,
                transaction_id: `TXN_${generateOrderNumber()}`,
                payment_date: new Date()
            }, { transaction });
        }

        await transaction.commit();

        res.json({
            success: true,
            message: 'Order cancelled successfully',
            data: {
                order,
                payment
            }
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Cancel order error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to cancel order',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            code: 'CANCEL_ERROR'
        });
    }
});


// GET order statistics
export const getOrderStats = asyncHandler(async (req, res) => {
    try {
        const { range = '30d' } = req.query; // '7d', '30d', '90d', 'all'

        // Calculate date range
        const now = new Date();
        let startDate = new Date();

        switch (range) {
            case '7d':
                startDate.setDate(now.getDate() - 7);
                break;
            case '30d':
                startDate.setDate(now.getDate() - 30);
                break;
            case '90d':
                startDate.setDate(now.getDate() - 90);
                break;
            case 'all':
                startDate = new Date(0); // Beginning of time
                break;
            default:
                startDate.setDate(now.getDate() - 30);
        }

        startDate.setHours(0, 0, 0, 0);
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
            recentCancellations,
            topSellingProducts
        ] = await Promise.all([
            // Last X days sales data
            Order.findAll({
                attributes: [
                    [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
                    [sequelize.fn('SUM', sequelize.col('total_amount')), 'total_sales'],
                    [sequelize.fn('COUNT', sequelize.col('id')), 'order_count']
                ],
                where: {
                    createdAt: { [Op.gte]: startDate },
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
                where: {
                    createdAt: { [Op.gte]: startDate }
                },
                group: ['status'],
                raw: true
            }),

            // Total revenue (only delivered orders)
            Order.sum('total_amount', {
                where: {
                    status: 'delivered',
                    createdAt: { [Op.gte]: startDate }
                }
            }),

            // Average order value
            Order.findOne({
                attributes: [
                    [sequelize.fn('AVG', sequelize.col('total_amount')), 'avg']
                ],
                where: {
                    status: 'delivered',
                    createdAt: { [Op.gte]: startDate }
                },
                raw: true
            }),

            // Total orders count (excluding cancelled)
            Order.count({
                where: {
                    createdAt: { [Op.gte]: startDate },
                    status: { [Op.not]: 'cancelled' }
                }
            }),

            // Completed orders count (status = 'delivered')
            Order.count({
                where: {
                    status: 'delivered',
                    createdAt: { [Op.gte]: startDate }
                }
            }),

            // Pending orders count (status = 'pending' or 'processing')
            Order.count({
                where: {
                    status: { [Op.in]: ['pending', 'processing'] },
                    createdAt: { [Op.gte]: startDate }
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
                where: {
                    status: { [Op.not]: 'cancelled' },
                    createdAt: { [Op.gte]: startDate }
                },
                order: [['total_amount', 'DESC']],
                limit: 5,
                raw: true
            }),

            // Recent cancellations (last 10)
            Order.findAll({
                attributes: ['id', 'total_amount', 'created_at'],
                where: {
                    status: 'cancelled',
                    createdAt: { [Op.gte]: startDate }
                },
                order: [['created_at', 'DESC']],
                limit: 10,
                raw: true
            }),

            // Top 5 selling products
            OrderItem.findAll({
                attributes: [
                    'product_id',
                    [sequelize.fn('SUM', sequelize.col('OrderItem.quantity')), 'total_quantity'],
                    [sequelize.fn('SUM', sequelize.col('OrderItem.price')), 'total_revenue'],
                    [sequelize.fn('COUNT', sequelize.col('OrderItem.id')), 'order_count']
                ],
                include: [{
                    model: Order,
                    where: {
                        status: { [Op.not]: 'cancelled' },
                        createdAt: { [Op.gte]: startDate }
                    },
                    attributes: []
                }, {
                    model: Product,
                    attributes: ['name', 'sku', 'base_image_url'],
                    required: true
                }],
                group: ['OrderItem.product_id', 'Product.id'],
                order: [[sequelize.literal('total_quantity'), 'DESC']],
                limit: 5,
                raw: true,
                nest: true
            })
        ]);

        // Calculate conversion rate (completed orders / total orders)
        const conversionRate = totalOrders > 0
            ? (completedOrders / totalOrders) * 100
            : 0;

        // Format top selling products
        const formattedTopProducts = topSellingProducts.map(product => ({
            product_id: product.product_id,
            name: product.Product?.name,
            sku: product.Product?.sku,
            image_url: product.Product?.base_image_url,
            total_quantity: parseInt(product.total_quantity) || 0,
            total_revenue: parseFloat(product.total_revenue) || 0,
            order_count: parseInt(product.order_count) || 0
        }));

        res.json({
            success: true,
            data: {
                // Time-based metrics
                sales_trend: salesData,
                today_orders: todayOrders,
                recent_cancellations: recentCancellations,
                date_range: range,

                // Status metrics
                status_distribution: statusCounts,
                total_orders: totalOrders,
                completed_orders: completedOrders,
                pending_orders: pendingOrders,
                conversion_rate: parseFloat(conversionRate.toFixed(2)),

                // Financial metrics
                total_revenue: parseFloat(totalRevenue || 0).toFixed(2),
                average_order_value: avgOrderValue?.avg ? parseFloat(avgOrderValue.avg).toFixed(2) : 0,
                high_value_orders: highValueOrders,

                // Product metrics
                top_selling_products: formattedTopProducts,

                // Performance metrics
                orders_last_period: salesData.reduce((sum, day) => sum + (parseInt(day.order_count) || 0), 0),
                revenue_last_period: salesData.reduce((sum, day) => sum + parseFloat(day.total_sales || 0), 0).toFixed(2),

                // Date info
                period_start: startDate.toISOString(),
                period_end: now.toISOString()
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