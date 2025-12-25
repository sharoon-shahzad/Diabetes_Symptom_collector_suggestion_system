import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import AuditLog from './models/AuditLog.js';

dotenv.config();

const clearAuditLogs = async () => {
    try {
        await connectDB();
        console.log('🔗 Connected to database');

        const deleted = await AuditLog.deleteMany({});
        console.log(`✅ Deleted ${deleted.deletedCount} audit logs`);

        const remaining = await AuditLog.countDocuments();
        console.log(`📊 Remaining audit logs: ${remaining}`);
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

clearAuditLogs();
