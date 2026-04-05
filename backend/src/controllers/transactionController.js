import { endorseTransaction } from '../services/endorsementService.js';
import { orderTransaction } from '../services/orderingService.js';
import { validateBlock } from '../services/validationService.js';
import { commitTransactions } from '../services/commitService.js';
import crypto from 'crypto';
import User from '../models/User.js';
import Evidence from '../models/Evidence.js';
import { normalizeEvidenceTitle } from '../utils/stringUtils.js';

export const proposeTransaction = async (req, res) => {
    try {
        let { action, payload } = req.body;
        
        // Multer might send payload as a string via FormData
        if (typeof payload === 'string') {
            try {
                payload = JSON.parse(payload);
            } catch (e) {
                // Keep as is or handle error
            }
        }

        if (!['CREATE', 'TRANSFER', 'VERIFY'].includes(action)) {
            return res.status(400).json({ message: 'Invalid action type' });
        }

        // Logic check: UNIQUE TITLE FOR CREATE
        if (action === 'CREATE') {
            const normalized = normalizeEvidenceTitle(payload.title);
            const exists = await Evidence.findOne({ normalizedTitle: normalized });
            if (exists) {
                return res.status(400).json({ 
                    message: `Evidence with title '${payload.title}' (normalized: '${normalized}') already exists on the ledger. Please use a unique identifier.` 
                });
            }
            // Add to payload so commitService doesn't have to re-normalize
            payload.normalizedTitle = normalized;

            // Handle file metadata if present from multer
            if (req.file) {
                payload.fileName = req.file.filename;
                payload.fileOriginalName = req.file.originalname;
                payload.fileSize = req.file.size;
                payload.mimeType = req.file.mimetype;
            }
        }

        // Handle string emails or weird newOwnerId entries via email lookup
        if (action === 'TRANSFER' && payload.newOwnerId) {
            // Attempt to resolve by email or exact role text if user typed it
            const targetUser = await User.findOne({
                $or: [
                    { email: payload.newOwnerId },
                    { _id: payload.newOwnerId.length === 24 ? payload.newOwnerId : null } // Try object ID if valid len
                ]
            });
            if (!targetUser) {
                return res.status(400).json({ message: 'Could not find the target user to transfer to. Try scanning by Exact Email.' });
            }
            // Overwrite with actual ObjectId and org
            payload.newOwnerId = targetUser._id;
            payload.newOwnerOrg = targetUser.organization;

            // Chain of Custody Policy: ECU -> LAB -> COURT
            if (req.user.role === 'ECU' && targetUser.role === 'COURT') {
                return res.status(400).json({ 
                    message: 'Forensic Policy Violation: Evidence collected by ECU must be transferred to the LAB first for integrity verification before it can be sent to the COURT.' 
                });
            }
        }

        // 1. Transaction Proposal
        const proposal = {
            proposalId: crypto.randomUUID(),
            actor: req.user._id,
            organization: req.user.organization,
            action,
            timestamp: new Date().toISOString(),
            payload
        };

        // Assuming ownership extraction for endorse policies
        let currentOwnerId = req.user._id; // defaults to self
        if (action === 'TRANSFER' || action === 'VERIFY') {
            const Evidence = (await import('../models/Evidence.js')).default;
            const evidence = await Evidence.findById(payload.evidenceId);
            if (!evidence) return res.status(404).json({ message: 'Evidence not found' });
            currentOwnerId = evidence.currentOwner;
        }

        // 2. Endorsement Phase
        const endorsedTx = await endorseTransaction(proposal, currentOwnerId);
        if (endorsedTx.status === 'REJECTED') {
            return res.status(403).json({ message: 'Endorsement policy failed', detail: endorsedTx.error });
        }

        // NEW: If action is VERIFY, return early without block creation
        if (action === 'VERIFY') {
            return res.status(200).json({
                message: 'Integrity verification successful. Verified against latest ledger hash.',
                transactionId: proposal.proposalId,
                status: 'VERIFIED'
            });
        }

        // 3. Ordering Phase
        const pendingBlock = await orderTransaction(endorsedTx);

        // 4. Validation Phase
        const { validTransactions, invalidTransactions } = validateBlock(pendingBlock);

        if (validTransactions.length === 0) {
            return res.status(400).json({ message: 'Transaction invalidated during block assembly', invalidTransactions });
        }

        // 5. Commit Phase
        await commitTransactions(validTransactions, pendingBlock);

        res.status(201).json({
            message: 'Transaction committed successfully to ledger',
            blockNumber: pendingBlock.blockNumber,
            transactionId: proposal.proposalId,
            status: 'COMMITTED'
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || 'Transaction processing failed' });
    }
};
