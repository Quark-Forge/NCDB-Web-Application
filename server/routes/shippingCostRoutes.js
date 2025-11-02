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
    .get(protect, authorize('Admin' , 'Order Manager', 'Customer'), getShippingCosts)
    .post(protect, authorize('Admin'), createShippingCost);
router.route('/:id')
    .put(protect, authorize('Admin'), updateShippingCost)
    .delete(protect, authorize('Admin'), deleteShippingCost);

export default router;