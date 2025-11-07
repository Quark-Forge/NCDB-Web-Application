import express from 'express';
const router = express.Router();
import { 
    authUser,
    registerUser,
    logoutUser, 
    getUserProfile, 
    updateUserProfile,
    getUsers,
    verifyEmail,
    resendVerificationEmail,
    updateUserRole,
    deleteUser,
    restoreUser,
    resetPassword,
    forgotPassword,
} from '../controllers/userController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';

router.get('/', protect, authorize('Admin') ,getUsers)
      .post('/', registerUser);
router.get('/verify/:token', verifyEmail);
router.post('/resend-verification', resendVerificationEmail);
router.post('/auth', authUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.post('/logout', protect, logoutUser);
router
    .route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);
router.route('/:id')
      .delete(protect,authorize('Admin'), deleteUser)
      .patch(protect,authorize('Admin'), restoreUser);
router.put('/:id/role', protect,authorize('Admin'), updateUserRole);

export default router;