/**
 * Script to delete ALL exercise plans from the database
 * Use this to clear out any old plans with fallback content
 * Run: node backend/scripts/deleteAllExercisePlans.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Mongoose connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/diabetes_system', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Import model
const ExercisePlanSchema = new mongoose.Schema({}, { collection: 'exercise_plans', strict: false });
const ExercisePlan = mongoose.model('ExercisePlan', ExercisePlanSchema);

async function deleteAllExercisePlans() {
  try {
    await connectDB();
    
    console.log('🗑️  Fetching all exercise plans...');
    const count = await ExercisePlan.countDocuments();
    console.log(`📊 Found ${count} exercise plans in database`);
    
    if (count === 0) {
      console.log('✅ No exercise plans to delete');
      process.exit(0);
    }
    
    console.log('⚠️  Are you sure you want to delete ALL exercise plans?');
    console.log('⚠️  This will remove all plans including AI-generated ones!');
    console.log('⚠️  Press Ctrl+C to cancel, or wait 5 seconds to proceed...\n');
    
    // Wait 5 seconds
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('🗑️  Deleting all exercise plans...');
    const result = await ExercisePlan.deleteMany({});
    
    console.log(`✅ Successfully deleted ${result.deletedCount} exercise plans`);
    console.log('✅ Database cleared! You can now test fresh AI generation.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error deleting exercise plans:', error);
    process.exit(1);
  }
}

// Run the script
deleteAllExercisePlans();
