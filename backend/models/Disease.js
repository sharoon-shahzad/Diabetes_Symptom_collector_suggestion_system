import mongoose from "mongoose";

const diseaseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
        required: true,
    },
} , {timestamps: true})
export const Disease = mongoose.model("Disease", diseaseSchema);