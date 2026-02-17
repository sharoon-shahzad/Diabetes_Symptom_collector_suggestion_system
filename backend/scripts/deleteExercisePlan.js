import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Exercise Plan Schema
const ExercisePlanSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  target_date: { type: Date, required: true },
  region: String,
  sessions: Array,
  totals: Object,
  sources: Array,
  tips: Array,
  status: String,
  generated_at: Date
}, { timestamps: true });

const ExercisePlan = mongoose.model('ExercisePlan', ExercisePlanSchema);

async function deleteExercisePlanForToday() {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // List all existing plans first
    console.log('\n📋 Existing exercise plans:');
    const allPlans = await ExercisePlan.find().select('user_id target_date region generated_at');
    allPlans.forEach(plan => {
      console.log(`  - Date: ${plan.target_date.toISOString()}, Region: ${plan.region}, Generated: ${plan.generated_at}`);
    });
    console.log(`  Total: ${allPlans.length} plans\n`);

    // Delete all plans for 2026-02-06 (using multiple date formats to be thorough)
    const targetDate = '2026-02-06';
    
    // Method 1: Delete by date string match
    const result1 = await ExercisePlan.deleteMany({
      target_date: {
        $gte: new Date('2026-02-06T00:00:00.000Z'),
        $lt: new Date('2026-02-07T00:00:00.000Z')
      }
    });
    
    console.log(`✅ Deleted ${result1.deletedCount} plan(s) for ${targetDate}`);

    // Show remaining plans
    const remaining = await ExercisePlan.countDocuments();
    console.log(`📊 Total exercise plans remaining in database: ${remaining}`);
    
    if (remaining > 0) {
      console.log('\n📋 Remaining plans:');
      const remainingPlans = await ExercisePlan.find().select('user_id target_date region');
      remainingPlans.forEach(plan => {
        console.log(`  - Date: ${plan.target_date.toISOString()}`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

deleteExercisePlanForToday();
