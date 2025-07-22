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
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);