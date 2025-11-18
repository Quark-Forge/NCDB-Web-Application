import express from 'express';
import {
    createShippingAddress,
    getShippingAddress,
    updateShippingAddress,
    deleteShippingAddress
} from '../controllers/shippingAdderssController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, authorize('Customer'), getShippingAddress)
    .post(protect, authorize('Customer'), createShippingAddress);

router.route('/:id')
    .put(protect, authorize('Customer'), updateShippingAddress)
    .delete(protect, authorize('Customer'), deleteShippingAddress);

export default router;