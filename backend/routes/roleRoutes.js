import express from 'express';
import { createRole, deleteRole, getAllRoles, getRoleById, updateRole } from '../controllers/roleController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';
const router = express.Router();

router.route('/')
      .get(protect, authorize('Admin'), getAllRoles)
      .post(protect, authorize('Admin'), createRole);
router.route('/:id')
      .get(protect, authorize('Admin'), getRoleById)
      .put(protect, authorize('Admin'), updateRole)
      .delete(protect, authorize('Admin'), deleteRole);

export default router;