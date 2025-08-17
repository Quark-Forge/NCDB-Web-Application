import asyncHandler from 'express-async-handler';
import Payment from '../models/index.js';

export const updatePaymentStatus = asyncHandler(async (req, res) => {
  const { payment_id } = req.params;
  const { status } = req.body;

  // Validate status
  const validStatuses = ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid payment status' });
  }

  try {
    const payment = await Payment.findByPk(payment_id);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    payment.payment_status = status;
    await payment.save();

    res.status(200).json({ message: 'Payment status updated successfully', payment });
  } catch (error) {
    res.status(500).json({ message: 'Error updating payment status', error: error.message });
  }
});
