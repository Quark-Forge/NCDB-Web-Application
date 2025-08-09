import express from 'express';
import { 
    addProduct,
    deleteProduct,
    getAllProducts,
    getProductById,
    updateProduct,
} from '../controllers/productController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
      .post(protect , authorize('Admin', 'Inventory Manager'), addProduct)
      .get(getAllProducts);
router.route('/:id')
      .get(getProductById)
      .put(protect, authorize('Admin','Inventory Manager'),updateProduct)
      .delete(protect, authorize('Admin', 'Inventory Manager'), deleteProduct);

export default router;