import asyncHandler from 'express-async-handler';
import { Op } from 'sequelize';
import sequelize from '../config/db.js';
import { Order, Payment, Address, OrderItem, Product } from '../models/index.js';

// GET payment transactions (specific for payments page)
export const getPaymentTransactions = asyncHandler(async (req, res) => {
  const {
    search,
    range = '90d',
    payment_status,
    payment_method,
    page = 1,
    limit = 10
  } = req.query;

  const where = {};
  const include = [
    {
      model: Order,
      as: 'order',
      attributes: ['id', 'order_number', 'status', 'createdAt'],
      include: [
        {
          model: Address,
          attributes: ['id', 'shipping_name', 'city']
        },
        {
          model: OrderItem,
          attributes: ['id'],
          include: [{
            model: Product,
            attributes: ['id', 'name']
          }]
        }
      ]
    }
  ];

  // Payment status filter
  if (payment_status && payment_status !== 'all') {
    where.payment_status = payment_status;
  }

  // Payment method filter
  if (payment_method && payment_method !== 'all') {
    where.payment_method = payment_method;
  }

  // Date range filter
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

  // Search filter
  if (search && search.trim() !== '') {
    const searchConditions = [
      { transaction_id: { [Op.like]: `%${search}%` } },
      { '$order.order_number$': { [Op.like]: `%${search}%` } },
      { '$order.Address.shipping_name$': { [Op.like]: `%${search}%` } }
    ];

    where[Op.or] = searchConditions;
  }

  try {
    const payments = await Payment.findAndCountAll({
      where,
      include,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (page - 1) * limit,
      distinct: true
    });

    // Format response for payments page
    const paymentTransactions = payments.rows.map(payment => ({
      id: payment.id,
      order_id: payment.order_id,
      order_number: payment.order?.order_number,
      customer_name: payment.order?.Address?.shipping_name,
      customer_city: payment.order?.Address?.city,
      date: payment.createdAt,
      amount: payment.amount,
      payment_status: payment.payment_status,
      payment_method: payment.payment_method,
      transaction_id: payment.transaction_id,
      order_status: payment.order?.status,
      payment_date: payment.payment_date,
      items_count: payment.order?.OrderItems?.length || 0,
      gateway_response: payment.gateway_response
    }));

    res.json({
      success: true,
      data: paymentTransactions,
      meta: {
        total: payments.count,
        page: parseInt(page),
        totalPages: Math.ceil(payments.count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching payment transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment transactions',
      error: error.message
    });
  }
});

// GET payment statistics
export const getPaymentStats = asyncHandler(async (req, res) => {
  const { range = '30d' } = req.query;

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
      startDate = new Date(0);
      break;
    default:
      startDate.setDate(now.getDate() - 30);
  }

  startDate.setHours(0, 0, 0, 0);

  try {
    const [
      totalRevenue,
      statusCounts,
      paymentMethodStats,
      recentPayments,
      dailyRevenue
    ] = await Promise.all([
      // Total revenue (only paid payments)
      Payment.sum('amount', {
        where: {
          payment_status: 'paid',
          createdAt: { [Op.gte]: startDate }
        }
      }),

      // Payment status counts
      Payment.findAll({
        attributes: [
          'payment_status',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
          [sequelize.fn('SUM', sequelize.col('amount')), 'total_amount']
        ],
        where: {
          createdAt: { [Op.gte]: startDate }
        },
        group: ['payment_status'],
        raw: true
      }),

      // Payment method statistics
      Payment.findAll({
        attributes: [
          'payment_method',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
          [sequelize.fn('SUM', sequelize.col('amount')), 'total_amount']
        ],
        where: {
          createdAt: { [Op.gte]: startDate }
        },
        group: ['payment_method'],
        raw: true
      }),

      // Recent payments
      Payment.findAll({
        include: [{
          model: Order,
          as: 'order',
          attributes: ['order_number'],
          include: [{
            model: Address,
            attributes: ['shipping_name']
          }]
        }],
        where: {
          createdAt: { [Op.gte]: startDate }
        },
        order: [['createdAt', 'DESC']],
        limit: 5
      }),

      // Daily revenue
      Payment.findAll({
        attributes: [
          [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
          [sequelize.fn('SUM', sequelize.col('amount')), 'daily_revenue'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'payment_count']
        ],
        where: {
          payment_status: 'paid',
          createdAt: { [Op.gte]: startDate }
        },
        group: [sequelize.fn('DATE', sequelize.col('created_at'))],
        order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'ASC']],
        raw: true
      })
    ]);

    const successfulTransactions = statusCounts.find(stat => stat.payment_status === 'paid')?.count || 0;
    const pendingIssues = statusCounts
      .filter(stat => stat.payment_status === 'pending' || stat.payment_status === 'failed')
      .reduce((sum, stat) => sum + parseInt(stat.count), 0);

    res.json({
      success: true,
      data: {
        totalRevenue: parseFloat(totalRevenue || 0),
        successfulTransactions: parseInt(successfulTransactions),
        pendingIssues: parseInt(pendingIssues),
        totalTransactions: statusCounts.reduce((sum, stat) => sum + parseInt(stat.count), 0),
        statusDistribution: statusCounts,
        paymentMethodStats: paymentMethodStats,
        recentPayments: recentPayments.map(payment => ({
          id: payment.id,
          order_number: payment.order?.order_number,
          customer_name: payment.order?.Address?.shipping_name,
          amount: payment.amount,
          payment_status: payment.payment_status,
          payment_method: payment.payment_method,
          transaction_id: payment.transaction_id,
          date: payment.createdAt
        })),
        dailyRevenue: dailyRevenue,
        period_start: startDate.toISOString(),
        period_end: now.toISOString()
      }
    });
  } catch (error) {
    console.error('Error fetching payment stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment statistics',
      error: error.message
    });
  }
});

// GET single payment details
export const getPaymentDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const payment = await Payment.findByPk(id, {
      include: [{
        model: Order,
        as: 'order',
        include: [
          {
            model: Address,
            attributes: ['id', 'shipping_name', 'shipping_phone', 'address_line1', 'city', 'state', 'country', 'postal_code']
          },
          {
            model: OrderItem,
            include: [Product]
          }
        ]
      }]
    });

    if (!payment) {
      res.status(404).json({
        success: false,
        message: 'Payment not found',
        code: 'PAYMENT_NOT_FOUND'
      });
      return;
    }

    res.json({
      success: true,
      data: payment
    });
  } catch (error) {
    console.error('Error fetching payment details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment details',
      error: error.message
    });
  }
});

// UPDATE payment status
export const updatePaymentStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { payment_status, notes } = req.body;

  const validStatuses = ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'];

  if (!validStatuses.includes(payment_status)) {
    res.status(400).json({
      success: false,
      message: 'Invalid payment status',
      code: 'INVALID_PAYMENT_STATUS'
    });
    return;
  }

  try {
    const payment = await Payment.findByPk(id);

    if (!payment) {
      res.status(404).json({
        success: false,
        message: 'Payment not found',
        code: 'PAYMENT_NOT_FOUND'
      });
      return;
    }

    // Update payment status
    payment.payment_status = payment_status;

    // If status is paid and payment_date is not set, set it to now
    if (payment_status === 'paid' && !payment.payment_date) {
      payment.payment_date = new Date();
    }

    // Update gateway response if notes provided
    if (notes) {
      const currentResponse = payment.gateway_response || {};
      payment.gateway_response = {
        ...currentResponse,
        admin_notes: notes,
        status_updated_at: new Date().toISOString(),
        updated_by: req.user.id
      };
    }

    await payment.save();

    res.json({
      success: true,
      message: 'Payment status updated successfully',
      data: payment
    });
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating payment status',
      error: error.message
    });
  }
});

// Process refund
export const processRefund = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { refund_amount, reason } = req.body;

  try {
    const payment = await Payment.findByPk(id, {
      include: [{
        model: Order,
        as: 'order'
      }]
    });

    if (!payment) {
      res.status(404).json({
        success: false,
        message: 'Payment not found',
        code: 'PAYMENT_NOT_FOUND'
      });
      return;
    }

    if (payment.payment_status !== 'paid') {
      res.status(400).json({
        success: false,
        message: 'Only paid payments can be refunded',
        code: 'INVALID_REFUND_STATUS'
      });
      return;
    }

    const refundAmount = parseFloat(refund_amount) || payment.amount;

    if (refundAmount > payment.amount) {
      res.status(400).json({
        success: false,
        message: 'Refund amount cannot exceed payment amount',
        code: 'INVALID_REFUND_AMOUNT'
      });
      return;
    }

    // Update payment status based on refund amount
    if (refundAmount === payment.amount) {
      payment.payment_status = 'refunded';
    } else {
      payment.payment_status = 'partially_refunded';
    }

    // Update gateway response with refund details
    const currentResponse = payment.gateway_response || {};
    payment.gateway_response = {
      ...currentResponse,
      refund_processed: true,
      refund_amount: refundAmount,
      refund_reason: reason,
      refund_date: new Date().toISOString(),
      processed_by: req.user.id
    };

    await payment.save();

    res.json({
      success: true,
      message: `Refund of $${refundAmount} processed successfully`,
      data: payment
    });
  } catch (error) {
    console.error('Error processing refund:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing refund',
      error: error.message
    });
  }
});