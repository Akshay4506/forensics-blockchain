import express from 'express';
import { getBlocks, getEvidenceAudit } from '../controllers/ledgerController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/blocks', protect, getBlocks);
router.get('/evidence/:id/audit', protect, getEvidenceAudit);

export default router;
