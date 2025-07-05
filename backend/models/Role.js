


import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    role_type: {
        type: String,
        enum: ['admin', 'doctor', 'patient'],
        default: 'user',
    },
    description: {
        type: String,
        required: true,
    },
} ,{timestamps:true});

export const Role = mongoose.model('Role', roleSchema);