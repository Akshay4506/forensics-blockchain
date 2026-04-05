import Block from '../models/Block.js';
import { generateHash } from '../utils/cryptoUtils.js';

let mempool = [];

// Simulate ordering service batching
export const orderTransaction = async (endorsedTx) => {
    mempool.push(endorsedTx);

    // For simplicity, we order and create a block for EACH valid transaciton immediately,
    // or batch them if called in intervals. We'll do immediately to simulate instant finality.
    // Sort by timestamp if there were multiple
    mempool.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    const transactionsToBundle = [...mempool];
    mempool = []; // clear mempool

    // Retrieve last block to link hashes
    const lastBlock = await Block.findOne().sort({ blockNumber: -1 });

    const blockNumber = lastBlock ? lastBlock.blockNumber + 1 : 1;
    const previousBlockHash = lastBlock ? lastBlock.blockHash : '0'.repeat(64); // Genesis previous hash

    const timestamp = new Date();

    // blockHash = SHA256(previousBlockHash + transactions + timestamp)
    const blockHashInput = previousBlockHash + JSON.stringify(transactionsToBundle) + timestamp.toISOString();
    const blockHash = generateHash(blockHashInput);

    return {
        blockNumber,
        transactions: transactionsToBundle,
        previousBlockHash,
        blockHash,
        timestamp
    };
};
