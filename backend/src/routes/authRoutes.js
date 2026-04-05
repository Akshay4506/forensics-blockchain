import express from 'express';
import { registerUser, loginUser, getUserProfile, updateUserProfile, getUserByEmail } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.get('/user/:email', protect, getUserByEmail);

export default router;
