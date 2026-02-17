/**
 * Quick verification script - shows what's in the database
 * Run: node backend/scripts/verifyDatabase.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/diabetes_system');
    console.log('✅ Connected to MongoDB\n');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const LifestyleTipSchema = new mongoose.Schema({}, { collection: 'lifestyle_tips', strict: false });
const LifestyleTip = mongoose.model('LifestyleTip', LifestyleTipSchema);

const ExercisePlanSchema = new mongoose.Schema({}, { collection: 'exercise_plans', strict: false });
const ExercisePlan = mongoose.model('ExercisePlan', ExercisePlanSchema);

async function verifyDatabase() {
  try {
    await connectDB();
    
    console.log('📊 DATABASE VERIFICATION\n');
    console.log('=' .repeat(60));
    
    // Check lifestyle tips
    const tips = await LifestyleTip.find({});
    console.log(`\n🔍 Lifestyle Tips: ${tips.length} records`);
    if (tips.length > 0) {
      console.log('\n⚠️  WARNING: Found lifestyle tips in database:');
      tips.forEach((tip, idx) => {
        const categories = tip.categories || [];
        const categoryNames = categories.map(c => c.name).join(', ');
        console.log(`  ${idx + 1}. User: ${tip.user_id}`);
        console.log(`     Date: ${tip.target_date}`);
        console.log(`     Source: ${tip.source || 'unknown'}`);
        console.log(`     Categories: ${categoryNames}`);
        console.log(`     Region: ${tip.region}`);
        console.log('');
      });
    } else {
      console.log('   ✅ CLEAN - No lifestyle tips in database');
    }
    
    // Check exercise plans
    const plans = await ExercisePlan.find({});
    console.log(`\n🔍 Exercise Plans: ${plans.length} records`);
    if (plans.length > 0) {
      console.log('\n⚠️  WARNING: Found exercise plans in database:');
      plans.forEach((plan, idx) => {
        const sessions = plan.sessions || [];
        console.log(`  ${idx + 1}. User: ${plan.user_id}`);
        console.log(`     Date: ${plan.target_date}`);
        console.log(`     Sessions: ${sessions.length}`);
        console.log(`     Region: ${plan.region}`);
        console.log('');
      });
    } else {
      console.log('   ✅ CLEAN - No exercise plans in database');
    }
    
    console.log('\n' + '='.repeat(60));
    
    if (tips.length === 0 && plans.length === 0) {
      console.log('\n✅ ✅ ✅ DATABASE IS COMPLETELY CLEAN ✅ ✅ ✅');
      console.log('\n💡 If you still see old content:');
      console.log('   1. Hard refresh browser: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)');
      console.log('   2. Clear browser cache in Developer Tools (F12 → Application → Clear)');
      console.log('   3. Try incognito/private browsing mode');
      console.log('   4. Restart frontend dev server\n');
    } else {
      console.log('\n⚠️  Database contains old data. Run delete scripts:');
      console.log('   node backend/scripts/deleteAllLifestyleTips.js');
      console.log('   node backend/scripts/deleteAllExercisePlans.js\n');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

verifyDatabase();
