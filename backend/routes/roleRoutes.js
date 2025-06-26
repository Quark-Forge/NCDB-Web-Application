import express from 'express';
import { createRole, deleteRole, getAllRoles, getRoleById, updateRole } from '../controllers/roleController.js';
const router = express.Router();

router.get('/', getAllRoles)
      .post('/', createRole);
router.get('/:id', getRoleById)
      .put('/:id', updateRole)
      .delete('/:id', deleteRole);


export default router;