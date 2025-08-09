import express from 'express';
import { authorize, protect } from '../middleware/authMiddleware.js';
import {
      getCart,
      addToCart,
      // removeFromCart,
} from '../controllers/cartController.js'
const router = express.Router();

router.route('/')
      .get(protect,authorize('Customer'), getCart)
      .post(protect,authorize('Customer'), addToCart);

// router.delete('/items/:product_id', protect, removeFromCart);

export default router;