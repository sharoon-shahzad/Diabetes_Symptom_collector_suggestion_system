import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User } from './models/User.js';
import { UsersAnswers } from './models/Users_Answers.js';
import { Question } from './models/Question.js';
import { Symptom } from './models/Symptom.js';
import { Disease } from './models/Disease.js';

dotenv.config();

async function resetUserCompletion() {
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to database');

        // Get user by email
        const userEmail = '221360@students.au.edu.pk'; // Change this to your email
        const user = await User.findOne({ email: userEmail });
        
        if (!user) {
            console.log('❌ User not found');
            return;
        }

        console.log('👤 Found user:', {
            id: user._id,
            email: user.email,
            fullName: user.fullName,
            currentOnboardingStatus: user.onboardingCompleted
        });

        // Get user's current answers
        const currentAnswers = await UsersAnswers.find({ user_id: user._id, deleted_at: null });
        console.log('📝 Current answers count:', currentAnswers.length);

        if (currentAnswers.length === 0) {
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
        
        console.log('📊 Current status:');
        console.log('   Total questions for disease:', totalQuestions);
        console.log('   User answered questions:', currentAnswers.length);
        console.log('   Is complete:', totalQuestions > 0 && currentAnswers.length === totalQuestions);

        // Calculate how many answers to delete to leave exactly 4 questions remaining
        const answersToDelete = currentAnswers.length - 4;
        
        if (answersToDelete <= 0) {
            console.log('❌ User has 4 or fewer answers. Cannot delete more.');
            return;
        }

        console.log(`🗑️  Deleting ${answersToDelete} answers to leave 4 remaining...`);

        // Get the last N answers to delete (most recent ones)
        const answersToRemove = currentAnswers.slice(-answersToDelete);
        
        // Soft delete the selected answers
        for (const answer of answersToRemove) {
            await UsersAnswers.findByIdAndUpdate(answer._id, { 
                deleted_at: new Date() 
            });
        }

        // Reset user's onboarding completion status
        await User.findByIdAndUpdate(user._id, {
            onboardingCompleted: false,
            onboardingCompletedAt: null,
            diseaseDataSubmittedAt: null,
            diseaseDataEditingExpiresAt: null,
            diseaseDataStatus: 'draft'
        });

        // Verify the changes
        const updatedUser = await User.findById(user._id);
        const remainingAnswers = await UsersAnswers.find({ user_id: user._id, deleted_at: null });
        
        console.log('\n✅ Reset completed successfully!');
        console.log('👤 Updated user status:', {
            onboardingCompleted: updatedUser.onboardingCompleted,
            remainingAnswers: remainingAnswers.length
        });

        console.log('\n📋 Next steps:');
        console.log('1. Answer the remaining 4 questions through the application');
        console.log('2. The completion email should be triggered automatically');
        console.log('3. Check your inbox for the completion email');

        // Show which questions remain
        const remainingQuestionIds = remainingAnswers.map(ua => ua.question_id);
        const allQuestionIds = currentAnswers.map(ua => ua.question_id);
        const deletedQuestionIds = allQuestionIds.filter(id => !remainingQuestionIds.includes(id));
        
        console.log('\n📝 Questions that were deleted (you need to answer these again):');
        for (const questionId of deletedQuestionIds) {
            const question = await Question.findById(questionId);
            if (question) {
                console.log(`   - ${question.question_text}`);
            }
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Full error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from database');
    }
}

resetUserCompletion(); 