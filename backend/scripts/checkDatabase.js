import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { UsersAnswers } from '../models/Users_Answers.js';
import { Question } from '../models/Question.js';
import { Answer } from '../models/Answer.js';
import { connectDB } from '../config/db.js';

async function checkDatabase() {
  try {
    console.log('🔍 CONNECTING TO DATABASE...\n');
    await connectDB();
    
    // 1. Check Users collection
    console.log('👥 ========== USERS COLLECTION ==========');
    const users = await User.find({}).select('fullname email date_of_birth gender onboardingCompleted');
    console.log(`Total users: ${users.length}`);
    users.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.fullname} (${user.email})`);
      console.log(`   DOB: ${user.date_of_birth}`);
      console.log(`   Gender: ${user.gender}`);
      console.log(`   Onboarding Complete: ${user.onboardingCompleted}`);
    });
    
    // 2. Check Questions collection
    console.log('\n\n📋 ========== QUESTIONS COLLECTION ==========');
    const questions = await Question.find({ deleted_at: null }).select('question_text symptom_id');
    console.log(`Total questions: ${questions.length}`);
    
    // 3. Check Answers collection
    console.log('\n\n💬 ========== ANSWERS COLLECTION ==========');
    const answers = await Answer.find({ deleted_at: null }).select('answer_text');
    console.log(`Total answers: ${answers.length}`);
    console.log('Sample answers:', answers.slice(0, 10).map(a => a.answer_text));
    
    // 4. Check Users_Answers collection (THE CRITICAL ONE!)
    console.log('\n\n✅ ========== USERS_ANSWERS COLLECTION (CRITICAL!) ==========');
    const usersAnswers = await UsersAnswers.find({ deleted_at: null })
      .populate('user_id', 'fullname email')
      .populate('question_id', 'question_text')
      .populate('answer_id', 'answer_text');
    
    console.log(`Total user answers: ${usersAnswers.length}`);
    
    if (usersAnswers.length === 0) {
      console.log('\n❌ ❌ ❌ NO ANSWERS FOUND IN USERS_ANSWERS COLLECTION! ❌ ❌ ❌');
      console.log('This is why symptoms show 0/14!\n');
    } else {
      // Group by user
      const answersByUser = {};
      usersAnswers.forEach(ua => {
        const userEmail = ua.user_id?.email || 'Unknown';
        if (!answersByUser[userEmail]) {
          answersByUser[userEmail] = [];
        }
        answersByUser[userEmail].push({
          question: ua.question_id?.question_text || 'Unknown question',
          answer: ua.answer_id?.answer_text || 'Unknown answer'
        });
      });
      
      console.log('\nAnswers by user:');
      Object.keys(answersByUser).forEach(email => {
        console.log(`\n${email}: ${answersByUser[email].length} answers`);
        answersByUser[email].forEach((qa, index) => {
          console.log(`  ${index + 1}. Q: ${qa.question}`);
          console.log(`     A: ${qa.answer}`);
        });
      });
    }
    
    // 5. Check for the specific user
    console.log('\n\n🔍 ========== SPECIFIC USER CHECK ==========');
    const nagasaki = await User.findOne({ email: 'nagasakihikamaru@gmail.com' });
    if (nagasaki) {
      console.log(`Found user: ${nagasaki.fullname}`);
      console.log(`User ID: ${nagasaki._id}`);
      
      const nagasakiAnswers = await UsersAnswers.find({ 
        user_id: nagasaki._id, 
        deleted_at: null 
      })
        .populate('question_id', 'question_text')
        .populate('answer_id', 'answer_text');
      
      console.log(`\nAnswers for ${nagasaki.email}: ${nagasakiAnswers.length}`);
      
      if (nagasakiAnswers.length === 0) {
        console.log('\n❌ THIS USER HAS NO SAVED ANSWERS!');
        console.log('The batch-save-answers endpoint is NOT working properly.\n');
      } else {
        nagasakiAnswers.forEach((ua, index) => {
          console.log(`  ${index + 1}. Q: ${ua.question_id?.question_text}`);
          console.log(`     A: ${ua.answer_id?.answer_text}`);
        });
      }
    } else {
      console.log('❌ User nagasakihikamaru@gmail.com not found!');
    }
    
    console.log('\n\n✅ Database check complete!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking database:', error);
    process.exit(1);
  }
}

checkDatabase();
