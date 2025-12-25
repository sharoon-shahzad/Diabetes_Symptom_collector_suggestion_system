import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';

dotenv.config();

const checkRawDatabase = async () => {
    try {
        console.log('🔗 Connecting to database...');
        await connectDB();
        console.log('✅ Database connected\n');

        // Get raw data from MongoDB without using Mongoose model (bypasses post-hooks)
        const db = mongoose.connection.db;
        
        console.log('🔍 Fetching raw PersonalInfo from MongoDB (BYPASSING Mongoose post-hooks)...\n');
        const personalInfos = await db.collection('userpersonalinfos').find({}).limit(2).toArray();
        
        if (personalInfos.length === 0) {
            console.log('⚠️  No personal info found');
        } else {
            personalInfos.forEach((info, index) => {
                console.log(`📄 PersonalInfo Record ${index + 1}:`);
                console.log(`  date_of_birth: ${String(info.date_of_birth).substring(0, 50)}${String(info.date_of_birth).length > 50 ? '...' : ''}`);
                console.log(`    - Is encrypted (has colon)?: ${String(info.date_of_birth).includes(':')}`);
                
                console.log(`  height: ${String(info.height).substring(0, 50)}${String(info.height).length > 50 ? '...' : ''}`);
                console.log(`    - Is encrypted (has colon)?: ${String(info.height).includes(':')}`);
                
                console.log(`  weight: ${String(info.weight).substring(0, 50)}${String(info.weight).length > 50 ? '...' : ''}`);
                console.log(`    - Is encrypted (has colon)?: ${String(info.weight).includes(':')}`);

                if (info.address?.street) {
                    console.log(`  address.street: ${String(info.address.street).substring(0, 50)}${String(info.address.street).length > 50 ? '...' : ''}`);
                    console.log(`    - Is encrypted (has colon)?: ${String(info.address.street).includes(':')}`);
                }

                if (info.emergency_contact?.name) {
                    console.log(`  emergency_contact.name: ${String(info.emergency_contact.name).substring(0, 50)}${String(info.emergency_contact.name).length > 50 ? '...' : ''}`);
                    console.log(`    - Is encrypted (has colon)?: ${String(info.emergency_contact.name).includes(':')}`);
                }

                console.log();
            });
        }

        console.log('\n🔍 Fetching raw MedicalInfo from MongoDB (BYPASSING Mongoose post-hooks)...\n');
        const medicalInfos = await db.collection('usermedicalinfos').find({}).limit(2).toArray();
        
        if (medicalInfos.length === 0) {
            console.log('⚠️  No medical info found');
        } else {
            medicalInfos.forEach((info, index) => {
                console.log(`📄 MedicalInfo Record ${index + 1}:`);
                
                if (info.current_medications && info.current_medications[0]) {
                    const med = info.current_medications[0];
                    console.log(`  current_medications[0].medication_name: ${String(med.medication_name).substring(0, 50)}${String(med.medication_name).length > 50 ? '...' : ''}`);
                    console.log(`    - Is encrypted (has colon)?: ${String(med.medication_name).includes(':')}`);
                }

                if (info.blood_pressure) {
                    console.log(`  blood_pressure.systolic: ${String(info.blood_pressure.systolic).substring(0, 50)}${String(info.blood_pressure.systolic).length > 50 ? '...' : ''}`);
                    console.log(`    - Is encrypted (has colon)?: ${String(info.blood_pressure.systolic).includes(':')}`);
                }

                console.log();
            });
        }

        console.log('\n✅ Raw database check complete!');
        console.log('\n📝 IMPORTANT:');
        console.log('  ✅ If data contains "hex:hex" format (with colon) → Data IS encrypted in MongoDB');
        console.log('  ❌ If data is plain text/numbers → Data is NOT encrypted in MongoDB');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
        process.exit(1);
    }
};

checkRawDatabase();
