import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({

    name: {
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
        required: true,
    },
    whatsapp_number: {
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
    }
    
} , {timestamps:true}); 

export const User = mongoose.model('User', userSchema);
