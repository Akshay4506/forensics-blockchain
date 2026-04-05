import { ethers } from 'ethers';
import Evidence from './src/models/Evidence.js';
import User from './src/models/User.js';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../frontend/src/blockchain/constants.js'; // Sharing ABI
import dotenv from 'dotenv';
dotenv.config();

const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8546");
const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

export const reconcileBlockchain = async () => {
    console.log("🔍 Checking Blockchain-DB synchronization...");
    
    try {
        const filter = contract.filters.EvidenceMinted();
        const events = await contract.queryFilter(filter);
        
        console.log(`📡 Found ${events.length} on-chain records.`);

        for (const event of events) {
            const { tokenId, title, fileHash, creator } = event.args;
            const tid = Number(tokenId);

            // Check if this tokenId exists in DB
            const existing = await Evidence.findOne({ "blockchainInfo.tokenId": tid });
            
            if (!existing) {
                console.warn(`⚠️  Mismatched record found for Token ID: ${tid}. Creating legacy record...`);
                
                // Find a default system user or the creator if they exist in DB
                // This is a simplified fallback for legacy/out-of-sync data
                const user = await User.findOne({ organization: 'ECU' }); // Default to ECU
                
                const newEvidence = new Evidence({
                    title: title + " (Blockchain Restored)",
                    caseName: "RECONCILED",
                    description: "Automatically restored from blockchain state during startup reconciliation.",
                    fileHash,
                    createdBy: user ? user._id : null,
                    creatorOrg: 'ECU',
                    currentOwner: user ? user._id : null,
                    ownerOrg: 'ECU',
                    blockchainInfo: {
                        tokenId: tid,
                        transactionHash: event.transactionHash,
                        status: 'SYNCED',
                        ownerAddress: creator,
                        blockNumber: event.blockNumber
                    }
                });
                await newEvidence.save();
                console.log(`✅ Restored Token ID: ${tid}`);
            }
        }
        
        console.log("🏁 Reconciliation complete.");
    } catch (error) {
        console.error("❌ Reconciliation failed:", error.message);
    }
};

// If run directly
if (import.meta.url === `file://${process.argv[1]}`) {
    reconcileBlockchain();
}
