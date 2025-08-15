import express from 'express';
import { 
    addProduct,
    deleteProduct,
    getAllProducts,
    getAllProductsWithDeleted,
    updateProduct,
    updateProductStock,
} from '../controllers/productController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/with-inactive').get(protect , authorize('Admin', 'Inventory Manager'), getAllProductsWithDeleted);
router.route('/')
      .post(protect , authorize('Admin', 'Inventory Manager'), addProduct)
      .get(getAllProducts);

router.route('/:product_id/suppliers/:supplier_id').delete(protect, authorize('Admin', 'Inventory Manager'), deleteProduct);

router.route('/:id')
      .put(protect, authorize('Admin','Inventory Manager'),updateProduct);


router.route('/:id/stock').put(protect, authorize('Admin', 'Inventory Manager'), updateProductStock);

export default router;