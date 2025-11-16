import express from 'express';
import {
  getAllSupplierItems,
  getSupplierItemsBySupplier,
  deleteSupplierItem,
  updateSupplierItem,
  getLowStockProducts,
  getCriticalStockProducts,
  getSupplierItemById,
  getMySupplierItems,
} from '../controllers/supplierItemsController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Routes
router.get('/low-stock', protect, authorize('Admin', 'Inventory Manager'), getLowStockProducts);
router.get('/', protect, authorize('Admin', 'Inventory Manager'), getAllSupplierItems);
router.get('/:id', getSupplierItemById);
router.get('/my-items',protect, authorize('Supplier'), getMySupplierItems);
router.get('/critical-stock', protect, authorize('Admin', 'Inventory Manager'), getCriticalStockProducts);
router.get('/:supplier_id/items', protect, authorize('Admin', 'Inventory Manager'), getSupplierItemsBySupplier);
router.delete('/:supplier_id/items/:product_id', protect, authorize('Admin', 'Inventory Manager'), deleteSupplierItem);
router.put('/:supplier_id/items/:product_id', protect, authorize('Admin', 'Inventory Manager'), updateSupplierItem);

export default router;