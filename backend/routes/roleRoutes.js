import express from 'express';
import { createRole, deleteRole, getAllRoles, getRoleById, updateRole } from '../controllers/roleController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';
const router = express.Router();

router.get('/', protect, authorize('Admin'), getAllRoles)
      .post('/', protect, authorize('Admin'), createRole);
router.get('/:id', protect, authorize('Admin'), getRoleById)
      .put('/:id', protect, authorize('Admin'), updateRole)
      .delete('/:id', protect, authorize('Admin'), deleteRole);


export default router;