import mongoose from 'mongoose';
import { Disease } from './models/Disease.js';
import { Symptom } from './models/Symptom.js';
import { Question } from './models/Question.js';
import { Role } from './models/Role.js';
import { UsersRoles } from './models/User_Role.js';
import { User } from './models/User.js';
import { Permission } from './models/Permissions.js';
import { RolePermissions } from './models/RolePermissions.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/Diavise';

const symptomsData = [
  {
    name: 'Frequent Urination (Polyuria)',
    description: 'Passing urine more often than usual, especially at night, due to excess glucose pulling fluid from the body.',
    questions: [
      { question_text: 'Do you urinate more than 7 times during the day?', question_type: 'radio', options: ['Yes', 'No'] },
      { question_text: 'Do you often wake up at night to urinate?', question_type: 'dropdown', options: ['Never', 'Sometimes', 'Often', 'Every night'] },
      { question_text: 'Have you noticed an increase in the volume of urine passed recently?', question_type: 'radio', options: ['Yes', 'No'] },
      { question_text: 'Do you feel a strong urge to urinate frequently, even when little comes out?', question_type: 'radio', options: ['Yes', 'No'] },
    ],
  },
  {
    name: 'Excessive Thirst (Polydipsia)',
    description: 'Constant or abnormal thirst caused by fluid loss from excessive urination.',
    questions: [
      { question_text: 'Do you feel thirsty more frequently than usual?', question_type: 'radio', options: ['Yes', 'No'] },
      { question_text: 'Are you drinking more water than usual in a day?', question_type: 'dropdown', options: ['Less than 1L', '1–2L', '2–4L', 'More than 4L'] },
      { question_text: 'Does your mouth often feel dry even after drinking water?', question_type: 'radio', options: ['Yes', 'No'] },
      { question_text: 'Does drinking water not seem to satisfy your thirst?', question_type: 'radio', options: ['Yes', 'No'] },
    ],
  },
  {
    name: 'Increased Hunger (Polyphagia)',
    description: 'Intense hunger caused by the body\'s inability to properly use glucose for energy.',
    questions: [
      { question_text: 'Do you feel hungry even after eating a full meal?', question_type: 'radio', options: ['Yes', 'No'] },
      { question_text: 'Have you experienced frequent cravings for sweets or snacks recently?', question_type: 'radio', options: ['Yes', 'No'] },
      { question_text: 'Do you eat more meals per day than you used to?', question_type: 'dropdown', options: ['Fewer than 3', '3', 'More than 3'] },
      { question_text: 'Have you gained weight due to increased eating in the past 2 months?', question_type: 'radio', options: ['Yes', 'No'] },
    ],
  },
  {
    name: 'Unexplained Weight Loss',
    description: 'Weight loss despite normal or increased appetite; usually due to glucose loss through urine.',
    questions: [
      { question_text: 'Have you lost weight without dieting or exercising recently?', question_type: 'radio', options: ['Yes', 'No'] },
      { question_text: 'How much weight have you lost in the past 2 months?', question_type: 'dropdown', options: ['None', '1–2 kg', '3–5 kg', '5+ kg'] },
      { question_text: 'Do your clothes feel looser recently even though your eating habits are unchanged?', question_type: 'radio', options: ['Yes', 'No'] },
    ],
  },
  {
    name: 'Fatigue / Tiredness',
    description: 'Constant low energy due to cells not receiving glucose properly.',
    questions: [
      { question_text: 'Do you feel tired most of the day despite sleeping well?', question_type: 'radio', options: ['Yes', 'No'] },
      { question_text: 'Does physical activity exhaust you more than usual?', question_type: 'radio', options: ['Yes', 'No'] },
      { question_text: 'Do you feel tired soon after waking up?', question_type: 'radio', options: ['Yes', 'No'] },
    ],
  },
  {
    name: 'Blurred Vision',
    description: 'High blood sugar causes fluid to be pulled from eye lenses, affecting focus.',
    questions: [
      { question_text: 'Have you experienced any blurriness in your vision recently?', question_type: 'radio', options: ['Yes', 'No'] },
      { question_text: 'Does your vision fluctuate throughout the day?', question_type: 'radio', options: ['Yes', 'No'] },
      { question_text: 'Do you need to rub your eyes often or strain to focus?', question_type: 'radio', options: ['Yes', 'No'] },
    ],
  },
  {
    name: 'Slow Healing Wounds',
    description: 'High glucose levels interfere with blood flow and immune response, delaying healing.',
    questions: [
      { question_text: 'Do your cuts or wounds take longer than usual to heal?', question_type: 'radio', options: ['Yes', 'No'] },
      { question_text: 'Do you currently have any wound/injury that has not healed for more than 10 days?', question_type: 'radio', options: ['Yes', 'No'] },
    ],
  },
  {
    name: 'Frequent Infections',
    description: 'Weakened immune function increases susceptibility to bacterial and fungal infections.',
    questions: [
      { question_text: 'Do you experience frequent skin, gum, or urinary tract infections?', question_type: 'radio', options: ['Yes', 'No'] },
      { question_text: 'Have you had 2 or more infections in the last 3 months?', question_type: 'radio', options: ['Yes', 'No'] },
    ],
  },
  {
    name: 'Numbness or Tingling (Neuropathy)',
    description: 'Nerve damage from prolonged high blood sugar causes loss of sensation.',
    questions: [
      { question_text: 'Do you feel tingling or “pins and needles” in your feet or hands?', question_type: 'radio', options: ['Yes', 'No'] },
      { question_text: 'Do you experience numbness or loss of sensation in your feet while walking?', question_type: 'radio', options: ['Yes', 'No'] },
      { question_text: 'Has the sensation in your limbs changed recently?', question_type: 'radio', options: ['Yes', 'No'] },
    ],
  },
  {
    name: 'Very Dry Skin',
    description: 'Dehydration caused by frequent urination and poor circulation may dry out skin.',
    questions: [
      { question_text: 'Is your skin dry even after moisturizing or drinking fluids?', question_type: 'radio', options: ['Yes', 'No'] },
      { question_text: 'Do you have cracks, flakes, or itching due to dry skin?', question_type: 'radio', options: ['Yes', 'No'] },
    ],
  },
  {
    name: 'Nausea / Vomiting / Abdominal Pain',
    description: 'In Type 1 diabetes, especially during diabetic ketoacidosis (DKA), stomach pain and nausea can occur.',
    questions: [
      { question_text: 'Do you experience unexplained nausea or stomach pain frequently?', question_type: 'radio', options: ['Yes', 'No'] },
      { question_text: 'Have you vomited without an identifiable cause in the past week?', question_type: 'radio', options: ['Yes', 'No'] },
    ],
  },
  {
    name: 'Fruity-Smelling Breath',
    description: 'A hallmark sign of diabetic ketoacidosis (DKA), common in unmanaged Type 1 diabetes.',
    questions: [
      { question_text: 'Have you ever noticed a fruity or sweet smell in your breath?', question_type: 'radio', options: ['Yes', 'No'] },
      { question_text: 'Have others commented on a strange smell from your mouth recently?', question_type: 'radio', options: ['Yes', 'No'] },
    ],
  },
  // Non-symptom categories as symptoms for seeding
  {
    name: 'General Health',
    description: 'Basic user profile data and physiological info.',
    questions: [
      { question_text: 'What is your age?', question_type: 'number' },
      { question_text: 'What is your biological sex?', question_type: 'dropdown', options: ['Male', 'Female', 'Other'] },
      { question_text: 'Are you currently pregnant?', question_type: 'radio', options: ['Yes', 'No'] },
      { question_text: 'Have you had diabetes during pregnancy (gestational diabetes)?', question_type: 'radio', options: ['Yes', 'No'] },
    ],
  },
  {
    name: 'Family History',
    description: 'Genetic risk factor assessment.',
    questions: [
      { question_text: 'Does your mother, father, or sibling have diabetes?', question_type: 'radio', options: ['Yes', 'No'] },
      { question_text: 'Does diabetes run in your extended family (grandparents, uncles/aunts)?', question_type: 'radio', options: ['Yes', 'No'] },
    ],
  },
  {
    name: 'Lifestyle & Habits',
    description: 'Behavior-based risk factors related to diet and activity.',
    questions: [
      { question_text: 'Do you engage in physical activity at least 3 times per week?', question_type: 'radio', options: ['Yes', 'No'] },
      { question_text: 'How often do you consume sugary drinks?', question_type: 'dropdown', options: ['Daily', 'Weekly', 'Rarely', 'Never'] },
      { question_text: 'How many hours do you sleep on average per night?', question_type: 'dropdown', options: ['Less than 4', '4–6', '6–8', 'More than 8'] },
      { question_text: 'Do you smoke or use tobacco products?', question_type: 'radio', options: ['Yes', 'No'] },
    ],
  },
  {
    name: 'Medical Background',
    description: 'Pre-existing conditions and medical triggers.',
    questions: [
      { question_text: 'Have you ever been diagnosed with high blood pressure?', question_type: 'radio', options: ['Yes', 'No'] },
      { question_text: 'Have you been told you have high cholesterol or triglycerides?', question_type: 'radio', options: ['Yes', 'No'] },
      { question_text: 'Have you been diagnosed with insulin resistance or prediabetes?', question_type: 'radio', options: ['Yes', 'No'] },
      { question_text: 'Are you taking medications that affect blood sugar (e.g., steroids)?', question_type: 'radio', options: ['Yes', 'No'] },
      { question_text: 'Have you been hospitalized due to very high blood sugar?', question_type: 'radio', options: ['Yes', 'No'] },
      { question_text: 'For females: Have you been diagnosed with PCOS?', question_type: 'radio', options: ['Yes', 'No'] },
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
  { name: "submission:manage:all", description: "Manage user submissions", resource: "submission", action: "manage", scope: "all", category: "system_admin" }
];

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
  const superAdminUserId = new mongoose.Types.ObjectId('687f6de1cb1f9bb7047216e9');
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
  const adminUserEmail = 'kpsharoon7@gmail.com'; // Change this to your admin email
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
  const normalUserEmail = '221465@students.au.edu.pk'; // Change this to your normal user email
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

  console.log('Seeding complete!');
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});