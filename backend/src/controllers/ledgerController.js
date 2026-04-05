import Block from '../models/Block.js';
import CustodyLog from '../models/CustodyLog.js';

export const getBlocks = async (req, res) => {
    try {
        const blocks = await Block.find().sort({ blockNumber: 1 });
        const Evidence = (await import('../models/Evidence.js')).default;
        const isECU = req.user.organization === 'ECU';

        if (isECU) {
            // ECU has master access to all records
            return res.json(blocks);
        } else {
            // LAB/COURT authorized evidence (ever spent time here)
            const involvedLogs = await CustodyLog.find({
                $or: [{ fromOrg: req.user.organization }, { toOrg: req.user.organization }]
            });
            const authorizedEvidenceIds = new Set(involvedLogs.map(log => log.evidenceId.toString()));
            
            // Also include anything they currently own (in case log is missing or for minted items)
            const currentOwned = await Evidence.find({ ownerOrg: req.user.organization });
            currentOwned.forEach(ev => authorizedEvidenceIds.add(ev._id.toString()));

            const processedBlocks = blocks.map(block => {
                const blockObj = block.toObject();
                
                // Check if this block contains ANY transaction the user is authorized to see
                const hasAuthorizedTx = blockObj.transactions.some(tx => {
                    const evId = tx.payload.evidenceId?.toString() || tx.payload.id?.toString();
                    return authorizedEvidenceIds.has(evId);
                });

                if (hasAuthorizedTx) {
                    // Block is visible, but we REDACT transactions for evidence they NEVER touched
                    blockObj.transactions = blockObj.transactions.filter(tx => {
                        const evId = tx.payload.evidenceId?.toString() || tx.payload.id?.toString();
                        return authorizedEvidenceIds.has(evId);
                    });
                    blockObj.isHidden = false;
                } else {
                    // Block is HIDDEN - keep metadata for chain continuity, but hide data
                    blockObj.transactions = [];
                    blockObj.isHidden = true;
                    blockObj.redactedMessage = "Forensic access restricted: Asset outside organization jurisdiction.";
                }
                
                return blockObj;
            });

            return res.json(processedBlocks);
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getEvidenceAudit = async (req, res) => {
    try {
        const evidenceId = req.params.id;
        const Evidence = (await import('../models/Evidence.js')).default;
        const evidence = await Evidence.findById(evidenceId);

        if (!evidence) return res.status(404).json({ message: 'Evidence not found' });

        // Access check for Detail View
        if (req.user.organization !== 'ECU' && evidence.ownerOrg !== req.user.organization) {
            const wasInvolved = await CustodyLog.findOne({
                evidenceId,
                $or: [{ fromOrg: req.user.organization }, { toOrg: req.user.organization }]
            });
            if (!wasInvolved) return res.status(403).json({ message: 'Not authorized to view this audit trail' });
        }

        const logs = await CustodyLog.find({ evidenceId })
            .populate('fromUser', 'name role organization')
            .populate('toUser', 'name role organization')
            .sort({ timestamp: 1 });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
