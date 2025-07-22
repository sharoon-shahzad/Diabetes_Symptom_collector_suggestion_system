import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
    question_text: { type: String, required: true },
    category: { type: String },
    symptom_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Symptom",
        required: true,
    },
    question_type: {
        type: String,
        enum: [
            'radio', 'checkbox', 'number', 'text', 'dropdown', 'textarea', 'date', 'file', 'email', 'password', 'range', 'time', 'datetime-local', 'color', 'tel', 'url'
        ],
        required: true,
    },
    options: [{ type: String }], // Only for radio, checkbox, dropdown
    deleted_at: { type: Date, default: null },
}, { timestamps: true });

export const Question = mongoose.model("Question", questionSchema); 