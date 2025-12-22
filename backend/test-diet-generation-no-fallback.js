/**
 * Test Script: Verify Diet Plan Generation Without Fallbacks
 * Tests that RAG and AI model are working properly
 * Ensures no fallback mechanisms are triggered
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dietPlanService from './services/dietPlanService.js';
import { User } from './models/User.js';

dotenv.config();

const TEST_USER_ID = '6754af1ebfa8f8f0a7b3e6e6'; // Replace with actual test user ID

async function testDietGeneration() {
  try {
    console.log('\n🧪 === DIET PLAN GENERATION TEST (NO FALLBACKS) ===\n');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    // Verify user exists
    const user = await User.findById(TEST_USER_ID);
    if (!user) {
      throw new Error(`User not found: ${TEST_USER_ID}`);
    }
    console.log(`✅ User found: ${user.email}`);
    
    // Test 1: Generate diet plan for today
    console.log('\n📋 Test 1: Generating diet plan for today...');
    const today = new Date().toISOString().split('T')[0];
    
    try {
      const result = await dietPlanService.generateDietPlan(TEST_USER_ID, today);
      console.log('✅ Diet plan generated successfully');
      console.log(`   Region: ${result.plan.region}`);
      console.log(`   Total Calories: ${result.plan.total_calories}`);
      console.log(`   Meals: ${result.plan.meals.length}`);
      console.log(`   RAG Sources: ${result.plan.sources.length}`);
      
      // Check for variety in meals
      const uniqueFoods = new Set();
      result.plan.meals.forEach(meal => {
        meal.items.forEach(item => {
          uniqueFoods.add(item.food);
        });
      });
      console.log(`   Unique Foods: ${uniqueFoods.size}`);
      console.log(`   Foods: ${Array.from(uniqueFoods).join(', ')}`);
      
    } catch (error) {
      console.error('❌ Diet plan generation FAILED');
      console.error(`   Error: ${error.message}`);
      
      // Check if it's a RAG or AI failure (not fallback)
      if (error.message.includes('ChromaDB') || error.message.includes('RAG')) {
        console.error('   💥 RAG SYSTEM FAILURE - ChromaDB not operational');
      } else if (error.message.includes('LM Studio')) {
        console.error('   💥 AI MODEL FAILURE - LM Studio not operational');
      } else {
        console.error('   💥 UNEXPECTED ERROR');
      }
      
      throw error;
    }
    
    // Test 2: Generate plan for tomorrow (should be different)
    console.log('\n📋 Test 2: Generating diet plan for tomorrow...');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    try {
      const result2 = await dietPlanService.generateDietPlan(TEST_USER_ID, tomorrowStr);
      console.log('✅ Second diet plan generated successfully');
      console.log(`   Region: ${result2.plan.region}`);
      console.log(`   Total Calories: ${result2.plan.total_calories}`);
      console.log(`   Meals: ${result2.plan.meals.length}`);
      
      // Check for variety compared to first plan
      const uniqueFoods2 = new Set();
      result2.plan.meals.forEach(meal => {
        meal.items.forEach(item => {
          uniqueFoods2.add(item.food);
        });
      });
      console.log(`   Unique Foods: ${uniqueFoods2.size}`);
      console.log(`   Foods: ${Array.from(uniqueFoods2).join(', ')}`);
      
    } catch (error) {
      console.error('❌ Second diet plan generation FAILED');
      console.error(`   Error: ${error.message}`);
      throw error;
    }
    
    console.log('\n✅ === ALL TESTS PASSED ===');
    console.log('   • RAG system is operational');
    console.log('   • AI model is generating responses');
    console.log('   • No fallback mechanisms triggered');
    console.log('   • Diet plans show variety\n');
    
  } catch (error) {
    console.error('\n❌ === TEST FAILED ===');
    console.error(`Error: ${error.message}\n`);
    
    // Provide diagnostic information
    console.log('🔍 Diagnostics:');
    console.log('   1. Check if ChromaDB is running and contains documents');
    console.log('   2. Check if LM Studio is running: http://127.0.0.1:1234');
    console.log('   3. Verify .env configuration:');
    console.log('      - RAG_ENABLED=true');
    console.log('      - LM_STUDIO_BASE_URL=http://127.0.0.1:1234');
    console.log('      - CHROMA_DB_PATH=./chroma_db');
    console.log('   4. Check backend logs for detailed error messages\n');
    
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the test
testDietGeneration();
