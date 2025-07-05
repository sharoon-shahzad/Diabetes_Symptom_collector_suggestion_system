



import mongoose from 'mongoose';

const userActionSchema = new mongoose.Schema({
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        action: {
            type: String,
        }
},{timestamps:true});

export const UserAction = mongoose.model('UserAction', userActionSchema);