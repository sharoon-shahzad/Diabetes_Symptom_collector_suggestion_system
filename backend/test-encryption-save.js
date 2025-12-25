import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { UserPersonalInfo } from './models/UserPersonalInfo.js';
import { UserMedicalInfo } from './models/UserMedicalInfo.js';
import { User } from './models/User.js';

dotenv.config();

const testEncryptionOnSave = async () => {
    try {
        console.log('🔗 Connecting to database...');
        await connectDB();
        console.log('✅ Database connected\n');

        // Get an existing user
        const user = await User.findOne().limit(1);
        if (!user) {
            console.log('❌ No users found. Please create a user first.');
            process.exit(1);
        }

        console.log(`👤 Using user: ${user.email}\n`);

        // Delete existing personal and medical info if any
        await UserPersonalInfo.deleteOne({ user_id: user._id });
        await UserMedicalInfo.deleteOne({ user_id: user._id });

        console.log('📝 Creating new PersonalInfo with encryption...\n');
        const personalInfo = new UserPersonalInfo({
            user_id: user._id,
            date_of_birth: new Date('2000-01-15'),
            gender: 'Male',
            height: 180,
            weight: 75,
            activity_level: 'Moderately Active',
            dietary_preference: 'Non-Vegetarian',
            smoking_status: 'Never',
            alcohol_use: 'Occasional',
            sleep_hours: 8,
            emergency_contact: {
                name: 'John Doe',
                phone: '03001234567',
                relationship: 'Brother'
            },
            address: {
                street: '123 Main Street',
                city: 'Karachi',
                state: 'Sindh',
                zip_code: '75500',
                country: 'Pakistan'
            }
        });

        console.log('💾 Saving PersonalInfo...');
        await personalInfo.save();
        console.log('✅ PersonalInfo saved\n');

        console.log('📝 Creating new MedicalInfo with encryption...\n');
        const medicalInfo = new UserMedicalInfo({
            user_id: user._id,
            diabetes_type: 'Type 2',
            diagnosis_date: new Date('2023-03-15'),
            current_medications: [
                {
                    medication_name: 'Metformin',
                    dosage: '500mg',
                    frequency: 'Twice daily'
                },
                {
                    medication_name: 'Lisinopril',
                    dosage: '10mg',
                    frequency: 'Once daily'
                }
            ],
            allergies: [
                {
                    allergen: 'Penicillin',
                    reaction: 'Rash'
                }
            ],
            blood_pressure: {
                systolic: 130,
                diastolic: 85
            }
        });

        console.log('💾 Saving MedicalInfo...');
        await medicalInfo.save();
        console.log('✅ MedicalInfo saved\n');

        // Now fetch and check
        console.log('🔍 Fetching saved data from database...\n');
        
        const savedPersonalInfo = await UserPersonalInfo.findOne({ user_id: user._id });
        console.log('📄 PersonalInfo from DB:');
        console.log('  date_of_birth:', savedPersonalInfo.date_of_birth);
        console.log('    - Is encrypted?:', typeof savedPersonalInfo.date_of_birth === 'string' && savedPersonalInfo.date_of_birth.includes(':'));
        console.log('  height:', savedPersonalInfo.height);
        console.log('    - Is encrypted?:', typeof savedPersonalInfo.height === 'string' && savedPersonalInfo.height.includes(':'));
        console.log('  weight:', savedPersonalInfo.weight);
        console.log('    - Is encrypted?:', typeof savedPersonalInfo.weight === 'string' && savedPersonalInfo.weight.includes(':'));

        const savedMedicalInfo = await UserMedicalInfo.findOne({ user_id: user._id });
        console.log('\n📄 MedicalInfo from DB:');
        if (savedMedicalInfo.current_medications && savedMedicalInfo.current_medications[0]) {
            console.log('  medications[0].medication_name:', savedMedicalInfo.current_medications[0].medication_name);
            console.log('    - Is encrypted?:', typeof savedMedicalInfo.current_medications[0].medication_name === 'string' && 
                        savedMedicalInfo.current_medications[0].medication_name.includes(':'));
        }
        console.log('  blood_pressure.systolic:', savedMedicalInfo.blood_pressure?.systolic);
        console.log('    - Is encrypted?:', typeof savedMedicalInfo.blood_pressure?.systolic === 'string' && 
                    savedMedicalInfo.blood_pressure.systolic.includes(':'));

        console.log('\n✅ Test complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
        process.exit(1);
    }
};

testEncryptionOnSave();
