import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User } from './models/User.js';
import { UsersAnswers } from './models/Users_Answers.js';
import { Question } from './models/Question.js';
import { Symptom } from './models/Symptom.js';

dotenv.config();

async function debugAnswers() {
  try {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    // Get all users
    const users = await User.find({});
    console.log('Total users:', users.length);
    
    for (const user of users) {
      console.log(`\nUser: ${user.email} (${user._id})`);
      
      // Get user's answers
      const userAnswers = await UsersAnswers.find({ user_id: user._id, deleted_at: null })
        .populate({ path: 'question_id', model: 'Question', populate: { path: 'symptom_id', model: 'Symptom' } })
        .populate({ path: 'answer_id', model: 'Answer' });
      
      console.log('  Answers count:', userAnswers.length);
      
      if (userAnswers.length > 0) {
        console.log('  Sample answers:');
        userAnswers.slice(0, 3).forEach(ua => {
          console.log(`    Q: ${ua.question_id?.question_text}`);
          console.log(`    A: ${ua.answer_id?.answer_text}`);
          console.log(`    S: ${ua.question_id?.symptom_id?.name}`);
        });
      }
    }

    // Get all questions for Diabetes
    const diabetesDisease = await mongoose.model('Disease').findOne({ name: 'Diabetes' });
    if (diabetesDisease) {
      const diabetesSymptoms = await Symptom.find({ disease_id: diabetesDisease._id });
      console.log('\nDiabetes symptoms:', diabetesSymptoms.map(s => s.name));
      
      const diabetesQuestions = await Question.find({ 
        symptom_id: { $in: diabetesSymptoms.map(s => s._id) } 
      }).populate('symptom_id');
      
      console.log('Diabetes questions:', diabetesQuestions.map(q => ({
        question: q.question_text,
        symptom: q.symptom_id?.name
      })));
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

debugAnswers();
