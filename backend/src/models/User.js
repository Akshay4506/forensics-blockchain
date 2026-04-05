import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ['ECU', 'LAB', 'COURT'],
        required: true
    },
    organization: { type: String }, // Can mirror role for simplicity
    walletAddress: { type: String } // Cryptographic identifier for blockchain transfers
}, { timestamps: true });

export default mongoose.model('User', userSchema);
