

import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/diabetes_symptom_collector');
        console.log("Connected to MongoDB");
    } catch (error) {
        console.log( 'MongoDB connection error:', error);
        process.exit(1);
    }
}

