



import mongoose from 'mongoose';

const userActionSchema = new mongoose.Schema({
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        role: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Role',
            required: true,
        },
        action: {
            type: String,
            required: true,
            enum: ['create', 'update', 'delete', 'view'],
        },
        action_timestamp: {
            type: Date,
            default: Date.now,
        },
},{timestamps:true});

export const UserAction = mongoose.model('UserAction', userActionSchema);