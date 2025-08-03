import express from 'express';
import {
  getAllSupplierItems,
  getSupplierItemsBySupplier,
  deleteSupplierItem,
  updateSupplierItem,
} from '../controllers/supplierItemsController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);
router.use(authorize('Admin'));

// Routes
router.get('/', getAllSupplierItems);
router.get('/:supplier_id/items', getSupplierItemsBySupplier);
router.delete('/:supplier_id/items/:product_id', deleteSupplierItem);
router.put('/:supplier_id/items/:product_id', updateSupplierItem);

export default router;