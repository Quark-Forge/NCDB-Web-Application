import express from 'express';
import {
    uploadProductImage,
    deleteProductImage,
    uploadProfilePhoto,
    deleteProfilePhoto
} from '../controllers/uploadController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';
import { productUpload, profileUpload } from '../config/multer.js';

const router = express.Router();

// Product image routes
router.route('/products/:id/image')
    .post(protect, authorize('Admin', 'Inventory Manager'), productUpload.single('image'), uploadProductImage)
    .delete(protect, authorize('Admin', 'Inventory Manager'), deleteProductImage);

// Profile photo routes
router.route('/profile/photo')
    .post(protect, profileUpload.single('photo'), uploadProfilePhoto)
    .delete(protect, deleteProfilePhoto);

export default router;