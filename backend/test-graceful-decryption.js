import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { UserPersonalInfo } from './models/UserPersonalInfo.js';
import { UserMedicalInfo } from './models/UserMedicalInfo.js';

dotenv.config();

async function testGracefulFallback() {
    try {
        console.log('\n✅ Testing Graceful Decryption Fallback\n');
        
        await connectDB();
        
        console.log('📊 Test 1: Fetch UserPersonalInfo (will fail to decrypt but not crash)');
        const personalInfo = await UserPersonalInfo.findOne();
        
        if (personalInfo) {
            console.log('  ✅ Query succeeded (no crash)');
            console.log('  Gender:', typeof personalInfo.gender === 'string' && personalInfo.gender.includes(':') ? 'ENCRYPTED (key mismatch)' : personalInfo.gender);
            console.log('  Height:', typeof personalInfo.height === 'string' && personalInfo.height.includes(':') ? 'ENCRYPTED (key mismatch)' : personalInfo.height);
            console.log('  Weight:', typeof personalInfo.weight === 'string' && personalInfo.weight.includes(':') ? 'ENCRYPTED (key mismatch)' : personalInfo.weight);
        }
        
        console.log('\n📊 Test 2: Fetch UserMedicalInfo (will fail to decrypt but not crash)');
        const medicalInfo = await UserMedicalInfo.findOne();
        
        if (medicalInfo) {
            console.log('  ✅ Query succeeded (no crash)');
            console.log('  Diabetes Type:', typeof medicalInfo.diabetes_type === 'string' && medicalInfo.diabetes_type.includes(':') ? 'ENCRYPTED (key mismatch)' : medicalInfo.diabetes_type);
        }
        
        console.log('\n✅ PASS: Application handles decryption failures gracefully');
        console.log('⚠️  NOTE: Data is still encrypted - you need to set the correct ENCRYPTION_KEY');
        console.log('📖 See ENCRYPTION_KEY_MISMATCH_FIX.md for details\n');
        
        process.exit(0);
    } catch (error) {
        console.error('\n❌ FAIL: Application crashed:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

testGracefulFallback();
