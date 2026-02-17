/**
 * Script to delete ALL lifestyle tips from the database
 * Use this to clear out any old tips with fallback content
 * Run: node backend/scripts/deleteAllLifestyleTips.js
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
const LifestyleTipSchema = new mongoose.Schema({}, { collection: 'lifestyle_tips', strict: false });
const LifestyleTip = mongoose.model('LifestyleTip', LifestyleTipSchema);

async function deleteAllLifestyleTips() {
  try {
    await connectDB();
    
    console.log('🗑️  Fetching all lifestyle tips...');
    const allTips = await LifestyleTip.find({});
    console.log(`📊 Found ${allTips.length} lifestyle tips in database`);
    
    if (allTips.length > 0) {
      console.log('\n📝 Listing all tips to be deleted:');
      allTips.forEach((tip, idx) => {
        console.log(`  ${idx + 1}. User: ${tip.user_id}, Date: ${tip.target_date}, Categories: ${tip.categories?.length || 0}, Source: ${tip.source || 'unknown'}`);
      });
    }
    
    if (allTips.length === 0) {
      console.log('✅ No lifestyle tips to delete');
      console.log('💡 Database is already clean!');
      process.exit(0);
    }
    
    console.log('\n⚠️  DELETING ALL LIFESTYLE TIPS NOW...');
    console.log('⚠️  This will remove all tips including AI-generated ones!');
    console.log('⚠️  Press Ctrl+C within 3 seconds to cancel...\n');
    
    // Wait 3 seconds
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('🗑️  Deleting all lifestyle tips...');
    const result = await LifestyleTip.deleteMany({});
    
    console.log(`\n✅ Successfully deleted ${result.deletedCount} lifestyle tips`);
    console.log('✅ Database cleared! You can now test fresh AI generation.');
    console.log('💡 Please refresh your browser to clear any cached data.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error deleting lifestyle tips:', error);
    process.exit(1);
  }
}

// Run the script
deleteAllLifestyleTips();
