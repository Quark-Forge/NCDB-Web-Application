import express from 'express';
const router = express.Router();
import { 
    authUser,
    registerUser,
    logoutUser, 
    getUserProfile, 
    updateUserProfile,
    getUsers,
} from '../controllers/userController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';

//
router.get('/', protect, authorize('Admin') ,getUsers)
      .post('/', registerUser);
router.post('/auth', authUser);
router.post('/logout', logoutUser);
router
    .route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);

export default router;