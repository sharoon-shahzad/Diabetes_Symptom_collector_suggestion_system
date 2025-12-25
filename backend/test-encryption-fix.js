import mongoose from 'mongoose';
import { UserPersonalInfo } from './models/UserPersonalInfo.js';
import { UserMedicalInfo } from './models/UserMedicalInfo.js';
import { User } from './models/User.js';
import encryptionService from './services/encryptionService.js';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

const testEncryption = async () => {
    try {
        console.log('\n╔════════════════════════════════════════════════════════════╗');
        console.log('║    TESTING ENCRYPTION FIX - Verify .save() Triggers        ║');
        console.log('╚════════════════════════════════════════════════════════════╝\n');

        // Create test user
        const testUser = new User({
            fullName: 'Encryption Test User',
            email: `test-encryption-${Date.now()}@test.com`,
            password: 'test123',
            phone_number: '+923001234567',
            country: 'Pakistan',
            country_code: '+92'
        });

        console.log('📝 Creating test user with phone: +923001234567');
        const savedUser = await testUser.save();
        console.log('✅ User saved successfully');
        console.log(`   User ID: ${savedUser._id}`);
        console.log(`   Phone in DB (encrypted): ${savedUser.phone_number.substring(0, 20)}...`);

        // Create personal info using .save() method (NEW FIX)
        console.log('\n📝 Creating personal info using .save() method...');
        const personalInfo = new UserPersonalInfo({
            user_id: savedUser._id,
            date_of_birth: '1990-01-15',
            gender: 'Male',
            height: 180,
            weight: 75,
            activity_level: 'Moderate',
            sleep_hours: 7
        });

        console.log('   Before save:');
        console.log(`   - date_of_birth: ${personalInfo.date_of_birth} (Type: ${typeof personalInfo.date_of_birth})`);
        console.log(`   - gender: ${personalInfo.gender}`);
        console.log(`   - height: ${personalInfo.height}`);
        console.log(`   - weight: ${personalInfo.weight}`);

        const savedPersonalInfo = await personalInfo.save();

        console.log('\n   After save (decrypted by post-save middleware):');
        console.log(`   - date_of_birth: ${savedPersonalInfo.date_of_birth} (Type: ${typeof savedPersonalInfo.date_of_birth})`);
        console.log(`   - gender: ${savedPersonalInfo.gender}`);
        console.log(`   - height: ${savedPersonalInfo.height}`);
        console.log(`   - weight: ${savedPersonalInfo.weight}`);

        // Verify encryption in database by fetching raw from MongoDB (skip mongoose decryption)
        console.log('\n🔍 Fetching from database to verify encryption...');
        const checkPersonal = await UserPersonalInfo.findOne({ user_id: savedUser._id });

        if (checkPersonal) {
            // Get the raw stored value
            const rawPersonal = await UserPersonalInfo.collection.findOne({ user_id: new mongoose.Types.ObjectId(savedUser._id) });
            
            if (rawPersonal && rawPersonal.date_of_birth) {
                const storedDateOfBirth = rawPersonal.date_of_birth;
                const isEncrypted = encryptionService.isEncrypted(storedDateOfBirth);

                console.log(`   Raw stored date_of_birth: ${String(storedDateOfBirth).substring(0, 50)}...`);
                console.log(`   Is encrypted: ${isEncrypted ? '✅ YES' : '❌ NO'}`);

                if (isEncrypted) {
                    const decrypted = encryptionService.decrypt(storedDateOfBirth);
                    console.log(`   Decrypted value: ${decrypted}`);
                }
            }

            // Also test the mongoose-fetched document (should be decrypted by middleware)
            console.log(`\n   Mongoose-fetched date_of_birth (should be decrypted): ${checkPersonal.date_of_birth}`);
            console.log(`   Mongoose-fetched gender (should be decrypted): ${checkPersonal.gender}`);
        }

        // Create medical info using .save() method (NEW FIX)
        console.log('\n📝 Creating medical info using .save() method...');
        const medicalInfo = new UserMedicalInfo({
            user_id: savedUser._id,
            diabetes_type: 'Type 2',
            diagnosis_date: '2024-01-01',
            current_medications: [{ name: 'Metformin', dosage: '500mg' }],
            allergies: [{ allergen: 'Penicillin', severity: 'High' }],
            family_history: [{ relation: 'Mother', condition: 'Type 2 Diabetes' }]
        });

        console.log('   Before save:');
        console.log(`   - diabetes_type: ${medicalInfo.diabetes_type}`);
        console.log(`   - diagnosis_date: ${medicalInfo.diagnosis_date}`);

        const savedMedicalInfo = await medicalInfo.save();

        console.log('\n   After save (decrypted by post-save middleware):');
        console.log(`   - diabetes_type: ${savedMedicalInfo.diabetes_type}`);
        console.log(`   - diagnosis_date: ${savedMedicalInfo.diagnosis_date}`);

        // Verify medical encryption
        console.log('\n🔍 Fetching medical info from database to verify encryption...');
        const checkMedical = await UserMedicalInfo.findOne({ user_id: savedUser._id });

        if (checkMedical) {
            // Get the raw stored value
            const rawMedical = await UserMedicalInfo.collection.findOne({ user_id: new mongoose.Types.ObjectId(savedUser._id) });
            
            if (rawMedical && rawMedical.diabetes_type) {
                const storedDiabetesType = rawMedical.diabetes_type;
                const isEncrypted = encryptionService.isEncrypted(storedDiabetesType);

                console.log(`   Raw stored diabetes_type: ${String(storedDiabetesType).substring(0, 50)}...`);
                console.log(`   Is encrypted: ${isEncrypted ? '✅ YES' : '❌ NO'}`);

                if (isEncrypted) {
                    const decrypted = encryptionService.decrypt(storedDiabetesType);
                    console.log(`   Decrypted value: ${decrypted}`);
                }
            }

            // Also test the mongoose-fetched document
            console.log(`\n   Mongoose-fetched diabetes_type (should be decrypted): ${checkMedical.diabetes_type}`);
        }

        console.log('\n╔════════════════════════════════════════════════════════════╗');
        console.log('║                 ✅ ENCRYPTION TEST COMPLETE                ║');
        console.log('╚════════════════════════════════════════════════════════════╝\n');

    } catch (error) {
        console.error('❌ Test error:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

connectDB().then(testEncryption);
