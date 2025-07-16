import express from 'express';
import { 
    addProduct,
    getAllProducts,
    getProductById,
} from '../controllers/productController.js';

const router = express.Router();

router.route('/')
      .post(addProduct)
      .get(getAllProducts);
router.route('/:id')
      .get(getProductById);

export default router;