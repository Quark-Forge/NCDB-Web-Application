import express from 'express';
import { 
      createCategory, 
      deleteCategory, 
      disabledCategory, 
      getActiveCategories,
      getAllCategories, 
      getSingleCategory, 
      restoreCategory, 
      updateCategory 
} from '../controllers/categoryController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
      .post(protect, authorize('Admin', 'Inventory Manager'),createCategory)
      .get(protect, authorize('Admin', 'Order Manager', 'Inventory Manager'), getAllCategories);
router.get('/active', getActiveCategories);
router.route('/:id')
      .get(getSingleCategory)
      .delete(protect, authorize('Admin', 'Inventory Manager'), disabledCategory)
      .put(protect, authorize('Admin', 'Inventory Manager'), updateCategory);
router.route('/restore/:id').put(protect, authorize('Admin', 'Inventory Manager'), restoreCategory);
router.delete('/delete/:id',protect, authorize('Admin', 'Inventory Manager'), deleteCategory);


export default router;
