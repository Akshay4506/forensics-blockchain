import mongoose from 'mongoose';

const blockSchema = new mongoose.Schema({
    blockNumber: { type: Number, required: true, unique: true },
    transactions: { type: Array, required: true },
    previousBlockHash: { type: String, required: true },
    blockHash: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

export default mongoose.model('Block', blockSchema);
