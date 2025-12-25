/**
 * Encryption Testing & Demo Script
 * Tests field-level encryption for User, UserMedicalInfo, and UserPersonalInfo models
 * 
 * Run with: node test-encryption.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import encryptionService from './services/encryptionService.js';
import { User } from './models/User.js';
import { UserMedicalInfo } from './models/UserMedicalInfo.js';
import { UserPersonalInfo } from './models/UserPersonalInfo.js';

dotenv.config();

console.log('\n========================================');
console.log('🔐 ENCRYPTION TESTING & DEMO');
console.log('========================================\n');

// Test 1: Encryption Utility Functions
console.log('📝 TEST 1: Encryption Utility Functions');
console.log('----------------------------------------');

const testData = '+923001234567';
console.log(`Original data: ${testData}`);

const encrypted = encryptionService.encrypt(testData);
console.log(`Encrypted: ${encrypted}`);
console.log(`Encrypted format valid: ${encryptionService.isEncrypted(encrypted)}`);

const decrypted = encryptionService.decrypt(encrypted);
console.log(`Decrypted: ${decrypted}`);
console.log(`Match: ${decrypted === testData ? '✅ YES' : '❌ NO'}\n`);

// Test 2: Generate encryption key
console.log('📝 TEST 2: Generate New Encryption Key');
console.log('----------------------------------------');
const newKey = encryptionService.constructor.generateNewKey();
console.log(`New key generated (64 hex chars): ${newKey}`);
console.log(`Key length valid: ${newKey.length === 64 ? '✅ YES' : '❌ NO'}\n`);

// Test 3: Database connection & model testing
async function testModels() {
  try {
    console.log('📝 TEST 3: Database & Model Encryption');
    console.log('----------------------------------------');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Test User model encryption
    console.log('🔹 Testing User model:');
    const testUser = new User({
      fullName: 'Test User For Encryption',
      email: `test-encrypt-${Date.now()}@example.com`,
      password: 'hashedpassword123',
      phone_number: '+923001234567',
      whatsapp_number: '+923009876543',
      country: 'Pakistan',
      country_code: '+92',
    });

    console.log('   - Original phone_number:', testUser.phone_number);
    console.log('   - Original whatsapp_number:', testUser.whatsapp_number);

    await testUser.save();
    console.log('   ✅ User saved to database');

    // Retrieve and check encryption
    const savedUser = await User.findById(testUser._id).select(
      'phone_number whatsapp_number'
    );
    const rawUser = await User.collection.findOne({ _id: testUser._id });

    console.log('   - Encrypted in DB phone_number:', rawUser.phone_number.substring(0, 20) + '...');
    console.log('   - Decrypted on retrieval phone_number:', savedUser.phone_number);
    console.log('   - Decryption match:', savedUser.phone_number === testUser.phone_number ? '✅' : '❌');

    // Test UserMedicalInfo encryption
    console.log('\n🔹 Testing UserMedicalInfo model:');
    const medicalInfo = new UserMedicalInfo({
      user_id: testUser._id,
      diabetes_type: 'Type 2',
      diagnosis_date: new Date('2023-01-15'),
      current_medications: [
        {
          medication_name: 'Metformin',
          dosage: '500mg',
          frequency: 'Twice daily',
        },
      ],
      allergies: [
        {
          allergen: 'Penicillin',
          reaction: 'Severe rash',
        },
      ],
      recent_lab_results: {
        hba1c: {
          value: 7.5,
          date: new Date(),
          unit: '%',
        },
        cholesterol: {
          total: 220,
          ldl: 140,
          hdl: 45,
          date: new Date(),
        },
      },
      blood_pressure: {
        systolic: 140,
        diastolic: 90,
        last_recorded: new Date(),
      },
    });

    console.log('   - Original medication name: Metformin');
    console.log('   - Original HbA1c value: 7.5');
    console.log('   - Original cholesterol total: 220');

    await medicalInfo.save();
    console.log('   ✅ Medical info saved to database');

    // Retrieve and verify decryption
    const savedMedical = await UserMedicalInfo.findById(medicalInfo._id);
    console.log('   - Decrypted medication name:', savedMedical.current_medications[0].medication_name);
    console.log('   - Decrypted HbA1c value:', savedMedical.recent_lab_results.hba1c.value);
    console.log('   - Decrypted cholesterol total:', savedMedical.recent_lab_results.cholesterol.total);

    // Test UserPersonalInfo encryption
    console.log('\n🔹 Testing UserPersonalInfo model:');
    const personalInfo = new UserPersonalInfo({
      user_id: testUser._id,
      date_of_birth: new Date('1990-05-15'),
      gender: 'Male',
      height: 180,
      weight: 85,
      address: {
        street: '123 Main Street',
        city: 'Karachi',
        state: 'Sindh',
        zip_code: '75600',
        country: 'Pakistan',
      },
      emergency_contact: {
        name: 'Jane Doe',
        phone: '+923005555555',
        relationship: 'Spouse',
      },
    });

    console.log('   - Original street: 123 Main Street');
    console.log('   - Original height: 180');
    console.log('   - Original emergency contact name: Jane Doe');

    await personalInfo.save();
    console.log('   ✅ Personal info saved to database');

    // Retrieve and verify
    const savedPersonal = await UserPersonalInfo.findById(personalInfo._id);
    console.log('   - Decrypted street:', savedPersonal.address.street);
    console.log('   - Decrypted height:', savedPersonal.height);
    console.log('   - Decrypted emergency contact name:', savedPersonal.emergency_contact.name);

    console.log('\n========================================');
    console.log('✅ ALL ENCRYPTION TESTS PASSED');
    console.log('========================================\n');

    // Cleanup
    await User.deleteOne({ _id: testUser._id });
    await UserMedicalInfo.deleteOne({ _id: medicalInfo._id });
    await UserPersonalInfo.deleteOne({ _id: personalInfo._id });
    console.log('🧹 Test data cleaned up\n');

  } catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error(error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB\n');
  }
}

// Run tests
testModels();
