import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User } from './models/User.js';

dotenv.config();

async function resetUserOnboarding() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Get user email from command line argument
        const userEmail = process.argv[2];
        if (!userEmail) {
            console.log('❌ Please provide user email as argument');
            console.log('Usage: node reset-user-onboarding.js user@example.com');
            process.exit(1);
        }

        // Find and reset user's onboarding status
        const user = await User.findOne({ email: userEmail });
        if (!user) {
            console.log(`❌ User with email ${userEmail} not found`);
            process.exit(1);
        }

        console.log(`📧 Found user: ${user.fullName} (${user.email})`);
        console.log(`📊 Current onboarding status: ${user.onboardingCompleted}`);

        // Reset onboarding status
        await User.findByIdAndUpdate(user._id, {
            $unset: {
                onboardingCompleted: 1,
                onboardingCompletedAt: 1,
                diseaseDataSubmittedAt: 1,
                diseaseDataEditingExpiresAt: 1,
                diseaseDataStatus: 1
            }
        });

        console.log('✅ User onboarding status reset successfully');
        console.log('🔄 User can now complete onboarding again and receive the email');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('📡 Disconnected from MongoDB');
    }
}

resetUserOnboarding().catch(console.error);
