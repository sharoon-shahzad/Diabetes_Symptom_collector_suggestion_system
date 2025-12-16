import mongoose from 'mongoose';

const userPersonalInfoSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },
    date_of_birth: {
        type: Date,
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
    },
    height: {
        type: Number, // in cm
    },
    weight: {
        type: Number, // in kg
    },
    activity_level: {
        type: String,
        enum: ['Sedentary', 'Lightly Active', 'Moderately Active', 'Very Active', 'Extremely Active'],
    },
    dietary_preference: {
        type: String,
        enum: ['Vegetarian', 'Non-Vegetarian', 'Vegan', 'Pescatarian', 'Other'],
    },
    smoking_status: {
        type: String,
        enum: ['Never', 'Former', 'Current'],
    },
    alcohol_use: {
        type: String,
        enum: ['Never', 'Occasional', 'Regular'],
    },
    sleep_hours: {
        type: Number, // average hours per night
    },
    emergency_contact: {
        name: {
            type: String,
        },
        phone: {
            type: String,
        },
        relationship: {
            type: String,
        },
    },
    address: {
        street: {
            type: String,
        },
        city: {
            type: String,
        },
        state: {
            type: String,
        },
        zip_code: {
            type: String,
        },
        country: {
            type: String,
        },
    },
}, { timestamps: true });

export const UserPersonalInfo = mongoose.model('UserPersonalInfo', userPersonalInfoSchema);
