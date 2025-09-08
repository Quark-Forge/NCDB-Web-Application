import express from 'express';
import {
    addToWishList,
    getWishList,
    removeFromWishList,
    clearWishList,
    checkWishlistItem
} from '../controllers/wishListController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/check/:productId')
    .get(protect, authorize('Customer'), checkWishlistItem);

router.route('/')
    .get(protect, authorize('Customer'), getWishList)
    .post(protect, authorize('Customer'), addToWishList)
    .delete(protect, authorize('Customer'), clearWishList);

router.route('/:productId')
    .delete(protect, authorize('Customer'), removeFromWishList);

export default router;