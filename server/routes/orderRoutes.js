import express from 'express';
import { authorize, protect } from '../middleware/authMiddleware.js';
import { checkoutCart } from '../controllers/orderController.js';

const router = express.Router();

router.route('/checkout').post(protect, authorize('Customer'), checkoutCart);


export default router;