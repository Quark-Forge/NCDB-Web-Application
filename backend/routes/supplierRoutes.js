import express from 'express';
import { addSupplier, removeSupplier, updateSupplier } from '../controllers/supplierController.js';

const router = express.Router();

router.post('/', addSupplier);
router.put('/:id', updateSupplier)
      .delete('/:id', removeSupplier);

export default router;