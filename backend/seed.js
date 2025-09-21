import mongoose from 'mongoose';
import { Disease } from './models/Disease.js';
import { Symptom } from './models/Symptom.js';
import { Question } from './models/Question.js';
import { Role } from './models/Role.js';
import { UsersRoles } from './models/User_Role.js';
import { User } from './models/User.js';
import { Permission } from './models/Permissions.js';
import { RolePermissions } from './models/RolePermissions.js';
import Category from './models/Category.js';
import Content from './models/Content.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/Diavise';

// Model-aligned symptom set only (destructive seeding)
const symptomsData = [
  { name: 'Polyuria', description: 'Frequent urination', questions: [ { question_text: 'Do you experience frequent urination?', question_type: 'radio', options: ['Yes', 'No'] } ] },
  { name: 'Polydipsia', description: 'Excessive thirst', questions: [ { question_text: 'Do you feel excessive thirst?', question_type: 'radio', options: ['Yes', 'No'] } ] },
  { name: 'sudden weight loss', description: 'Unexplained weight loss', questions: [ { question_text: 'Have you had recent unexplained weight loss?', question_type: 'radio', options: ['Yes', 'No'] } ] },
  { name: 'weakness', description: 'General weakness/fatigue', questions: [ { question_text: 'Do you feel general weakness or fatigue?', question_type: 'radio', options: ['Yes', 'No'] } ] },
  { name: 'Polyphagia', description: 'Increased hunger', questions: [ { question_text: 'Do you experience increased hunger?', question_type: 'radio', options: ['Yes', 'No'] } ] },
  { name: 'Genital thrush', description: 'Genital yeast infections', questions: [ { question_text: 'Do you get frequent genital yeast infections?', question_type: 'radio', options: ['Yes', 'No'] } ] },
  { name: 'visual blurring', description: 'Blurred vision', questions: [ { question_text: 'Do you have blurred vision?', question_type: 'radio', options: ['Yes', 'No'] } ] },
  { name: 'Itching', description: 'Persistent itching', questions: [ { question_text: 'Do you have persistent itching?', question_type: 'radio', options: ['Yes', 'No'] } ] },
  { name: 'Irritability', description: 'Mood changes/irritability', questions: [ { question_text: 'Do you feel irritable or have mood changes?', question_type: 'radio', options: ['Yes', 'No'] } ] },
  { name: 'delayed healing', description: 'Slow wound healing', questions: [ { question_text: 'Do your wounds heal slowly?', question_type: 'radio', options: ['Yes', 'No'] } ] },
  { name: 'partial paresis', description: 'Muscle weakness', questions: [ { question_text: 'Do you have muscle weakness (partial paresis)?', question_type: 'radio', options: ['Yes', 'No'] } ] },
  { name: 'muscle stiffness', description: 'Muscle stiffness/cramps', questions: [ { question_text: 'Do you have muscle stiffness or cramps?', question_type: 'radio', options: ['Yes', 'No'] } ] },
  { name: 'Alopecia', description: 'Hair loss/thinning', questions: [ { question_text: 'Do you have hair loss or thinning (alopecia)?', question_type: 'radio', options: ['Yes', 'No'] } ] },
  {
    name: 'General Health',
    description: 'Basic profile inputs required by the model',
    questions: [
      { question_text: 'What is your age?', question_type: 'number' },
      { question_text: 'What is your biological sex?', question_type: 'dropdown', options: ['Male', 'Female'] },
      { question_text: 'Are you considered obese (BMI ≥ 30)?', question_type: 'radio', options: ['Yes', 'No'] },
    ],
  },
];

const permissionsData = [
  // Dashboard Permissions
  { name: "dashboard:access:patient", description: "Access patient dashboard", resource: "dashboard", action: "access", scope: "patient", category: "dashboard" },
  { name: "dashboard:access:doctor", description: "Access doctor/subadmin dashboard", resource: "dashboard", action: "access", scope: "doctor", category: "dashboard" },
  { name: "dashboard:access:admin", description: "Access superadmin dashboard", resource: "dashboard", action: "access", scope: "admin", category: "dashboard" },
  
  // Authentication & Profile Permissions
  { name: "profile:view:own", description: "View own profile", resource: "profile", action: "view", scope: "own", category: "profile" },
  { name: "profile:edit:own", description: "Edit own profile", resource: "profile", action: "edit", scope: "own", category: "profile" },
  { name: "password:change:own", description: "Change own password", resource: "password", action: "change", scope: "own", category: "profile" },
  
  // User Management Permissions
  { name: "user:create:all", description: "Create any type of user", resource: "user", action: "create", scope: "all", category: "user_management" },
  { name: "user:read:all", description: "View all users", resource: "user", action: "read", scope: "all", category: "user_management" },
  { name: "user:update:all", description: "Update any user", resource: "user", action: "update", scope: "all", category: "user_management" },
  { name: "user:delete:all", description: "Delete any user", resource: "user", action: "delete", scope: "all", category: "user_management" },
  { name: "user:read:assigned", description: "View assigned patients/users", resource: "user", action: "read", scope: "assigned", category: "user_management" },
  { name: "user:assign:patients", description: "Assign patients to doctors", resource: "user", action: "assign", scope: "patients", category: "user_management" },
  
  // Disease Data Permissions
  { name: "disease:view:own", description: "View own disease data", resource: "disease", action: "view", scope: "own", category: "medical_data" },
  { name: "disease:edit:own", description: "Edit own disease data (within 7 days)", resource: "disease", action: "edit", scope: "own", category: "medical_data" },
  { name: "disease:submit:own", description: "Submit own disease data", resource: "disease", action: "submit", scope: "own", category: "medical_data" },
  { name: "disease:view:assigned", description: "View assigned patients' disease data", resource: "disease", action: "view", scope: "assigned", category: "medical_data" },
  { name: "disease:edit:assigned", description: "Edit assigned patients' disease data", resource: "disease", action: "edit", scope: "assigned", category: "medical_data" },
  { name: "disease:view:all", description: "View all disease data", resource: "disease", action: "view", scope: "all", category: "medical_data" },
  { name: "disease:manage:all", description: "Manage all disease data", resource: "disease", action: "manage", scope: "all", category: "medical_data" },
  
  // Medical Content Management Permissions
  { name: "disease:create:all", description: "Create disease entries", resource: "disease", action: "create", scope: "all", category: "content_management" },
  { name: "disease:update:all", description: "Update disease entries", resource: "disease", action: "update", scope: "all", category: "content_management" },
  { name: "disease:delete:all", description: "Delete disease entries", resource: "disease", action: "delete", scope: "all", category: "content_management" },
  { name: "symptom:view:all", description: "View all symptoms", resource: "symptom", action: "view", scope: "all", category: "content_management" },
  { name: "symptom:create:all", description: "Create symptoms", resource: "symptom", action: "create", scope: "all", category: "content_management" },
  { name: "symptom:update:all", description: "Update symptoms", resource: "symptom", action: "update", scope: "all", category: "content_management" },
  { name: "symptom:delete:all", description: "Delete symptoms", resource: "symptom", action: "delete", scope: "all", category: "content_management" },
  { name: "question:view:all", description: "View all questions", resource: "question", action: "view", scope: "all", category: "content_management" },
  { name: "question:create:all", description: "Create questions", resource: "question", action: "create", scope: "all", category: "content_management" },
  { name: "question:update:all", description: "Update questions", resource: "question", action: "update", scope: "all", category: "content_management" },
  { name: "question:delete:all", description: "Delete questions", resource: "question", action: "delete", scope: "all", category: "content_management" },
  
  // Onboarding & Assessment Permissions
  { name: "onboarding:access:own", description: "Access onboarding process", resource: "onboarding", action: "access", scope: "own", category: "assessment" },
  { name: "answer:submit:own", description: "Submit answers to questions", resource: "answer", action: "submit", scope: "own", category: "assessment" },
  { name: "assessment:view:assigned", description: "View assigned patients' assessments", resource: "assessment", action: "view", scope: "assigned", category: "assessment" },
  
  // System Administration Permissions
  { name: "permission:manage:all", description: "Manage system permissions", resource: "permission", action: "manage", scope: "all", category: "system_admin" },
  { name: "role:manage:all", description: "Manage user roles", resource: "role", action: "manage", scope: "all", category: "system_admin" },
  { name: "settings:manage:all", description: "Manage system settings", resource: "settings", action: "manage", scope: "all", category: "system_admin" },
  { name: "submission:manage:all", description: "Manage user submissions", resource: "submission", action: "manage", scope: "all", category: "system_admin" },
  
  // CMS Permissions
  { name: "content:view:all", description: "View all content", resource: "content", action: "view", scope: "all", category: "cms" },
  { name: "content:create:all", description: "Create content", resource: "content", action: "create", scope: "all", category: "cms" },
  { name: "content:update:all", description: "Update content", resource: "content", action: "update", scope: "all", category: "cms" },
  { name: "content:delete:all", description: "Delete content", resource: "content", action: "delete", scope: "all", category: "cms" },
  { name: "category:view:all", description: "View all categories", resource: "category", action: "view", scope: "all", category: "cms" },
  { name: "category:create:all", description: "Create categories", resource: "category", action: "create", scope: "all", category: "cms" },
  { name: "category:update:all", description: "Update categories", resource: "category", action: "update", scope: "all", category: "cms" },
  { name: "category:delete:all", description: "Delete categories", resource: "category", action: "delete", scope: "all", category: "cms" }
];

// CMS Data
const categoriesData = [
  {
    name: 'Diet & Nutrition',
    description: 'Healthy eating habits and nutritional guidance for diabetes management',
    color: '#4caf50',
    icon: 'nutrition',
    isActive: true
  },
  {
    name: 'Exercise & Fitness',
    description: 'Physical activity recommendations and workout routines',
    color: '#2196f3',
    icon: 'exercise',
    isActive: true
  },
  {
    name: 'Medication & Treatment',
    description: 'Information about diabetes medications and treatment options',
    color: '#ff9800',
    icon: 'medication',
    isActive: true
  },
  {
    name: 'Research & Studies',
    description: 'Latest research findings and scientific studies on diabetes',
    color: '#9c27b0',
    icon: 'research',
    isActive: true
  },
  {
    name: 'Awareness & Education',
    description: 'Educational content to raise awareness about diabetes',
    color: '#f44336',
    icon: 'awareness',
    isActive: true
  },
  {
    name: 'Prevention',
    description: 'Tips and strategies for preventing diabetes',
    color: '#00bcd4',
    icon: 'prevention',
    isActive: true
  },
  {
    name: 'Lifestyle',
    description: 'General lifestyle tips for living well with diabetes',
    color: '#795548',
    icon: 'lifestyle',
    isActive: true
  },
  {
    name: 'Monitoring',
    description: 'Blood sugar monitoring and tracking techniques',
    color: '#607d8b',
    icon: 'monitoring',
    isActive: true
  }
];

const contentData = [
  {
    title: 'Understanding Type 2 Diabetes: A Comprehensive Guide',
    excerpt: 'Learn about the causes, symptoms, and management strategies for Type 2 diabetes. This comprehensive guide covers everything you need to know about living with diabetes.',
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
      <p>Managing Type 2 diabetes involves a combination of lifestyle changes, medication, and regular monitoring. Key strategies include:</p>
      <ul>
        <li>Maintaining a healthy diet</li>
        <li>Regular physical activity</li>
        <li>Blood sugar monitoring</li>
        <li>Medication adherence</li>
        <li>Regular healthcare checkups</li>
      </ul>
    `,
    categoryName: 'Awareness & Education',
    tags: ['diabetes', 'type 2', 'symptoms', 'management', 'health'],
    status: 'published',
    isFeatured: true,
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=400&fit=crop',
      alt: 'Diabetes awareness and education'
    },
    seo: {
      metaTitle: 'Understanding Type 2 Diabetes: Complete Guide',
      metaDescription: 'Comprehensive guide to Type 2 diabetes including symptoms, causes, and management strategies.',
      keywords: ['diabetes', 'type 2 diabetes', 'diabetes symptoms', 'diabetes management']
    }
  },
  {
    title: 'The Mediterranean Diet for Diabetes Management',
    excerpt: 'Discover how the Mediterranean diet can help manage blood sugar levels and improve overall health for people with diabetes.',
    content: `
      <h2>What is the Mediterranean Diet?</h2>
      <p>The Mediterranean diet is based on the traditional eating patterns of countries bordering the Mediterranean Sea. It emphasizes whole foods, healthy fats, and plant-based ingredients.</p>
      
      <h3>Key Components</h3>
      <ul>
        <li>Olive oil as the primary fat source</li>
        <li>Abundant fruits and vegetables</li>
        <li>Whole grains and legumes</li>
        <li>Fish and seafood</li>
        <li>Nuts and seeds</li>
        <li>Moderate amounts of dairy</li>
      </ul>
      
      <h3>Benefits for Diabetes</h3>
      <p>Research has shown that the Mediterranean diet can:</p>
      <ul>
        <li>Improve blood sugar control</li>
        <li>Reduce insulin resistance</li>
        <li>Lower cardiovascular risk</li>
        <li>Support weight management</li>
        <li>Reduce inflammation</li>
      </ul>
      
      <h3>Getting Started</h3>
      <p>To adopt the Mediterranean diet:</p>
      <ol>
        <li>Replace butter with olive oil</li>
        <li>Increase fish consumption to 2-3 times per week</li>
        <li>Add more vegetables to every meal</li>
        <li>Choose whole grains over refined grains</li>
        <li>Snack on nuts and fruits</li>
      </ol>
    `,
    categoryName: 'Diet & Nutrition',
    tags: ['mediterranean diet', 'nutrition', 'blood sugar', 'healthy eating', 'diabetes diet'],
    status: 'published',
    isFeatured: true,
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=400&fit=crop',
      alt: 'Mediterranean diet foods'
    },
    seo: {
      metaTitle: 'Mediterranean Diet for Diabetes: Benefits & Guide',
      metaDescription: 'Learn how the Mediterranean diet can help manage diabetes and improve blood sugar control.',
      keywords: ['mediterranean diet', 'diabetes diet', 'blood sugar control', 'healthy eating']
    }
  }
];

async function seedCMS(superAdminRole) {
  console.log('Seeding CMS data...');
  
  // Find a super admin user to use as the author
  const superAdminUser = await User.findOne({ 
    _id: { $in: await UsersRoles.find({ role_id: superAdminRole._id }).distinct('user_id') }
  });
  
  if (!superAdminUser) {
    console.log('No super admin user found for CMS seeding');
    return;
  }

  // Seed Categories
  console.log('Seeding categories...');
  const createdCategories = [];
  for (const categoryData of categoriesData) {
    const slug = categoryData.name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
    
    const category = await Category.findOneAndUpdate(
      { name: categoryData.name },
      {
        ...categoryData,
        slug,
        createdBy: superAdminUser._id
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    createdCategories.push(category);
    console.log(`Category upserted: ${category.name}`);
  }

  // Seed Content
  console.log('Seeding content...');
  for (const contentItem of contentData) {
    const slug = contentItem.title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
    
    const category = createdCategories.find(c => c.name === contentItem.categoryName);
    if (!category) {
      console.log(`Category not found for content: ${contentItem.title}`);
      continue;
    }
    
    await Content.findOneAndUpdate(
      { title: contentItem.title },
      {
        ...contentItem,
        slug,
        category: category._id,
        author: superAdminUser._id
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log(`Content upserted: ${contentItem.title}`);
  }
  
  console.log('CMS seeding completed!');
}

async function seed() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB');

  // Ensure super admin role exists (highest level)
  let superAdminRole = await Role.findOneAndUpdate(
    { role_name: 'super_admin' },
    { role_name: 'super_admin' },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  console.log('Super Admin role upserted:', superAdminRole.role_name);

  // Ensure admin role exists (middle level)
  let adminRole = await Role.findOneAndUpdate(
    { role_name: 'admin' },
    { role_name: 'admin' },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  console.log('Admin role upserted:', adminRole.role_name);

  // Ensure user role exists (lowest level)
  let userRole = await Role.findOneAndUpdate(
    { role_name: 'user' },
    { role_name: 'user' },
    { upsert: true, setDefaultsOnInsert: true }
  );
  console.log('User role upserted:', userRole.role_name);

  // Assign super admin role to the specified user
  const superAdminUserId = new mongoose.Types.ObjectId('68ab0c74aa28c0f991bb4dbe');
  const superAdminUserEmail = 'zeeshanasghar1502@gmail.com';
  const superAdminUser = await User.findOne({ _id: superAdminUserId, email: superAdminUserEmail });
  if (superAdminUser) {
    const alreadyAssigned = await UsersRoles.findOne({ user_id: superAdminUser._id, role_id: superAdminRole._id });
    if (!alreadyAssigned) {
      await UsersRoles.create({ user_id: superAdminUser._id, role_id: superAdminRole._id });
      console.log('Super Admin role assigned to user:', superAdminUser.email);
    } else {
      console.log('Super Admin role already assigned to user:', superAdminUser.email);
    }
  } else {
    console.log('Super Admin user not found, cannot assign super admin role.');
  }

  // Assign super admin role to Hassan Raza
  const hassanRazaUserId = new mongoose.Types.ObjectId('68ab208c0d25de55cec6bccb');
  const hassanRazaUserEmail = '221429@students.au.edu.pk';
  const hassanRazaUser = await User.findOne({ _id: hassanRazaUserId, email: hassanRazaUserEmail });
  if (hassanRazaUser) {
    const alreadyAssigned = await UsersRoles.findOne({ user_id: hassanRazaUser._id, role_id: superAdminRole._id });
    if (!alreadyAssigned) {
      await UsersRoles.create({ user_id: hassanRazaUser._id, role_id: superAdminRole._id });
      console.log('Super Admin role assigned to user:', hassanRazaUser.email);
    } else {
      console.log('Super Admin role already assigned to user:', hassanRazaUser.email);
    }
  } else {
    console.log('Hassan Raza user not found, cannot assign super admin role.');
  }

  // Assign admin role to the specified user only
  const adminUserId = new mongoose.Types.ObjectId('6889f16c6012be5f42a9a85b');
  const adminUserEmail = 'kpsharoon7@gmail.com'; // Legacy example; will be ignored if user not found
  const adminUser = await User.findOne({ _id: adminUserId, email: adminUserEmail });
  if (adminUser) {
    const alreadyAssigned = await UsersRoles.findOne({ user_id: adminUser._id, role_id: adminRole._id });
    if (!alreadyAssigned) {
      await UsersRoles.create({ user_id: adminUser._id, role_id: adminRole._id });
      console.log('Admin role assigned to user:', adminUser.email);
    } else {
      console.log('Admin role already assigned to user:', adminUser.email);
    }
  } else {
    console.log('Admin user not found, cannot assign admin role.');
  }

  // Assign user role to the specified user
  const normalUserId = '6880d502873514b36914e931';
  const normalUserEmail = '221465@students.au.edu.pk'; // Legacy example; superseded by explicit assignment below
  const normalUser = await User.findOne({ _id: normalUserId, email: normalUserEmail });
  if (normalUser) {
    const alreadyAssigned = await UsersRoles.findOne({ user_id: normalUser._id, role_id: userRole._id });
    if (!alreadyAssigned) {
      await UsersRoles.create({ user_id: normalUser._id, role_id: userRole._id });
      console.log('User role assigned to user:', normalUser.email);
    } else {
      console.log('User role already assigned to user:', normalUser.email);
    }
  } else {
    console.log('Normal user not found, cannot assign user role.');
  }

  // Explicit assignment: Make Sharoon (kpsharoon7@gmail.com) a super admin
  const sharoonSuperId = new mongoose.Types.ObjectId('68c7b7a09348b4f4a44ba09b');
  const sharoonSuperEmail = 'kpsharoon7@gmail.com';
  const sharoonSuperUser = await User.findOne({ _id: sharoonSuperId, email: sharoonSuperEmail });
  if (sharoonSuperUser) {
    const alreadyAssigned = await UsersRoles.findOne({ user_id: sharoonSuperUser._id, role_id: superAdminRole._id });
    if (!alreadyAssigned) {
      await UsersRoles.create({ user_id: sharoonSuperUser._id, role_id: superAdminRole._id });
      console.log('Super Admin role assigned to user:', sharoonSuperUser.email);
    } else {
      console.log('Super Admin role already assigned to user:', sharoonSuperUser.email);
    }
  } else {
    console.log('Specified super admin user not found (Sharoon).');
  }

  // Explicit assignment: Make 221465@students.au.edu.pk a regular user
  const sharoonUserId = new mongoose.Types.ObjectId('68c7b8059348b4f4a44ba09e');
  const sharoonUserEmail = '221465@students.au.edu.pk';
  const sharoonUser = await User.findOne({ _id: sharoonUserId, email: sharoonUserEmail });
  if (sharoonUser) {
    const alreadyAssigned = await UsersRoles.findOne({ user_id: sharoonUser._id, role_id: userRole._id });
    if (!alreadyAssigned) {
      await UsersRoles.create({ user_id: sharoonUser._id, role_id: userRole._id });
      console.log('User role assigned to user:', sharoonUser.email);
    } else {
      console.log('User role already assigned to user:', sharoonUser.email);
    }
  } else {
    console.log('Specified regular user not found (221465@students.au.edu.pk).');
  }

  // Assign user role to ALL existing users who don't have any roles yet
  console.log('Assigning user role to all users without roles...');
  const allUsers = await User.find({});
  for (const user of allUsers) {
    const hasAnyRole = await UsersRoles.findOne({ user_id: user._id });
    if (!hasAnyRole) {
      await UsersRoles.create({ user_id: user._id, role_id: userRole._id });
      console.log('User role assigned to user without roles:', user.email);
    }
  }

  // Upsert Diabetes Disease
  let disease = await Disease.findOneAndUpdate(
    { name: 'Diabetes' },
    {
      name: 'Diabetes',
      description: 'A chronic condition characterized by high levels of sugar (glucose) in the blood.',
      symptoms_description: 'Symptoms vary but commonly include excessive thirst, frequent urination, and unexplained weight loss.',
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  console.log('Disease upserted:', disease.name);

  // Destructive reset: remove all existing Diabetes symptoms and their questions
  const existingSymptoms = await Symptom.find({ disease_id: disease._id });
  const existingSymptomIds = existingSymptoms.map(s => s._id);
  if (existingSymptomIds.length) {
    await Question.deleteMany({ symptom_id: { $in: existingSymptomIds } });
    await Symptom.deleteMany({ _id: { $in: existingSymptomIds } });
    console.log('Cleared existing Diabetes symptoms and questions');
  }

  for (const symptomData of symptomsData) {
    // Upsert Symptom
    let symptom = await Symptom.findOneAndUpdate(
      { name: symptomData.name, disease_id: disease._id },
      {
        name: symptomData.name,
        description: symptomData.description,
        disease_id: disease._id,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log('Symptom upserted:', symptom.name);

    // Insert Questions for this Symptom
    for (const q of symptomData.questions) {
      await Question.findOneAndUpdate(
        { question_text: q.question_text, symptom_id: symptom._id },
        {
          question_text: q.question_text,
          category: '',
          symptom_id: symptom._id,
          question_type: q.question_type,
          options: q.options || [],
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      console.log('  Question upserted:', q.question_text);
    }
  }

  // Seed Permissions
  console.log('Seeding permissions...');
  for (const permData of permissionsData) {
    await Permission.findOneAndUpdate(
      { name: permData.name },
      permData,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log('  Permission upserted:', permData.name);
  }


  // Assign Permissions to Roles
  console.log('Assigning permissions to roles...');
  
  // Patient Role Permissions (using existing 'user' role as patient)
  const patientPermissions = [
    'dashboard:access:patient',
    'profile:view:own',
    'profile:edit:own', 
    'password:change:own',
    'disease:view:own',
    'disease:edit:own',
    'disease:submit:own',
    'disease:view:all',        // Allow users to view disease content for onboarding
    'symptom:view:all',        // Allow users to view symptoms for onboarding
    'question:view:all',       // Allow users to view questions for onboarding
    'onboarding:access:own',
    'answer:submit:own'
  ];
  
  // Admin Role Permissions (middle level access)
  const adminPermissions = [
    'dashboard:access:admin',
    'profile:view:own',
    'profile:edit:own',
    'password:change:own',
    'user:read:all',
    'user:update:all',
    'user:delete:all',
    'disease:view:all',
    'disease:edit:all',
    'disease:manage:all',
    'disease:create:all',
    'disease:update:all',
    'disease:delete:all',
    'symptom:view:all',
    'symptom:create:all',
    'symptom:update:all',
    'symptom:delete:all',
    'question:view:all',
    'question:create:all',
    'question:update:all',
    'question:delete:all',
    'assessment:view:assigned'
  ];
  
  // Superadmin Role Permissions (all permissions)
  const superadminPermissions = permissionsData.map(p => p.name);
  
  // Assign permissions to user role (patient)
  if (userRole) {
    console.log('Assigning permissions to user role (patient)...');
    for (const permName of patientPermissions) {
      const permission = await Permission.findOne({ name: permName });
      if (permission) {
        await RolePermissions.findOneAndUpdate(
          { role_id: userRole._id, permission_id: permission._id },
          { 
            role_id: userRole._id, 
            permission_id: permission._id,
            assigned_at: new Date()
          },
          { upsert: true, new: true }
        );
        console.log('  Assigned permission to user role:', permName);
      }
    }
  }
  
  // Assign permissions to admin role
  if (adminRole) {
    console.log('Assigning permissions to admin role...');
    for (const permName of adminPermissions) {
      const permission = await Permission.findOne({ name: permName });
      if (permission) {
        await RolePermissions.findOneAndUpdate(
          { role_id: adminRole._id, permission_id: permission._id },
          { 
            role_id: adminRole._id, 
            permission_id: permission._id,
            assigned_at: new Date()
          },
          { upsert: true, new: true }
        );
        console.log('  Assigned permission to admin role:', permName);
      }
    }
  }
  
  // Assign permissions to super admin role
  if (superAdminRole) {
    console.log('Assigning permissions to super admin role...');
    for (const permName of superadminPermissions) {
      const permission = await Permission.findOne({ name: permName });
      if (permission) {
        await RolePermissions.findOneAndUpdate(
          { role_id: superAdminRole._id, permission_id: permission._id },
          { 
            role_id: superAdminRole._id, 
            permission_id: permission._id,
            assigned_at: new Date()
          },
          { upsert: true, new: true }
        );
        console.log('  Assigned permission to super admin role:', permName);
      }
    }
  }

  // Seed CMS Data
  await seedCMS(superAdminRole);

  console.log('Seeding complete!');
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});