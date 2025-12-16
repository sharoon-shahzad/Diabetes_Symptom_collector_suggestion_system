import mongoose from 'mongoose';

const userMedicalInfoSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },
    diabetes_type: {
        type: String,
        enum: ['Type 1', 'Type 2', 'Gestational', 'Prediabetes', 'Other'],
    },
    diagnosis_date: {
        type: Date,
    },
    current_medications: [{
        medication_name: {
            type: String,
        },
        dosage: {
            type: String,
        },
        frequency: {
            type: String,
        },
    }],
    allergies: [{
        allergen: {
            type: String,
        },
        reaction: {
            type: String,
        },
    }],
    chronic_conditions: [{
        condition_name: {
            type: String,
        },
        diagnosed_date: {
            type: Date,
        },
    }],
    family_history: [{
        relation: {
            type: String,
        },
        condition: {
            type: String,
        },
    }],
    recent_lab_results: {
        hba1c: {
            value: {
                type: Number,
            },
            date: {
                type: Date,
            },
            unit: {
                type: String,
                default: '%',
            },
        },
        fasting_glucose: {
            value: {
                type: Number,
            },
            date: {
                type: Date,
            },
            unit: {
                type: String,
                default: 'mg/dL',
            },
        },
        cholesterol: {
            total: {
                type: Number,
            },
            ldl: {
                type: Number,
            },
            hdl: {
                type: Number,
            },
            date: {
                type: Date,
            },
            unit: {
                type: String,
                default: 'mg/dL',
            },
        },
    },
    blood_pressure: {
        systolic: {
            type: Number,
        },
        diastolic: {
            type: Number,
        },
        last_recorded: {
            type: Date,
        },
    },
    last_medical_checkup: {
        type: Date,
    },
}, { timestamps: true });

export const UserMedicalInfo = mongoose.model('UserMedicalInfo', userMedicalInfoSchema);
