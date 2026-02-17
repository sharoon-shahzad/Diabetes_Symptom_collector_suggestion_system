// Quick Test Setup for Testing Dashboard
// Run this script in backend terminal to create test user with complete profile

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const UserPersonalInfo = require('./models/UserPersonalInfo');
const UserHealthProfile = require('./models/UserHealthProfile');

// Test user data
const testUser = {
  email: 'testuser@diabetes.com',
  password: 'TestPassword123!',
  fullName: 'Test User',
  isActivated: true,
  diabetes_diagnosed: 'yes'
};

const testPersonalInfo = {
  fullName: 'Test User',
  date_of_birth: new Date('1990-01-01'),
  gender: 'male',
  phone_number: '+1234567890',
  country: 'Pakistan',
  address: '123 Test Street, Lahore',
  emergency_contact_name: 'Emergency Contact',
  emergency_contact_phone: '+1234567891'
};

const testMedicalInfo = {
  diabetes_type: 'Type 2',
  diagnosis_date: new Date('2023-01-01'),
  medications: [
    { medication_name: 'Metformin', dosage: '500mg', frequency: 'twice daily' }
  ],
  allergies: [],
  medical_conditions: ['diabetes'],
  family_history: ['diabetes'],
  blood_work: {
    hba1c: 7.2,
    fasting_glucose: 135,
    cholesterol: 190
  },
  blood_pressure: {
    systolic: 130,
    diastolic: 85
  }
};

async function createTestUser() {
  try {
    console.log('Creating test user for Testing Dashboard...');
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(testUser.password, salt);
    
    // Create user
    const user = new User({
      ...testUser,
      password: hashedPassword
    });
    
    const savedUser = await user.save();
    console.log('✅ Test user created:', savedUser.email);
    
    // Create personal info
    const personalInfo = new UserPersonalInfo({
      user_id: savedUser._id,
      ...testPersonalInfo
    });
    await personalInfo.save();
    console.log('✅ Personal info created');
    
    // Create medical info  
    const medicalInfo = new UserHealthProfile({
      user_id: savedUser._id,
      ...testMedicalInfo
    });
    await medicalInfo.save();
    console.log('✅ Medical info created');
    
    console.log('\n🎉 Test user setup complete!');
    console.log('📧 Email:', testUser.email);
    console.log('🔑 Password:', testUser.password);
    console.log('🔗 Testing Dashboard:', 'http://localhost:5173/testing-dashboard');
    
  } catch (error) {
    if (error.code === 11000) {
      console.log('⚠️  Test user already exists. You can login with:');
      console.log('📧 Email:', testUser.email);
      console.log('🔑 Password:', testUser.password);
    } else {
      console.error('❌ Error creating test user:', error.message);
    }
  }
}

// To run this script:
// 1. cd backend
// 2. node -e "$(cat setup-test-user.js)"
// 3. Or add this to a separate file and run: node setup-test-user.js

module.exports = { createTestUser, testUser };

// If running directly
if (require.main === module) {
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/diabetes_system')
    .then(() => {
      console.log('📡 Connected to MongoDB');
      return createTestUser();
    })
    .then(() => {
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Setup failed:', error);
      process.exit(1);
    });
}