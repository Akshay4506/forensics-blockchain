import mongoose from 'mongoose';

const custodyLogSchema = new mongoose.Schema({
    evidenceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Evidence', required: true },
    action: { type: String, enum: ['CREATE', 'TRANSFER', 'VERIFY'], required: true },
    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    fromOrg: { type: String },
    toUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    toOrg: { type: String },
    timestamp: { type: Date, default: Date.now },
    previousHash: { type: String, required: true },
    currentHash: { type: String, required: true }, // SHA256(previousHash + action + actor + timestamp)
    blockNumber: { type: Number, required: true }
});

export default mongoose.model('CustodyLog', custodyLogSchema);
