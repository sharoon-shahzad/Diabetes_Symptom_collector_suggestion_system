import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { UsersAnswers } from '../models/Users_Answers.js';
import { User } from '../models/User.js';
import { connectDB } from '../config/db.js';

async function clearUserAnswers() {
  try {
    console.log('🔍 Connecting to database...\n');
    await connectDB();
    
    // Find nagasaki user
    const nagasaki = await User.findOne({ email: 'nagasakihikamaru@gmail.com' });
    
    if (nagasaki) {
      console.log(`Found user: ${nagasaki.email} (ID: ${nagasaki._id})\n`);
      
      // Delete all answers for this user
      const deleteResult = await UsersAnswers.deleteMany({ user_id: nagasaki._id });
      console.log(`✅ Deleted ${deleteResult.deletedCount} answer records for this user\n`);
      
      // Reset onboarding flag
      nagasaki.onboardingCompleted = false;
      await nagasaki.save();
      console.log(`✅ Reset onboardingCompleted flag\n`);
      
      console.log('🎯 User is ready for fresh testing!\n');
      console.log('📝 Next steps:');
      console.log('1. Answer questions on /symptom-assessment');
      console.log('2. Check browser console for logs');
      console.log('3. Login and verify answers are saved');
    } else {
      console.log('❌ User not found!');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

clearUserAnswers();
