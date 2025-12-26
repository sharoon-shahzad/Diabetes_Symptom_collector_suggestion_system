import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { UserPersonalInfo } from './models/UserPersonalInfo.js';
import encryptionService from './services/encryptionService.js';

dotenv.config();

async function testDecryption() {
    try {
        console.log('\n🔐 Testing Live Decryption\n');
        
        // Connect to database
        await connectDB();
        
        // Fetch one user's personal info (raw from DB)
        const personalInfo = await UserPersonalInfo.findOne().lean();
        
        if (!personalInfo) {
            console.log('❌ No personal info found in database');
            process.exit(0);
        }
        
        console.log('📊 Raw data from database:');
        console.log('Gender:', personalInfo.gender?.substring(0, 50));
        console.log('Height:', personalInfo.height?.toString().substring(0, 50));
        console.log('Weight:', personalInfo.weight?.toString().substring(0, 50));
        
        console.log('\n🔍 Checking if values are encrypted:');
        console.log('Gender encrypted?', encryptionService.isEncrypted(personalInfo.gender));
        console.log('Height encrypted?', encryptionService.isEncrypted(personalInfo.height));
        console.log('Weight encrypted?', encryptionService.isEncrypted(personalInfo.weight));
        
        console.log('\n🔓 Attempting decryption:');
        
        try {
            const decryptedGender = encryptionService.decrypt(personalInfo.gender);
            console.log('✅ Gender decrypted:', decryptedGender);
        } catch (err) {
            console.log('❌ Gender decryption failed:', err.message);
        }
        
        try {
            const decryptedHeight = encryptionService.decrypt(personalInfo.height);
            console.log('✅ Height decrypted:', decryptedHeight);
        } catch (err) {
            console.log('❌ Height decryption failed:', err.message);
        }
        
        try {
            const decryptedWeight = encryptionService.decrypt(personalInfo.weight);
            console.log('✅ Weight decrypted:', decryptedWeight);
        } catch (err) {
            console.log('❌ Weight decryption failed:', err.message);
        }
        
        console.log('\n✅ Test complete');
        process.exit(0);
    } catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    }
}

testDecryption();
