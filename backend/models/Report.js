import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    generated_on: { type: Date, required: true },
    summary: { type: String },
    risk_score: { type: Number },
    deleted_at: { type: Date, default: null },
}, { timestamps: true });

export const Report = mongoose.model("Report", reportSchema); 