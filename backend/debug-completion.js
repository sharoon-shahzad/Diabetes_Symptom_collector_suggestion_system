import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User } from './models/User.js';
import { UsersAnswers } from './models/Users_Answers.js';
import { Question } from './models/Question.js';
import { Symptom } from './models/Symptom.js';
import { Disease } from './models/Disease.js';
import { Answer } from './models/Answer.js';

dotenv.config();

async function debugCompletionEmail() {
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to database');

        // Get a user who has completed onboarding
        const user = await User.findOne({ onboardingCompleted: true });
        if (!user) {
            console.log('❌ No user found with onboardingCompleted: true');
            return;
        }

        console.log('👤 Found user:', {
            id: user._id,
            email: user.email,
            fullName: user.fullName,
            onboardingCompleted: user.onboardingCompleted,
            onboardingCompletedAt: user.onboardingCompletedAt
        });

        // Get user's answers
        const userAnswers = await UsersAnswers.find({ user_id: user._id, deleted_at: null });
        console.log('📝 User answers count:', userAnswers.length);

        if (userAnswers.length === 0) {
            console.log('❌ No answers found for user');
            return;
        }

        // Get the first answer to find the disease
        const firstAnswer = await UsersAnswers.findOne({ user_id: user._id, deleted_at: null })
            .populate({
                path: 'question_id',
                populate: {
                    path: 'symptom_id',
                    populate: {
                        path: 'disease_id',
                        model: 'Disease'
                    },
                    model: 'Symptom'
                },
                model: 'Question'
            });

        if (!firstAnswer?.question_id?.symptom_id?.disease_id) {
            console.log('❌ Could not find disease information');
            return;
        }

        const disease = firstAnswer.question_id.symptom_id.disease_id;
        console.log('🏥 Disease:', disease.name);

        // Count total questions for this disease
        const allSymptoms = await Symptom.find({ disease_id: disease._id, deleted_at: null });
        const symptomIds = allSymptoms.map(s => s._id);
        const totalQuestions = await Question.countDocuments({ symptom_id: { $in: symptomIds }, deleted_at: null });
        
        // Count user's answered questions
        const answeredQuestions = new Set(userAnswers.map(ua => String(ua.question_id))).size;
        
        console.log('📊 Completion Analysis:');
        console.log('   Total questions for disease:', totalQuestions);
        console.log('   User answered questions:', answeredQuestions);
        console.log('   Is complete:', totalQuestions > 0 && answeredQuestions === totalQuestions);

        // Test email sending
        console.log('\n📧 Testing completion email...');
        
        // Get detailed answers for email
        const detailedAnswers = await UsersAnswers.find({ user_id: user._id, deleted_at: null })
            .populate({
                path: 'question_id',
                populate: {
                    path: 'symptom_id',
                    model: 'Symptom',
                },
                model: 'Question',
            })
            .populate('answer_id');

        // Group answers by symptom
        const symptomMap = {};
        detailedAnswers.forEach(ua => {
            const symptom = ua.question_id?.symptom_id;
            if (!symptom) return;
            const symptomName = symptom.name || 'Unknown Symptom';
            if (!symptomMap[symptomName]) {
                symptomMap[symptomName] = [];
            }
            symptomMap[symptomName].push({
                question: ua.question_id?.question_text || 'Unknown Question',
                answer: ua.answer_id?.answer_text || 'N/A',
            });
        });

        console.log('📋 Symptom map created with', Object.keys(symptomMap).length, 'symptoms');

        // Send test completion email
        const { sendOnboardingCompletionEmail } = await import('./services/emailService.js');
        await sendOnboardingCompletionEmail(user.email, user.fullName, disease.name, symptomMap);
        
        console.log('✅ Completion email sent successfully!');
        console.log('📬 Check your inbox:', user.email);

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Full error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from database');
    }
}

debugCompletionEmail(); 