import express from 'express';
import { addSupplier, removeSupplier, updateSupplier } from '../controllers/supplierController.js';

const router = express.Router();

router.post('/', addSupplier);
router.route('/:id')
      .put(updateSupplier)
      .delete(removeSupplier);

export default router;