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
    date_of_birth: {
        type: Date,
        required: true,
    },
    gender: {
        type: String,
        required: true,
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
    }
}, {timestamps:true}); 

export const User = mongoose.model('User', userSchema);
