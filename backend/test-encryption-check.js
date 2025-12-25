import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { UserPersonalInfo } from './models/UserPersonalInfo.js';
import { UserMedicalInfo } from './models/UserMedicalInfo.js';

dotenv.config();

const testEncryption = async () => {
    try {
        console.log('🔗 Connecting to database...');
        await connectDB();
        console.log('✅ Database connected\n');

        console.log('🔍 CHECKING PERSONAL INFO ENCRYPTION:');
        const personalInfos = await UserPersonalInfo.find().limit(3);
        
        if (personalInfos.length === 0) {
            console.log('⚠️  No personal info records found');
        } else {
            personalInfos.forEach((info, index) => {
                console.log(`\n📄 Record ${index + 1}:`);
                console.log(`  user_id: ${info.user_id}`);
                console.log(`  date_of_birth: ${info.date_of_birth}`);
                console.log(`    - Type: ${typeof info.date_of_birth}`);
                console.log(`    - Is String?: ${typeof info.date_of_birth === 'string'}`);
                console.log(`    - Length: ${String(info.date_of_birth).length}`);
                console.log(`    - Contains colon (:)?: ${String(info.date_of_birth).includes(':')}`);
                
                console.log(`  height: ${info.height}`);
                console.log(`    - Type: ${typeof info.height}`);
                console.log(`    - Is String?: ${typeof info.height === 'string'}`);
                if (typeof info.height === 'string') {
                    console.log(`    - Contains colon (:)?: ${info.height.includes(':')}`);
                }
                
                console.log(`  weight: ${info.weight}`);
                console.log(`    - Type: ${typeof info.weight}`);
                console.log(`    - Is String?: ${typeof info.weight === 'string'}`);
                if (typeof info.weight === 'string') {
                    console.log(`    - Contains colon (:)?: ${info.weight.includes(':')}`);
                }

                if (info.address) {
                    console.log(`  address.street: ${info.address.street}`);
                    if (info.address.street) {
                        console.log(`    - Is encrypted?: ${String(info.address.street).includes(':')}`);
                    }
                }
            });
        }

        console.log('\n\n🔍 CHECKING MEDICAL INFO ENCRYPTION:');
        const medicalInfos = await UserMedicalInfo.find().limit(3);
        
        if (medicalInfos.length === 0) {
            console.log('⚠️  No medical info records found');
        } else {
            medicalInfos.forEach((info, index) => {
                console.log(`\n📄 Record ${index + 1}:`);
                console.log(`  user_id: ${info.user_id}`);
                console.log(`  diabetes_type: ${info.diabetes_type}`);
                console.log(`    - Type: ${typeof info.diabetes_type}`);
                
                console.log(`  diagnosis_date: ${info.diagnosis_date}`);
                console.log(`    - Type: ${typeof info.diagnosis_date}`);
                console.log(`    - Is String?: ${typeof info.diagnosis_date === 'string'}`);
                if (typeof info.diagnosis_date === 'string') {
                    console.log(`    - Contains colon (:)?: ${info.diagnosis_date.includes(':')}`);
                }

                if (info.current_medications && info.current_medications.length > 0) {
                    console.log(`  medications[0]:`);
                    const med = info.current_medications[0];
                    console.log(`    - medication_name: ${med.medication_name}`);
                    if (med.medication_name) {
                        console.log(`      - Is encrypted?: ${String(med.medication_name).includes(':')}`);
                    }
                    console.log(`    - dosage: ${med.dosage}`);
                    console.log(`    - frequency: ${med.frequency}`);
                }
            });
        }

        console.log('\n\n✅ Encryption check complete!');
        console.log('\n📝 INTERPRETATION:');
        console.log('  - If fields contain "hex:hex" format (with colon) → ✅ ENCRYPTED');
        console.log('  - If fields are plain numbers/text → ❌ NOT ENCRYPTED');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
        process.exit(1);
    }
};

testEncryption();
