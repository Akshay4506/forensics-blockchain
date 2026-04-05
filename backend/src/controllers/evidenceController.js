import Evidence from '../models/Evidence.js';
import { commitTransactions } from '../services/commitService.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getAllEvidence = async (req, res) => {
    try {
        let filter = {};

        // ECU can view all evidence; others only view what they currently own
        if (req.user.organization !== 'ECU') {
            filter = { ownerOrg: req.user.organization };
        }

        const evidence = await Evidence.find(filter)
            .populate('createdBy', 'name role organization')
            .populate('currentOwner', 'name role organization')
            .sort({ createdAt: -1 });
        res.json(evidence);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getEvidenceById = async (req, res) => {
    try {
        const evidence = await Evidence.findById(req.params.id)
            .populate('createdBy', 'name role organization')
            .populate('currentOwner', 'name role organization');

        if (!evidence) {
            return res.status(404).json({ message: 'Evidence not found' });
        }

        // Forensics Access Check: 
        // If not ECU, and not the current owner, check if the user was EVER in the custody logs
        if (req.user.organization !== 'ECU' && evidence.ownerOrg !== req.user.organization) {
            const CustodyLog = (await import('../models/CustodyLog.js')).default;
            const wasInvolved = await CustodyLog.findOne({
                evidenceId: evidence._id,
                $or: [{ fromOrg: req.user.organization }, { toOrg: req.user.organization }]
            });
            
            if (!wasInvolved) {
                return res.status(403).json({ message: 'Access denied: You do not have permission to view this forensic asset.' });
            }
        }

        res.json(evidence);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const downloadEvidenceFile = async (req, res) => {
    try {
        const evidence = await Evidence.findById(req.params.id);
        if (!evidence || !evidence.fileName) {
            return res.status(404).json({ message: 'File not found on ledger storage' });
        }

        // Security: Only current owner org or ECU can download
        if (req.user.organization !== 'ECU' && evidence.ownerOrg !== req.user.organization) {
            return res.status(403).json({ message: 'Access denied: Your organization does not have custody of this evidence.' });
        }

        const filePath = path.join(__dirname, '../../uploads', evidence.fileName);
        if (fs.existsSync(filePath)) {
            res.download(filePath, evidence.fileOriginalName);
        } else {
            res.status(404).json({ message: 'Physical file missing from vault storage' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const syncMintedEvidence = async (req, res) => {
    try {
        if (req.user.organization !== 'ECU') {
            return res.status(403).json({ message: 'Forensic Protocol Violation: Only the ECU organization can mint new evidence.' });
        }

        const { 
            title, caseName, description, fileHash, 
            fileName, fileOriginalName, fileSize, mimeType,
            tokenId, transactionHash, ownerAddress 
        } = req.body;

        const tx = {
            action: 'CREATE',
            actor: req.user._id,
            organization: req.user.organization,
            timestamp: new Date().toISOString(),
            payload: {
                title, caseName, description, fileHash,
                fileName, fileOriginalName, fileSize, mimeType
            },
            blockchainInfo: {
                tokenId,
                transactionHash,
                status: 'MINTED',
                ownerAddress,
                mintedAt: new Date()
            }
        };

        const lastBlock = await (await import('../models/Block.js')).default.findOne().sort({ blockNumber: -1 });
        const newBlockNumber = lastBlock ? lastBlock.blockNumber + 1 : 1;
        const prevHash = lastBlock ? lastBlock.blockHash : "0".repeat(64);

        const blockData = {
            blockNumber: newBlockNumber,
            previousBlockHash: prevHash,
            blockHash: transactionHash,
            timestamp: new Date()
        };

        await commitTransactions([tx], blockData);
        
        // Find the newly created evidence to return
        const evidence = await Evidence.findOne({ "blockchainInfo.tokenId": tokenId });
        res.status(201).json(evidence);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Cleanup Helper: Delete non-ECU evidence, blocks, and logs
export const purgeNonECUEvidence = async (req, res) => {
    try {
        if (req.user.role !== 'ADMIN') return res.status(403).json({ message: 'Admin role required' });
        
        // This is a powerful command: use with caution
        await Evidence.deleteMany({ creatorOrg: { $ne: 'ECU' } });
        // We'll leave blocks intact for now to prevent breaking the chain hash links, 
        // but they will be hidden from the ledger by the controller logic.
        
        res.json({ message: 'Non-ECU evidence successfully purged from storage.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const syncTransferredEvidence = async (req, res) => {
    try {
        const { evidenceId, newOwnerId, newOwnerOrg, newOwnerAddress, transactionHash } = req.body;
        
        // --- FORENSIC PROTOCOL VALIDATION ---
        const senderOrg = req.user.organization;
        if (senderOrg === 'ECU' && newOwnerOrg === 'COURT') {
            return res.status(403).json({ message: 'Forensic Protocol Violation: ECU cannot transfer directly to COURT. Route through LAB.' });
        }
        // --- END VALIDATION ---

        const tx = {
            action: 'TRANSFER',
            actor: req.user._id, // the sender
            organization: req.user.organization,
            timestamp: new Date().toISOString(),
            payload: {
                evidenceId,
                newOwnerId,
                newOwnerOrg
            },
            blockchainInfo: {
                ownerAddress: newOwnerAddress,
                transactionHash,
                status: 'SYNCED'
            }
        };

        const lastBlock = await (await import('../models/Block.js')).default.findOne().sort({ blockNumber: -1 });
        const newBlockNumber = lastBlock ? lastBlock.blockNumber + 1 : 1;
        const prevHash = lastBlock ? lastBlock.blockHash : "0".repeat(64);

        const blockData = {
            blockNumber: newBlockNumber,
            previousBlockHash: prevHash,
            blockHash: transactionHash,
            timestamp: new Date()
        };

        await commitTransactions([tx], blockData);

        const updatedEvidence = await Evidence.findById(evidenceId);
        res.json(updatedEvidence);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
