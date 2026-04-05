import { ethers } from 'ethers';
import Evidence from './src/models/Evidence.js';
import User from './src/models/User.js';
import { commitTransactions } from './src/services/commitService.js';
import contractArtifact from '../artifacts/contracts/ForensicEvidence.sol/ForensicEvidence.json' assert { type: 'json' };
const { abi: CONTRACT_ABI } = contractArtifact;

// Address will be injected or constants will be updated
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Updated manually after deploy
import dotenv from 'dotenv';
dotenv.config();

const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8546");
const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

export const reconcileBlockchain = async () => {
    try {
        const filter = contract.filters.EvidenceMinted();
        const events = await contract.queryFilter(filter);
        
        let reconciledCount = 0;
        for (const event of events) {
            const { tokenId, title, fileHash, creator } = event.args;
            const tid = Number(tokenId);

            // Check if this tokenId exists in DB
            const existing = await Evidence.findOne({ "blockchainInfo.tokenId": tid });
            
            // --- RECONCILIATION VIA CENTRALIZED COMMIT SERVICE ---
            const blockExists = await (await import('./models/Block.js')).default.findOne({ blockHash: event.transactionHash });
            
            if (!existing || !blockExists) {
                reconciledCount++;
                console.warn(`⚖️  Rebuilding ledger data for Token ID: ${tid}...`);
                
                const user = await User.findOne({ organization: 'ECU' });
                
                const tx = {
                    action: 'CREATE',
                    actor: user ? user._id : null,
                    organization: 'ECU',
                    timestamp: new Date().toISOString(),
                    payload: {
                        title: title + (existing ? "" : " (Blockchain Restored)"),
                        caseName: existing ? existing.caseName : "RECONCILED",
                        description: existing ? existing.description : "Automatically restored from blockchain state during startup reconciliation.",
                        fileHash
                    },
                    blockchainInfo: {
                        tokenId: tid,
                        transactionHash: event.transactionHash,
                        status: 'SYNCED',
                        ownerAddress: creator,
                        blockNumber: event.blockNumber
                    }
                };

                const lastBlock = await (await import('./models/Block.js')).default.findOne().sort({ blockNumber: -1 });
                const newBlockNumber = lastBlock ? lastBlock.blockNumber + 1 : 1;
                const prevHash = lastBlock ? lastBlock.blockHash : "0".repeat(64);

                const blockData = {
                    blockNumber: newBlockNumber,
                    previousBlockHash: prevHash,
                    blockHash: event.transactionHash,
                    timestamp: new Date()
                };

                await commitTransactions([tx], blockData);
                console.log(`✅ Fully Synchronized Token ID: ${tid}`);
            }
        }
        
        if (reconciledCount > 0) {
            console.log(`🏁 Reconciliation complete. Total recovered: ${reconciledCount}`);
        } else if (events.length > 0) {
            console.log("✅ Blockchain-DB integrity verified. System synchronized.");
        }
    } catch (error) {
        console.error("❌ Reconciliation failed:", error.message);
    }
};

// If run directly
if (import.meta.url === `file://${process.argv[1]}`) {
    reconcileBlockchain();
}
