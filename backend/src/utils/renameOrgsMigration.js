import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Evidence from '../models/Evidence.js';
import CustodyLog from '../models/CustodyLog.js';

dotenv.config();

const renameMap = {
    'ORG_ECU': 'ECU',
    'ORG_LAB': 'LAB',
    'ORG_COURT': 'COURT'
};

const migrate = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected for migration...');

        // 1. Update Users
        for (const [oldOrg, newOrg] of Object.entries(renameMap)) {
            const userRes = await User.updateMany(
                { role: oldOrg },
                { $set: { role: newOrg, organization: newOrg } }
            );
            console.log(`Updated ${userRes.modifiedCount} users from ${oldOrg} to ${newOrg}`);
        }

        // 2. Update Evidence
        for (const [oldOrg, newOrg] of Object.entries(renameMap)) {
            const evRes = await Evidence.updateMany(
                { creatorOrg: oldOrg },
                { $set: { creatorOrg: newOrg } }
            );
            const ownerRes = await Evidence.updateMany(
                { ownerOrg: oldOrg },
                { $set: { ownerOrg: newOrg } }
            );
            console.log(`Updated ${evRes.modifiedCount} evidence (creatorOrg) and ${ownerRes.modifiedCount} (ownerOrg) from ${oldOrg} to ${newOrg}`);
        }

        // 3. Update CustodyLogs
        for (const [oldOrg, newOrg] of Object.entries(renameMap)) {
            const fromRes = await CustodyLog.updateMany(
                { fromOrg: oldOrg },
                { $set: { fromOrg: newOrg } }
            );
            const toRes = await CustodyLog.updateMany(
                { toOrg: oldOrg },
                { $set: { toOrg: newOrg } }
            );
            console.log(`Updated ${fromRes.modifiedCount} logs (fromOrg) and ${toRes.modifiedCount} (toOrg) from ${oldOrg} to ${newOrg}`);
        }

        console.log('Organization rename migration complete!');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrate();
