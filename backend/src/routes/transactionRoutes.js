import express from 'express';
import { proposeTransaction } from '../controllers/transactionController.js';
import { protect, requireChannel } from '../middlewares/authMiddleware.js';
import upload from '../config/multer.js';

const router = express.Router();

router.post('/propose', protect, requireChannel('FORENSIC_CHANNEL'), upload.single('file'), proposeTransaction);

export default router;
