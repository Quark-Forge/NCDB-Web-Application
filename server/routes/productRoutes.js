import express from 'express';
import { 
    addProduct,
    deleteProduct,
    getAllProducts,
    getProductById,
    updateProduct,
} from '../controllers/productController.js';

const router = express.Router();

router.route('/')
      .post(addProduct)
      .get(getAllProducts);

      // router.route('/').get(getAllProducts);
router.route('/:id')
      .get(getProductById)
      .put(updateProduct)
      .delete(deleteProduct);

export default router;