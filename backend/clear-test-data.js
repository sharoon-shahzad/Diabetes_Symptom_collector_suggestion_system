import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';

dotenv.config();

const clearTestData = async () => {
    try {
        await connectDB();
        console.log('🔗 Connected');

        const db = mongoose.connection.db;
        
        const personalDeleted = await db.collection('userpersonalinfos').deleteMany({});
        console.log(`✅ Deleted ${personalDeleted.deletedCount} personal info records`);
        
        const medicalDeleted = await db.collection('usermedicalinfos').deleteMany({});
        console.log(`✅ Deleted ${medicalDeleted.deletedCount} medical info records`);
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

clearTestData();
