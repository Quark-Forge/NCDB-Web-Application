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
      .post(protect, authorize('Admin'),createCategory)
      .get(getAllCategories);

router.route('/:id')
      .get(getSingleCategory)
      .delete(protect, authorize('Admin'), disabledCategory)
      .post(protect, authorize('Admin'), restoreCategory)
      .put(protect, authorize('Admin'), updateCategory);
      
router.delete('/delete/:id', deleteCategory);

router.get('/active', getActiveCategories);


export default router;
