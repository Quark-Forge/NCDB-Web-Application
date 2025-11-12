import express from 'express';
import { addSupplier, getAllActiveSuppliers, getAllSuppliers, getSupplier, removeSupplier, updateSupplier } from '../controllers/supplierController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
      .post(protect, authorize('Admin', 'Inventory Manager') , addSupplier)
      .get(protect, authorize('Admin', 'Order Manager', 'Inventory Manager') , getAllSuppliers);
router.route('/active')
      .get(protect, authorize('Admin', 'Order Manager', 'Inventory Manager') , getAllActiveSuppliers);
router.route('/:id')
      .get(protect, authorize('Admin', 'Order Manager', 'Inventory Manager') , getSupplier)
      .put(protect, authorize('Admin') ,updateSupplier)
      .delete(protect, authorize('Admin') ,removeSupplier);
router.route('/restore/:id')
      .put(protect, authorize('Admin', 'Inventory Manager'), updateSupplier);

export default router;