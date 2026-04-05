import express from 'express';
import { 
    getAllEvidence, 
    getEvidenceById, 
    downloadEvidenceFile, 
    syncMintedEvidence, 
    syncTransferredEvidence 
} from '../controllers/evidenceController.js';
import { protect } from '../middlewares/authMiddleware.js';
import multer from 'multer';
import path from 'path';

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

router.get('/', protect, getAllEvidence);
router.post('/upload', protect, upload.single('file'), (req, res) => {
    res.json({ 
        fileName: req.file.filename,
        fileOriginalName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype
    });
});
router.post('/sync-mint', protect, syncMintedEvidence);
router.post('/sync-transfer', protect, syncTransferredEvidence);
router.get('/:id', protect, getEvidenceById);
router.get('/:id/download', protect, downloadEvidenceFile);

export default router;
