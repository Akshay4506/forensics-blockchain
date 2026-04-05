const mongoose = require('mongoose');
const dbName = 'forensic_fabric';
const url = 'mongodb://127.0.0.1:27017/' + dbName;

async function cleanup() {
    try {
        await mongoose.connect(url);
        console.log('Connected to MongoDB');

        const Evidence = mongoose.model('Evidence', new mongoose.Schema({ creatorOrg: String }));
        const CustodyLog = mongoose.model('CustodyLog', new mongoose.Schema({ evidenceId: mongoose.Schema.Types.ObjectId }));

        const nonECU = await Evidence.find({ creatorOrg: { $ne: 'ECU' } });
        const ids = nonECU.map(ev => ev._id);

        if (ids.length > 0) {
            await Evidence.deleteMany({ _id: { $in: ids } });
            await CustodyLog.deleteMany({ evidenceId: { $in: ids } });
            console.log(`✅ Successfully purged ${ids.length} unauthorized evidence items and their audit trails.`);
        } else {
            console.log('ℹ️ No unauthorized evidence items found.');
        }

        process.exit(0);
    } catch (e) {
        console.error('❌ Cleanup failed:', e);
        process.exit(1);
    }
}

cleanup();
