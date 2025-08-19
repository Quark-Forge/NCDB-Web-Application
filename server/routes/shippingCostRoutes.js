import express from 'express';
import {
    createShippingCost,
    deleteShippingCost,
    getShippingCosts,
    updateShippingCost
} from '../controllers/shippingCostController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';


const router = express.Router();

router.route('/')
    .get(protect, authorize('admin' , 'Order Maneger'), getShippingCosts)
    .post(protect, authorize('admin'), createShippingCost);
router.route('/:id')
    .put(protect, authorize('admin'), updateShippingCost)
    .delete(protect, authorize('admin'), deleteShippingCost);

export default router;