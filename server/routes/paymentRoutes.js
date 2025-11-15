import express from 'express';
import { authorize, protect } from '../middleware/authMiddleware.js';
import {
    getPaymentTransactions,
    getPaymentStats,
    getPaymentDetails,
    updatePaymentStatus,
    processRefund
} from '../controllers/paymentControler.js';

const router = express.Router();

router.route('/transactions')
    .get(protect, authorize('Admin', 'Order Manager'), getPaymentTransactions);

router.route('/stats')
    .get(protect, authorize('Admin', 'Order Manager'), getPaymentStats);

router.route('/:id')
    .get(protect, authorize('Admin', 'Order Manager'), getPaymentDetails);

router.route('/:id/status')
    .put(protect, authorize('Admin', 'Order Manager'), updatePaymentStatus);

router.route('/:id/refund')
    .post(protect, authorize('Admin', 'Order Manager'), processRefund);

export default router;