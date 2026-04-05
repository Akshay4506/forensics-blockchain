import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Evidence from '../models/Evidence.js';
import CustodyLog from '../models/CustodyLog.js';
import User from '../models/User.js';
import { normalizeEvidenceTitle } from './stringUtils.js';

dotenv.config();

const migrate = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected for migration...');

        const evidence = await Evidence.find({});
        console.log(`Found ${evidence.length} evidence records.`);

        for (const item of evidence) {
            const creator = await User.findById(item.createdBy);
            const owner = await User.findById(item.currentOwner);
            
            const creatorOrg = creator ? (creator.organization || creator.role) : 'UNKNOWN_ORG';
            const ownerOrg = owner ? (owner.organization || owner.role) : 'UNKNOWN_ORG';
            const normalizedTitle = normalizeEvidenceTitle(item.title);

            await Evidence.updateOne(
                { _id: item._id },
                { $set: { creatorOrg, ownerOrg, normalizedTitle } }
            );
            console.log(`Migrated Evidence: ${item.title} (norm: ${normalizedTitle})`);
        }

        const logs = await CustodyLog.find({});
        console.log(`Found ${logs.length} custody logs.`);

        for (const log of logs) {
            const from = await User.findById(log.fromUser);
            const to = await User.findById(log.toUser);
            
            const fromOrg = from ? (from.organization || from.role) : 'UNKNOWN_ORG';
            const toOrg = to ? (to.organization || to.role) : 'UNKNOWN_ORG';

            await CustodyLog.updateOne(
                { _id: log._id },
                { $set: { fromOrg, toOrg } }
            );
            console.log(`Migrated Log for ID: ${log.evidenceId} (${fromOrg} -> ${toOrg})`);
        }

        console.log('Migration complete!');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
};

migrate();
