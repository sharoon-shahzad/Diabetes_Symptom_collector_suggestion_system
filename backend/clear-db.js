import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Disease from './models/Disease.js';
import Symptom from './models/Symptom.js';
import Question from './models/Question.js';
import Answer from './models/Answer.js';
import { connectDB } from './config/db.js';

// Load env vars
dotenv.config();

dotenv.config();

const clearCollections = async () => {
    try {
        // Connect to database
        await connectDB();
        console.log('Connected to database...');

        // Clear all collections
        await Disease.deleteMany({});
        console.log('Cleared Disease collection');

        await Symptom.deleteMany({});
        console.log('Cleared Symptom collection');

        await Question.deleteMany({});
        console.log('Cleared Question collection');

        await Answer.deleteMany({});
        console.log('Cleared Answer collection');

        console.log('All collections cleared successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error clearing collections:', error.message);
        console.error('Full error:', error);
        process.exit(1);
    }
};

clearCollections();