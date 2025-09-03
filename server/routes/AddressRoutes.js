import express from 'express';
import { createShippingAddress, getShippingAddress } from '../controllers/shippingAdderssController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, authorize('Customer'), getShippingAddress)
    .post(protect, authorize('Customer'), createShippingAddress);

export default router;