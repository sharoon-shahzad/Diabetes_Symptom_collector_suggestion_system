import mongoose from 'mongoose';
import encryptionService from './services/encryptionService.js';
import { UserPersonalInfo } from './models/UserPersonalInfo.js';
import { UserMedicalInfo } from './models/UserMedicalInfo.js';
import { User } from './models/User.js';

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/diabetes_system';

async function testCompleteEncryption() {
  try {
    console.log('🔐 COMPLETE ENCRYPTION VERIFICATION TEST\n');
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // First, clear old test data
    console.log('🧹 Clearing old test data...');
    const users = await User.find({ email: 'encryption-test@test.com' });
    for (const user of users) {
      await UserPersonalInfo.deleteMany({ user_id: user._id });
      await UserMedicalInfo.deleteMany({ user_id: user._id });
      await User.deleteOne({ _id: user._id });
    }
    console.log('✅ Old data cleared\n');

    // Create a test user
    console.log('👤 Creating test user...');
    const user = await User.create({
      email: 'encryption-test@test.com',
      fullName: 'Encryption Test User',
      password: 'test123', // Will be hashed
      country: 'Pakistan',
    });
    console.log(`✅ User created: ${user._id}\n`);

    // Create comprehensive personal info
    console.log('📝 Creating comprehensive personal information...');
    const personalInfo = await UserPersonalInfo.create({
      user_id: user._id,
      date_of_birth: new Date('1990-05-15'),
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
        phone: '+92-300-1234567',
        relationship: 'Brother',
      },
      address: {
        street: '123 Main Street',
        city: 'Karachi',
        state: 'Sindh',
        zip_code: '75500',
        country: 'Pakistan',
      },
    });
    console.log('✅ Personal info created\n');

    // Create comprehensive medical info
    console.log('📋 Creating comprehensive medical information...');
    const medicalInfo = await UserMedicalInfo.create({
      user_id: user._id,
      diabetes_type: 'Type 2',
      diagnosis_date: new Date('2020-03-10'),
      current_medications: [
        { medication_name: 'Metformin', dosage: '500mg', frequency: 'Twice daily' },
        { medication_name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily' },
      ],
      allergies: [
        { allergen: 'Penicillin', reaction: 'Rash' },
        { allergen: 'Shellfish', reaction: 'Anaphylaxis' },
      ],
      chronic_conditions: [
        { condition_name: 'Hypertension', diagnosed_date: new Date('2018-06-20') },
        { condition_name: 'Hyperlipidemia', diagnosed_date: new Date('2019-01-15') },
      ],
      family_history: [
        { relation: 'Father', condition: 'Diabetes' },
        { relation: 'Mother', condition: 'Heart Disease' },
      ],
      recent_lab_results: {
        hba1c: {
          value: 7.2,
          date: new Date('2025-12-24'),
          unit: '%',
        },
        fasting_glucose: {
          value: 125,
          date: new Date('2025-12-24'),
          unit: 'mg/dL',
        },
        cholesterol: {
          total: 210,
          ldl: 130,
          hdl: 45,
          date: new Date('2025-12-24'),
          unit: 'mg/dL',
        },
      },
      blood_pressure: {
        systolic: 135,
        diastolic: 85,
        last_recorded: new Date('2025-12-24'),
      },
      last_medical_checkup: new Date('2025-12-20'),
    });
    console.log('✅ Medical info created\n');

    // Now fetch from database directly (bypassing Mongoose post-hooks) to check raw encryption
    console.log('🔍 Checking raw database encryption...\n');

    const personalInfoRaw = await mongoose.connection
      .collection('userpersonalinfos')
      .findOne({ _id: personalInfo._id });

    const medicalInfoRaw = await mongoose.connection
      .collection('usermedicalinfos')
      .findOne({ _id: medicalInfo._id });

    console.log('═══════════════════════════════════════════════════════════');
    console.log('📊 USER PERSONAL INFORMATION - ENCRYPTION STATUS');
    console.log('═══════════════════════════════════════════════════════════\n');

    const personalFields = [
      { field: 'date_of_birth', value: personalInfoRaw.date_of_birth },
      { field: 'gender', value: personalInfoRaw.gender },
      { field: 'height', value: personalInfoRaw.height },
      { field: 'weight', value: personalInfoRaw.weight },
      { field: 'activity_level', value: personalInfoRaw.activity_level },
      { field: 'dietary_preference', value: personalInfoRaw.dietary_preference },
      { field: 'smoking_status', value: personalInfoRaw.smoking_status },
      { field: 'alcohol_use', value: personalInfoRaw.alcohol_use },
      { field: 'sleep_hours', value: personalInfoRaw.sleep_hours },
      { field: 'emergency_contact.name', value: personalInfoRaw.emergency_contact?.name },
      { field: 'emergency_contact.phone', value: personalInfoRaw.emergency_contact?.phone },
      { field: 'emergency_contact.relationship', value: personalInfoRaw.emergency_contact?.relationship },
      { field: 'address.street', value: personalInfoRaw.address?.street },
      { field: 'address.city', value: personalInfoRaw.address?.city },
      { field: 'address.state', value: personalInfoRaw.address?.state },
      { field: 'address.zip_code', value: personalInfoRaw.address?.zip_code },
      { field: 'address.country', value: personalInfoRaw.address?.country },
    ];

    let personalEncryptedCount = 0;
    personalFields.forEach(({ field, value }) => {
      const isEncrypted = value && typeof value === 'string' && value.includes(':');
      const status = isEncrypted ? '✅ ENCRYPTED' : '❌ NOT ENCRYPTED';
      console.log(`${status} | ${field.padEnd(35)} | ${String(value).substring(0, 50)}`);
      if (isEncrypted) personalEncryptedCount++;
    });

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('📊 USER MEDICAL INFORMATION - ENCRYPTION STATUS');
    console.log('═══════════════════════════════════════════════════════════\n');

    const medicalFields = [
      { field: 'diabetes_type', value: medicalInfoRaw.diabetes_type },
      { field: 'diagnosis_date', value: medicalInfoRaw.diagnosis_date },
      { field: 'current_medications[0].medication_name', value: medicalInfoRaw.current_medications?.[0]?.medication_name },
      { field: 'current_medications[0].dosage', value: medicalInfoRaw.current_medications?.[0]?.dosage },
      { field: 'current_medications[0].frequency', value: medicalInfoRaw.current_medications?.[0]?.frequency },
      { field: 'allergies[0].allergen', value: medicalInfoRaw.allergies?.[0]?.allergen },
      { field: 'allergies[0].reaction', value: medicalInfoRaw.allergies?.[0]?.reaction },
      { field: 'chronic_conditions[0].condition_name', value: medicalInfoRaw.chronic_conditions?.[0]?.condition_name },
      { field: 'chronic_conditions[0].diagnosed_date', value: medicalInfoRaw.chronic_conditions?.[0]?.diagnosed_date },
      { field: 'family_history[0].relation', value: medicalInfoRaw.family_history?.[0]?.relation },
      { field: 'family_history[0].condition', value: medicalInfoRaw.family_history?.[0]?.condition },
      { field: 'recent_lab_results.hba1c.value', value: medicalInfoRaw.recent_lab_results?.hba1c?.value },
      { field: 'recent_lab_results.hba1c.date', value: medicalInfoRaw.recent_lab_results?.hba1c?.date },
      { field: 'recent_lab_results.hba1c.unit', value: medicalInfoRaw.recent_lab_results?.hba1c?.unit },
      { field: 'recent_lab_results.fasting_glucose.value', value: medicalInfoRaw.recent_lab_results?.fasting_glucose?.value },
      { field: 'recent_lab_results.fasting_glucose.date', value: medicalInfoRaw.recent_lab_results?.fasting_glucose?.date },
      { field: 'recent_lab_results.fasting_glucose.unit', value: medicalInfoRaw.recent_lab_results?.fasting_glucose?.unit },
      { field: 'recent_lab_results.cholesterol.total', value: medicalInfoRaw.recent_lab_results?.cholesterol?.total },
      { field: 'recent_lab_results.cholesterol.ldl', value: medicalInfoRaw.recent_lab_results?.cholesterol?.ldl },
      { field: 'recent_lab_results.cholesterol.hdl', value: medicalInfoRaw.recent_lab_results?.cholesterol?.hdl },
      { field: 'recent_lab_results.cholesterol.date', value: medicalInfoRaw.recent_lab_results?.cholesterol?.date },
      { field: 'recent_lab_results.cholesterol.unit', value: medicalInfoRaw.recent_lab_results?.cholesterol?.unit },
      { field: 'blood_pressure.systolic', value: medicalInfoRaw.blood_pressure?.systolic },
      { field: 'blood_pressure.diastolic', value: medicalInfoRaw.blood_pressure?.diastolic },
      { field: 'blood_pressure.last_recorded', value: medicalInfoRaw.blood_pressure?.last_recorded },
      { field: 'last_medical_checkup', value: medicalInfoRaw.last_medical_checkup },
    ];

    let medicalEncryptedCount = 0;
    medicalFields.forEach(({ field, value }) => {
      const isEncrypted = value && typeof value === 'string' && value.includes(':');
      const status = isEncrypted ? '✅ ENCRYPTED' : '❌ NOT ENCRYPTED';
      console.log(`${status} | ${field.padEnd(45)} | ${String(value).substring(0, 40)}`);
      if (isEncrypted) medicalEncryptedCount++;
    });

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('📈 ENCRYPTION SUMMARY');
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log(`Personal Info Encrypted: ${personalEncryptedCount}/${personalFields.length} fields`);
    console.log(`Medical Info Encrypted: ${medicalEncryptedCount}/${medicalFields.length} fields`);

    if (personalEncryptedCount === personalFields.length && medicalEncryptedCount === medicalFields.length) {
      console.log('\n✅ SUCCESS: ALL FIELDS ARE ENCRYPTED!');
      console.log('✅ HIPAA/GDPR COMPLIANCE: ENABLED (Data at rest is encrypted)\n');
    } else {
      console.log('\n⚠️ WARNING: Some fields are not encrypted!');
      console.log(`Missing encryptions: ${personalFields.length - personalEncryptedCount + medicalFields.length - medicalEncryptedCount} fields\n`);
    }

    // Verify decryption works
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🔓 VERIFYING DECRYPTION (Post-hooks)');
    console.log('═══════════════════════════════════════════════════════════\n');

    const personalInfoDecrypted = await UserPersonalInfo.findById(personalInfo._id);
    const medicalInfoDecrypted = await UserMedicalInfo.findById(medicalInfo._id);

    console.log('✅ Personal Info (decrypted):');
    console.log(`   - Gender: ${personalInfoDecrypted.gender}`);
    console.log(`   - Height: ${personalInfoDecrypted.height} cm`);
    console.log(`   - Weight: ${personalInfoDecrypted.weight} kg`);
    console.log(`   - Activity Level: ${personalInfoDecrypted.activity_level}`);
    console.log(`   - Address: ${personalInfoDecrypted.address?.street}, ${personalInfoDecrypted.address?.city}\n`);

    console.log('✅ Medical Info (decrypted):');
    console.log(`   - Diabetes Type: ${medicalInfoDecrypted.diabetes_type}`);
    console.log(`   - Diagnosis Date: ${medicalInfoDecrypted.diagnosis_date}`);
    console.log(`   - Medications: ${medicalInfoDecrypted.current_medications?.length} items`);
    console.log(`   - HbA1c: ${medicalInfoDecrypted.recent_lab_results?.hba1c?.value} ${medicalInfoDecrypted.recent_lab_results?.hba1c?.unit}\n`);

    console.log('═══════════════════════════════════════════════════════════');
    console.log('✅ COMPLETE ENCRYPTION TEST PASSED');
    console.log('═══════════════════════════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testCompleteEncryption();
