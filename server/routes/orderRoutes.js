import express from 'express';
import { authorize, protect } from '../middleware/authMiddleware.js';
import {
    cancelUserOrder,
    checkoutCart,
    getAllOrders,
    getOrderDetails,
    getOrderStats,
    getUserOrders,
    updateOrderStatus
} from '../controllers/orderController.js';

const router = express.Router();

router.route('/').get(protect, authorize('Admin', 'Order Manager', 'Inventory Manager'), getAllOrders);
router.route('/checkout').post(protect, authorize('Customer'), checkoutCart);
router.route('/stats').get(protect, authorize('Admin', 'Order Manager'), getOrderStats);
router.route('/my-orders').get(protect, authorize('Customer'), getUserOrders);
router.route('/:id').get(protect, authorize('Admin', 'Order Manager', 'Customer'), getOrderDetails);
router.route('/:id/status').put(protect, authorize('Admin', 'Order Manager'), updateOrderStatus);
router.route('/:id/cancel').put(protect, authorize('Customer'), cancelUserOrder);




export default router;