// Load environment variables FIRST
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { UserPersonalInfo } from './models/UserPersonalInfo.js';
import { UserMedicalInfo } from './models/UserMedicalInfo.js';
import { User } from './models/User.js';

const connectDB = async () => {
    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB\n');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

const clearEncryptedData = async () => {
    try {
        console.log('╔════════════════════════════════════════════════════════════╗');
        console.log('║          CLEARING OLD ENCRYPTED DATA FROM DATABASE         ║');
        console.log('╚════════════════════════════════════════════════════════════╝\n');

        console.log('⚠️  WARNING: This will DELETE all personal and medical information!');
        console.log('⚠️  Users will need to re-enter their information.\n');

        // Delete all personal info
        const personalResult = await UserPersonalInfo.deleteMany({});
        console.log(`✅ Deleted ${personalResult.deletedCount} Personal Info records`);

        // Delete all medical info
        const medicalResult = await UserMedicalInfo.deleteMany({});
        console.log(`✅ Deleted ${medicalResult.deletedCount} Medical Info records`);

        // Clear phone numbers from User model (they were encrypted with wrong key)
        const userResult = await User.updateMany(
            {},
            { 
                $set: { 
                    phone_number: null,
                    country: null,
                    country_code: null
                }
            }
        );
        console.log(`✅ Cleared phone/country data from ${userResult.modifiedCount} User records\n`);

        console.log('╔════════════════════════════════════════════════════════════╗');
        console.log('║                     ✅ CLEANUP COMPLETE                     ║');
        console.log('║                                                            ║');
        console.log('║  Users can now save fresh data with correct encryption!   ║');
        console.log('╚════════════════════════════════════════════════════════════╝\n');

    } catch (error) {
        console.error('❌ Error clearing data:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

connectDB().then(clearEncryptedData);
