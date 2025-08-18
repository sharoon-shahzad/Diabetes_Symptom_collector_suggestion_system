import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    phone_number: {
        type: String,
    },
    whatsapp_number: {
        type: String,
    },
    date_of_birth: {
        type: Date,
    },
    gender: {
        type: String,
    },
    isActivated: {
        type: Boolean,
        default: false,
    },
    activationToken: {
        type: String,
    },
    activationTokenExpires: {
        type: Date,
    },
    refreshToken: {
        type: String,
    },
    resetPasswordToken: {
        type: String,
    },
    resetPasswordExpires: {
        type: Date,
    },
    deleted_at: {
        type: Date,
        default: null,
    },
    onboardingCompleted: {
        type: Boolean,
        default: false,
    },
    onboardingCompletedAt: {
        type: Date,
    },
    // New fields for disease data editing window
    diseaseDataSubmittedAt: {
        type: Date,
    },
    diseaseDataEditingExpiresAt: {
        type: Date,
    },
    diseaseDataStatus: {
        type: String,
        enum: ['draft', 'submitted'],
        default: 'draft',
    },
}, { timestamps: true });

// Add index for onboarding completion check
userSchema.index({ _id: 1, onboardingCompleted: 1 });

export const User = mongoose.model('User', userSchema);