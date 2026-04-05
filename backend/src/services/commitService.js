import Evidence from '../models/Evidence.js';
import CustodyLog from '../models/CustodyLog.js';
import Block from '../models/Block.js';
import Notification from '../models/Notification.js';
import { generateHash } from '../utils/cryptoUtils.js';

export const commitTransactions = async (validTransactions, blockData) => {
    try {
        for (const tx of validTransactions) {
            if (tx.action === 'CREATE') {
                const evidence = new Evidence({
                    title: tx.payload.title,
                    caseName: tx.payload.caseName,
                    description: tx.payload.description,
                    fileHash: tx.payload.fileHash,
                    createdBy: tx.actor,
                    creatorOrg: tx.organization,
                    currentOwner: tx.actor,
                    ownerOrg: tx.organization,
                    normalizedTitle: tx.payload.normalizedTitle,
                    fileName: tx.payload.fileName,
                    fileOriginalName: tx.payload.fileOriginalName,
                    fileSize: tx.payload.fileSize,
                    mimeType: tx.payload.mimeType,
                    channel: 'FORENSIC_CHANNEL',
                    blockchainInfo: tx.blockchainInfo || undefined
                });
                await evidence.save();

                // First custody log
                const initialHashInput = '0'.repeat(64) + tx.action + tx.actor + tx.timestamp;
                const currentHash = generateHash(initialHashInput);

                const log = new CustodyLog({
                    evidenceId: evidence._id,
                    action: tx.action,
                    fromUser: tx.actor,
                    fromOrg: tx.organization,
                    toUser: tx.actor,
                    toOrg: tx.organization,
                    timestamp: tx.timestamp,
                    previousHash: '0'.repeat(64),
                    currentHash,
                    blockNumber: blockData.blockNumber
                });
                await log.save();
            } else if (tx.action === 'TRANSFER') {
                const evidence = await Evidence.findById(tx.payload.evidenceId);
                if (!evidence) throw new Error('Evidence not found for commit');

                const fromUser = evidence.currentOwner;
                const fromOrg = evidence.ownerOrg;
                evidence.currentOwner = tx.payload.newOwnerId;
                evidence.ownerOrg = tx.payload.newOwnerOrg;
                
                // Update blockchain info if it's a synced transfer
                if (tx.blockchainInfo) {
                    evidence.blockchainInfo = {
                        ...evidence.blockchainInfo,
                        ...tx.blockchainInfo
                    };
                }
                
                await evidence.save();

                // Get last custody log
                const lastLog = await CustodyLog.findOne({ evidenceId: evidence._id }).sort({ timestamp: -1 });
                const previousHash = lastLog ? lastLog.currentHash : '0'.repeat(64);

                const currentHashInput = previousHash + tx.action + tx.actor + tx.timestamp;
                const currentHash = generateHash(currentHashInput);

                const log = new CustodyLog({
                    evidenceId: evidence._id,
                    action: tx.action,
                    fromUser: fromUser,
                    fromOrg: fromOrg,
                    toUser: tx.payload.newOwnerId,
                    toOrg: tx.payload.newOwnerOrg,
                    timestamp: tx.timestamp,
                    previousHash,
                    currentHash,
                    blockNumber: blockData.blockNumber
                });
                await log.save();

                // Create Notification for the Recipient
                const notification = new Notification({
                    recipient: tx.payload.newOwnerId,
                    message: `You received custody of evidence "${evidence.title}" from ${fromOrg}`,
                    evidenceId: evidence._id,
                    senderOrg: fromOrg
                });
                await notification.save();
            } else if (tx.action === 'VERIFY') {
                const evidence = await Evidence.findById(tx.payload.evidenceId);
                if (!evidence) throw new Error('Evidence not found for commit');

                // Just log the verification, no ownership change
                const lastLog = await CustodyLog.findOne({ evidenceId: evidence._id }).sort({ timestamp: -1 });
                const previousHash = lastLog ? lastLog.currentHash : '0'.repeat(64);

                const currentHashInput = previousHash + tx.action + tx.actor + tx.timestamp;
                const currentHash = generateHash(currentHashInput);

                const log = new CustodyLog({
                    evidenceId: evidence._id,
                    action: tx.action,
                    fromUser: tx.actor, // verifier
                    fromOrg: tx.organization,
                    toUser: evidence.currentOwner,
                    toOrg: evidence.ownerOrg,
                    timestamp: tx.timestamp,
                    previousHash,
                    currentHash,
                    blockNumber: blockData.blockNumber
                });
                await log.save();
            }
        }

        // Save block
        const block = new Block({
            blockNumber: blockData.blockNumber,
            transactions: validTransactions,
            previousBlockHash: blockData.previousBlockHash,
            blockHash: blockData.blockHash,
            timestamp: blockData.timestamp
        });
        await block.save();

        return true;
    } catch (error) {
        throw error;
    }
};
