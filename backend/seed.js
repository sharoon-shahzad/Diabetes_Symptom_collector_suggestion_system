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

  console.log('Seeding complete!');
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});