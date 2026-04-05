import mongoose from 'mongoose';

const evidenceSchema = new mongoose.Schema({
    title: { type: String, required: true },
    caseName: { type: String, required: true },
    description: { type: String, required: true },
    fileHash: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    creatorOrg: { type: String, required: true },
    currentOwner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ownerOrg: { type: String, required: true },
    normalizedTitle: { type: String, unique: true, sparse: true },
    fileName: { type: String }, // Saved filename in /uploads
    fileOriginalName: { type: String },
    fileSize: { type: Number },
    mimeType: { type: String },
    channel: { type: String, default: 'FORENSIC_CHANNEL' },
    // Blockchain Synchronization Fields
    blockchainInfo: {
        tokenId: { type: Number, unique: true, sparse: true },
        transactionHash: { type: String },
        status: { type: String, enum: ['PENDING', 'MINTED', 'SYNCED'], default: 'PENDING' },
        ownerAddress: { type: String }, // The MetaMask wallet address of current custodian
        blockNumber: { type: Number },
        mintedAt: { type: Date }
    }
}, { timestamps: true });

export default mongoose.model('Evidence', evidenceSchema);
