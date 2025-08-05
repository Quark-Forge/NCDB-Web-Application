import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
      getCart,
      addToCart,
} from '../controllers/cartController.js'
const router = express.Router();

router.route('/')
      .get(protect, getCart)
      .post(protect, addToCart);

export default router;