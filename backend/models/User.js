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
    country: {
        type: String,
        required: false,
        trim: true,
    },
    country_code: {
        type: String,
        trim: true,
    },
    whatsapp_number: {
        type: String,
    },
    isActivated: {
        type: Boolean,
        default: false,
    },
    diabetes_diagnosed: {
        type: String,
        enum: ['yes', 'no', null],
        default: null, // null means not yet answered
    },
    diabetes_diagnosed_answered_at: {
        type: Date,
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