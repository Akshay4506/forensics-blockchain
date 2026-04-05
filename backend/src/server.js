import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import { connectDB } from './config/db.js';

dotenv.config();
// Database connection
connectDB();


const app = express();

app.use(cors());
app.use(express.json());

// Skip logging for repetitive polling to keep the terminal clean
app.use(morgan('dev', {
    skip: (req, res) => {
        return (req.method === 'GET' && (req.url.includes('/api/notifications') || req.url.includes('/api/evidence'))) && (res.statusCode === 200 || res.statusCode === 304);
    }
}));

import authRoutes from './routes/authRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import ledgerRoutes from './routes/ledgerRoutes.js';
import evidenceRoutes from './routes/evidenceRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

app.use('/api/auth', authRoutes);
app.use('/api/transaction', transactionRoutes);
app.use('/api/ledger', ledgerRoutes);
app.use('/api/evidence', evidenceRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/', (req, res) => {
    res.send('ForensicChain-Fabric API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
