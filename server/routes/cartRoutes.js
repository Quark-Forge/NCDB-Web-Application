import express from 'express';
import { authorize, protect } from '../middleware/authMiddleware.js';
import {
      getCart,
      addToCart,
      updateCartItem,
      clearCart,
      removeFromCart,
      getCartTotal,
} from '../controllers/cartController.js'
const router = express.Router();

router.route('/')
      .get(protect,authorize('Customer'), getCart)
      .post(protect,authorize('Customer'), addToCart)
      .delete(protect,authorize('Customer'), clearCart);

router.route('/items/:product_id')
      .put(protect,authorize('Customer'), updateCartItem)
      .delete(protect,authorize('Customer'), removeFromCart);

router.route('/total')
      .get(protect, getCartTotal);

export default router;