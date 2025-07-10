import express from 'express';
import { addSupplier, getAllSuppliers, getSupplier, removeSupplier, updateSupplier } from '../controllers/supplierController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
      .post(protect, authorize('Admin') , addSupplier)
      .get(protect, authorize('Admin') , getAllSuppliers);
router.route('/:id')
      .get(protect, authorize('Admin') , getSupplier)
      .put(protect, authorize('Admin') ,updateSupplier)
      .delete(protect, authorize('Admin') ,removeSupplier);

export default router;