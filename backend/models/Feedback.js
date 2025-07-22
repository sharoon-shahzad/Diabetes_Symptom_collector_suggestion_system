import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    rating: { type: Number, required: true },
    comment: { type: String },
    submitted_on: { type: Date, required: true },
    deleted_at: { type: Date, default: null },
}, { timestamps: true });

export const Feedback = mongoose.model("Feedback", feedbackSchema); 