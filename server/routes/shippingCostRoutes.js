import express from 'express';
import { createShippingCost, getShippingCosts } from '../controllers/shippingCostController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';


const router = express.Router();

router.route('/')
    .get(protect, getShippingCosts)
    .post( createShippingCost);

export default router;