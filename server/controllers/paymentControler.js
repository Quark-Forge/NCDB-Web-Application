import asyncHandler from 'express-async-handler';
import { Order, OrderItem, Payment, SupplierItem } from '../models/index.js';

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
    const order = await Order.findByPk(orderId, {
      include: [Payment],
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

      // Update payment status to failed if cancelled
      if (order.Payment) {
        order.Payment.payment_status = 'failed';
        await order.Payment.save({ transaction });
      }
    }

    // Update payment status when order is delivered (for cash on delivery)
    if (status === 'delivered' && order.status !== 'delivered') {
      if (order.Payment && order.Payment.payment_method === 'cash_on_delivery') {
        order.Payment.payment_status = 'paid';
        order.Payment.payment_date = new Date();
        await order.Payment.save({ transaction });
      }
    }

    // Update order status
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
