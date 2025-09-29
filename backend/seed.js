import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';

// Import models
import { User } from './models/User.js';
import { Role } from './models/Role.js';
import { Permission } from './models/Permissions.js';
import { RolePermissions } from './models/RolePermissions.js';
import { UsersRoles } from './models/User_Role.js';
import Category from './models/Category.js';
import Content from './models/Content.js';

dotenv.config();

const seedData = async () => {
  try {
    // Connect to database
    await connectDB();
    console.log('Connected to database');

    // Clear existing data (optional - be careful in production!)
    // await User.deleteMany({});
    // await Role.deleteMany({});
    // await Permissions.deleteMany({});
    // await Category.deleteMany({});
    // await Content.deleteMany({});

    // Create roles if they don't exist
    const roles = [
      { role_name: 'user' },
      { role_name: 'admin' },
      { role_name: 'super_admin' }
    ];

    const createdRoles = [];
    for (const roleData of roles) {
      let role = await Role.findOne({ role_name: roleData.role_name });
      if (!role) {
        role = new Role(roleData);
        await role.save();
        console.log(`Created role: ${role.role_name}`);
      } else {
        console.log(`Role already exists: ${role.role_name}`);
      }
      createdRoles.push(role);
    }

    // Find or create a super admin user for content authoring
    let adminUser = await User.findOne({ email: 'admin@diavise.com' });
    if (!adminUser) {
      adminUser = new User({
        fullName: 'DiaVise Admin',
        email: 'admin@diavise.com',
        password: 'admin123', // In production, this should be hashed
        isEmailVerified: true,
        status: 'active'
      });
      await adminUser.save();
      console.log('Created admin user');

      // Assign super_admin role to admin user
      const superAdminRole = createdRoles.find(r => r.role_name === 'super_admin');
      if (superAdminRole) {
        await UsersRoles.create({
          user_id: adminUser._id,
          role_id: superAdminRole._id
        });
        console.log('Assigned super_admin role to admin user');
      }
    }

    // Create sample categories
    const categories = [
      {
        name: 'Diabetes Management',
        slug: 'diabetes-management',
        description: 'Articles about managing diabetes effectively',
        color: '#1976d2',
        icon: 'local_hospital',
        isActive: true,
        createdBy: adminUser._id
      },
      {
        name: 'Nutrition & Diet',
        slug: 'nutrition-diet',
        description: 'Healthy eating tips and nutritional guidance',
        color: '#388e3c',
        icon: 'restaurant',
        isActive: true,
        createdBy: adminUser._id
      },
      {
        name: 'Exercise & Fitness',
        slug: 'exercise-fitness',
        description: 'Physical activity recommendations for diabetes',
        color: '#f57c00',
        icon: 'fitness_center',
        isActive: true,
        createdBy: adminUser._id
      },
      {
        name: 'Research & News',
        slug: 'research-news',
        description: 'Latest diabetes research and medical news',
        color: '#7b1fa2',
        icon: 'science',
        isActive: true,
        createdBy: adminUser._id
      }
    ];

    const createdCategories = [];
    for (const categoryData of categories) {
      const existingCategory = await Category.findOne({ slug: categoryData.slug });
      if (!existingCategory) {
        const category = new Category(categoryData);
        await category.save();
        createdCategories.push(category);
        console.log(`Created category: ${category.name}`);
      } else {
        createdCategories.push(existingCategory);
        console.log(`Category already exists: ${existingCategory.name}`);
      }
    }

    // Create sample blog content
    const sampleContent = [
      {
        title: 'Understanding Type 2 Diabetes: A Comprehensive Guide',
        slug: 'understanding-type-2-diabetes-comprehensive-guide',
        excerpt: 'Learn about the causes, symptoms, and management strategies for Type 2 diabetes. This comprehensive guide covers everything you need to know about this common condition.',
        content: `
          <h2>What is Type 2 Diabetes?</h2>
          <p>Type 2 diabetes is a chronic condition that affects how your body processes blood sugar (glucose). Unlike Type 1 diabetes, where the body doesn't produce insulin, Type 2 diabetes occurs when your body becomes resistant to insulin or doesn't produce enough insulin.</p>
          
          <h3>Common Symptoms</h3>
          <ul>
            <li>Increased thirst and frequent urination</li>
            <li>Unexplained weight loss</li>
            <li>Fatigue and weakness</li>
            <li>Blurred vision</li>
            <li>Slow-healing sores</li>
          </ul>
          
          <h3>Risk Factors</h3>
          <p>Several factors can increase your risk of developing Type 2 diabetes:</p>
          <ul>
            <li>Family history of diabetes</li>
            <li>Being overweight or obese</li>
            <li>Physical inactivity</li>
            <li>Age (45 or older)</li>
            <li>High blood pressure</li>
          </ul>
          
          <h3>Management Strategies</h3>
          <p>Managing Type 2 diabetes involves a combination of lifestyle changes and medical treatment:</p>
          <ol>
            <li><strong>Healthy Eating:</strong> Focus on whole grains, lean proteins, and plenty of vegetables</li>
            <li><strong>Regular Exercise:</strong> Aim for at least 150 minutes of moderate activity per week</li>
            <li><strong>Blood Sugar Monitoring:</strong> Keep track of your glucose levels</li>
            <li><strong>Medication:</strong> Take prescribed medications as directed</li>
          </ol>
        `,
        category: createdCategories[0]._id, // Diabetes Management
        tags: ['diabetes', 'type-2', 'management', 'health'],
        status: 'published',
        isFeatured: true,
        author: adminUser._id,
        featuredImage: {
          url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=400&fit=crop',
          alt: 'Diabetes management and monitoring'
        }
      },
      {
        title: 'The Best Foods for Diabetes: A Complete Nutrition Guide',
        slug: 'best-foods-diabetes-complete-nutrition-guide',
        excerpt: 'Discover the best foods to include in your diabetes-friendly diet. Learn about low-glycemic foods, portion control, and meal planning strategies.',
        content: `
          <h2>Diabetes-Friendly Foods</h2>
          <p>Choosing the right foods is crucial for managing diabetes effectively. Here are the best food categories to include in your diet:</p>
          
          <h3>Non-Starchy Vegetables</h3>
          <p>These vegetables are low in carbohydrates and calories but high in fiber and nutrients:</p>
          <ul>
            <li>Broccoli, cauliflower, and Brussels sprouts</li>
            <li>Leafy greens (spinach, kale, lettuce)</li>
            <li>Bell peppers and tomatoes</li>
            <li>Zucchini and cucumbers</li>
          </ul>
          
          <h3>Lean Proteins</h3>
          <p>Protein helps stabilize blood sugar levels and keeps you feeling full:</p>
          <ul>
            <li>Skinless chicken and turkey</li>
            <li>Fish (salmon, tuna, cod)</li>
            <li>Eggs and egg whites</li>
            <li>Legumes (beans, lentils, chickpeas)</li>
          </ul>
          
          <h3>Whole Grains</h3>
          <p>Choose whole grains over refined grains for better blood sugar control:</p>
          <ul>
            <li>Quinoa and brown rice</li>
            <li>Oatmeal and steel-cut oats</li>
            <li>Whole wheat bread and pasta</li>
            <li>Barley and bulgur</li>
          </ul>
          
          <h3>Healthy Fats</h3>
          <p>Include these heart-healthy fats in moderation:</p>
          <ul>
            <li>Avocados and olive oil</li>
            <li>Nuts and seeds</li>
            <li>Fatty fish</li>
            <li>Nut butters</li>
          </ul>
        `,
        category: createdCategories[1]._id, // Nutrition & Diet
        tags: ['nutrition', 'diet', 'food', 'diabetes'],
        status: 'published',
        isFeatured: true,
        author: adminUser._id,
        featuredImage: {
          url: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=400&fit=crop',
          alt: 'Healthy diabetes-friendly foods'
        }
      },
      {
        title: 'Exercise for Diabetes: The Ultimate Workout Guide',
        slug: 'exercise-diabetes-ultimate-workout-guide',
        excerpt: 'Learn how regular exercise can help manage diabetes and improve your overall health. Discover the best types of exercises and how to get started safely.',
        content: `
          <h2>Benefits of Exercise for Diabetes</h2>
          <p>Regular physical activity is one of the most important tools for managing diabetes. Exercise helps:</p>
          <ul>
            <li>Lower blood sugar levels</li>
            <li>Improve insulin sensitivity</li>
            <li>Reduce cardiovascular risk</li>
            <li>Help with weight management</li>
            <li>Boost energy levels</li>
          </ul>
          
          <h3>Types of Exercise</h3>
          
          <h4>Aerobic Exercise</h4>
          <p>Aim for at least 150 minutes of moderate-intensity aerobic activity per week:</p>
          <ul>
            <li>Walking or brisk walking</li>
            <li>Swimming</li>
            <li>Cycling</li>
            <li>Dancing</li>
            <li>Water aerobics</li>
          </ul>
          
          <h4>Strength Training</h4>
          <p>Include strength training exercises 2-3 times per week:</p>
          <ul>
            <li>Weight lifting</li>
            <li>Resistance band exercises</li>
            <li>Bodyweight exercises</li>
            <li>Yoga or Pilates</li>
          </ul>
          
          <h3>Getting Started Safely</h3>
          <p>Before starting any exercise program:</p>
          <ol>
            <li>Consult with your healthcare provider</li>
            <li>Start slowly and gradually increase intensity</li>
            <li>Monitor your blood sugar before and after exercise</li>
            <li>Stay hydrated</li>
            <li>Have a plan for treating low blood sugar</li>
          </ol>
        `,
        category: createdCategories[2]._id, // Exercise & Fitness
        tags: ['exercise', 'fitness', 'diabetes', 'workout'],
        status: 'published',
        isFeatured: false,
        author: adminUser._id,
        featuredImage: {
          url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop',
          alt: 'Exercise and fitness for diabetes management'
        }
      },
      {
        title: 'Latest Diabetes Research: Breakthrough Treatments and Technologies',
        slug: 'latest-diabetes-research-breakthrough-treatments-technologies',
        excerpt: 'Stay updated with the latest advances in diabetes research, including new treatments, technologies, and potential cures on the horizon.',
        content: `
          <h2>Recent Breakthroughs in Diabetes Research</h2>
          <p>The field of diabetes research is rapidly evolving, with new treatments and technologies emerging regularly. Here are some of the most promising developments:</p>
          
          <h3>Continuous Glucose Monitoring (CGM)</h3>
          <p>Advanced CGM systems now offer:</p>
          <ul>
            <li>Real-time glucose monitoring</li>
            <li>Predictive alerts for high and low blood sugar</li>
            <li>Integration with insulin pumps</li>
            <li>Improved accuracy and longer wear time</li>
          </ul>
          
          <h3>Artificial Pancreas Systems</h3>
          <p>Closed-loop insulin delivery systems are becoming more sophisticated:</p>
          <ul>
            <li>Automated insulin adjustment</li>
            <li>Better overnight glucose control</li>
            <li>Reduced hypoglycemia risk</li>
            <li>Improved quality of life</li>
          </ul>
          
          <h3>Stem Cell Research</h3>
          <p>Researchers are exploring stem cell therapies for diabetes:</p>
          <ul>
            <li>Beta cell replacement therapy</li>
            <li>Immune system modulation</li>
            <li>Potential for Type 1 diabetes treatment</li>
            <li>Ongoing clinical trials</li>
          </ul>
          
          <h3>Gene Therapy</h3>
          <p>Gene therapy approaches are being investigated for:</p>
          <ul>
            <li>Restoring insulin production</li>
            <li>Preventing autoimmune destruction</li>
            <li>Long-term treatment solutions</li>
            <li>Personalized medicine approaches</li>
          </ul>
        `,
        category: createdCategories[3]._id, // Research & News
        tags: ['research', 'technology', 'diabetes', 'treatment'],
        status: 'published',
        isFeatured: true,
        author: adminUser._id,
        featuredImage: {
          url: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800&h=400&fit=crop',
          alt: 'Diabetes research and technology'
        }
      },
      {
        title: 'Managing Diabetes During Holidays: Tips for Healthy Celebrations',
        slug: 'managing-diabetes-during-holidays-tips-healthy-celebrations',
        excerpt: 'Learn how to enjoy holiday celebrations while keeping your diabetes under control. Get practical tips for managing food, stress, and routine changes.',
        content: `
          <h2>Holiday Diabetes Management</h2>
          <p>Holidays can be challenging for people with diabetes due to changes in routine, increased food temptations, and stress. Here's how to navigate the season successfully:</p>
          
          <h3>Planning Ahead</h3>
          <ul>
            <li>Check your blood sugar more frequently</li>
            <li>Plan your meals and snacks</li>
            <li>Bring diabetes-friendly dishes to parties</li>
            <li>Inform hosts about your dietary needs</li>
          </ul>
          
          <h3>Smart Food Choices</h3>
          <p>Enjoy holiday foods while managing your blood sugar:</p>
          <ul>
            <li>Fill half your plate with non-starchy vegetables</li>
            <li>Choose lean proteins</li>
            <li>Limit high-carb foods</li>
            <li>Practice portion control</li>
            <li>Stay hydrated with water</li>
          </ul>
          
          <h3>Managing Stress</h3>
          <p>Holiday stress can affect blood sugar levels:</p>
          <ul>
            <li>Maintain your exercise routine</li>
            <li>Get adequate sleep</li>
            <li>Practice relaxation techniques</li>
            <li>Don't overcommit to activities</li>
          </ul>
        `,
        category: createdCategories[0]._id, // Diabetes Management
        tags: ['holidays', 'diabetes', 'management', 'lifestyle'],
        status: 'published',
        isFeatured: false,
        author: adminUser._id,
        featuredImage: {
          url: 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=800&h=400&fit=crop',
          alt: 'Holiday celebrations with diabetes management'
        }
      },
      {
        title: 'Understanding Blood Sugar Patterns: A Guide to Better Control',
        slug: 'understanding-blood-sugar-patterns-guide-better-control',
        excerpt: 'Learn how to interpret your blood sugar readings and identify patterns that can help you achieve better diabetes control.',
        content: `
          <h2>Blood Sugar Monitoring</h2>
          <p>Understanding your blood sugar patterns is key to effective diabetes management. Here's what you need to know:</p>
          
          <h3>Target Blood Sugar Ranges</h3>
          <ul>
            <li><strong>Before meals:</strong> 80-130 mg/dL</li>
            <li><strong>2 hours after meals:</strong> Less than 180 mg/dL</li>
            <li><strong>Bedtime:</strong> 100-140 mg/dL</li>
            <li><strong>A1C:</strong> Less than 7% (individual targets may vary)</li>
          </ul>
          
          <h3>Common Blood Sugar Patterns</h3>
          
          <h4>Dawn Phenomenon</h4>
          <p>Blood sugar rises in the early morning hours due to natural hormone release. This is normal but may need adjustment in medication timing.</p>
          
          <h4>Somogyi Effect</h4>
          <p>Blood sugar drops during the night, causing the body to release glucose-raising hormones, resulting in high morning readings.</p>
          
          <h4>Post-Meal Spikes</h4>
          <p>Blood sugar rises after eating. The goal is to minimize these spikes through food choices and timing.</p>
          
          <h3>Tracking and Analysis</h3>
          <p>Keep detailed records to identify patterns:</p>
          <ul>
            <li>Record blood sugar readings with times</li>
            <li>Note food intake and portion sizes</li>
            <li>Track physical activity</li>
            <li>Record medication timing and doses</li>
            <li>Note stress levels and sleep quality</li>
          </ul>
        `,
        category: createdCategories[0]._id, // Diabetes Management
        tags: ['blood-sugar', 'monitoring', 'patterns', 'control'],
        status: 'published',
        isFeatured: false,
        author: adminUser._id,
        featuredImage: {
          url: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800&h=400&fit=crop',
          alt: 'Blood sugar monitoring and patterns'
        }
      }
    ];

    // Create sample content
    for (const contentData of sampleContent) {
      const existingContent = await Content.findOne({ title: contentData.title });
      if (!existingContent) {
        const content = new Content(contentData);
        await content.save();
        console.log(`Created content: ${content.title}`);
      } else {
        console.log(`Content already exists: ${existingContent.title}`);
      }
    }

    console.log('Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

// Run seeding
seedData();