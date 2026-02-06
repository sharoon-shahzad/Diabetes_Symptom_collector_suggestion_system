/**
 * Reset Permissions Script
 * 
 * This script:
 * 1. Removes ALL existing permissions
 * 2. Creates ONLY the permissions actually used in the system
 * 3. Automatically assigns ALL permissions to super_admin role
 * 
 * Run with: node scripts/reset-permissions.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

import { Permission } from '../models/Permissions.js';
import { Role } from '../models/Role.js';
import { RolePermissions } from '../models/RolePermissions.js';

// ONLY permissions actually used in your routes
const ACTUAL_PERMISSIONS = [
  // User Management (from userRoutes.js)
  {
    name: 'user:read:all',
    description: 'View all users in the system',
    resource: 'user',
    action: 'read',
    scope: 'all'
  },
  {
    name: 'user:update:all',
    description: 'Update any user profile or settings',
    resource: 'user',
    action: 'update',
    scope: 'all'
  },
  {
    name: 'user:delete:all',
    description: 'Delete any user from the system',
    resource: 'user',
    action: 'delete',
    scope: 'all'
  },

  // Role Management (from userRoutes.js & roleRoutes.js)
  {
    name: 'role:manage:all',
    description: 'Manage roles, permissions, and user role assignments',
    resource: 'role',
    action: 'manage',
    scope: 'all'
  },

  // Permission Management (from permissionRoutes.js)
  {
    name: 'permission:manage:all',
    description: 'View and manage system permissions',
    resource: 'permission',
    action: 'manage',
    scope: 'all'
  },

  // Disease Management - Admin (from diseaseRoutes.js)
  {
    name: 'disease:create:all',
    description: 'Create new disease types in the system',
    resource: 'disease',
    action: 'create',
    scope: 'all'
  },
  {
    name: 'disease:update:all',
    description: 'Update existing disease information',
    resource: 'disease',
    action: 'update',
    scope: 'all'
  },
  {
    name: 'disease:delete:all',
    description: 'Delete disease types from the system',
    resource: 'disease',
    action: 'delete',
    scope: 'all'
  },

  // Disease Data - User Own (from userRoutes.js & assessmentRoutes.js)
  {
    name: 'disease:view:own',
    description: 'View own disease assessment data and results',
    resource: 'disease',
    action: 'view',
    scope: 'own'
  },
  {
    name: 'disease:edit:own',
    description: 'Edit own disease data and answers',
    resource: 'disease',
    action: 'edit',
    scope: 'own'
  },
  {
    name: 'disease:submit:own',
    description: 'Submit disease assessment data',
    resource: 'disease',
    action: 'submit',
    scope: 'own'
  },

  // Symptom Management (from symptomRoutes.js)
  {
    name: 'symptom:view:all',
    description: 'View all symptoms for diseases',
    resource: 'symptom',
    action: 'view',
    scope: 'all'
  },
  {
    name: 'symptom:create:all',
    description: 'Create new symptoms for diseases',
    resource: 'symptom',
    action: 'create',
    scope: 'all'
  },
  {
    name: 'symptom:update:all',
    description: 'Update existing symptom information',
    resource: 'symptom',
    action: 'update',
    scope: 'all'
  },
  {
    name: 'symptom:delete:all',
    description: 'Delete symptoms from the system',
    resource: 'symptom',
    action: 'delete',
    scope: 'all'
  },

  // Question Management (from questionRoutes.js)
  {
    name: 'question:view:all',
    description: 'View all assessment questions',
    resource: 'question',
    action: 'view',
    scope: 'all'
  },
  {
    name: 'question:create:all',
    description: 'Create new assessment questions',
    resource: 'question',
    action: 'create',
    scope: 'all'
  },
  {
    name: 'question:update:all',
    description: 'Update existing questions',
    resource: 'question',
    action: 'update',
    scope: 'all'
  },
  {
    name: 'question:delete:all',
    description: 'Delete questions from the system',
    resource: 'question',
    action: 'delete',
    scope: 'all'
  },

  // Answer Submission (from questionRoutes.js)
  {
    name: 'answer:submit:own',
    description: 'Submit answers to assessment questions',
    resource: 'answer',
    action: 'submit',
    scope: 'own'
  },

  // Onboarding (from questionRoutes.js)
  {
    name: 'onboarding:access:own',
    description: 'Access onboarding process and view questions/symptoms',
    resource: 'onboarding',
    action: 'access',
    scope: 'own'
  },
  {
    name: 'onboarding:complete:own',
    description: 'Mark onboarding process as complete',
    resource: 'onboarding',
    action: 'complete',
    scope: 'own'
  },

  // Category Management (from categoryRoutes.js)
  {
    name: 'category:view:all',
    description: 'View all content categories',
    resource: 'category',
    action: 'view',
    scope: 'all'
  },
  {
    name: 'category:create:all',
    description: 'Create new content categories',
    resource: 'category',
    action: 'create',
    scope: 'all'
  },
  {
    name: 'category:update:all',
    description: 'Update existing categories',
    resource: 'category',
    action: 'update',
    scope: 'all'
  },
  {
    name: 'category:delete:all',
    description: 'Delete categories from the system',
    resource: 'category',
    action: 'delete',
    scope: 'all'
  },

  // Content Management (from contentRoutes.js)
  {
    name: 'content:view:all',
    description: 'View all content and statistics',
    resource: 'content',
    action: 'view',
    scope: 'all'
  },
  {
    name: 'content:create:all',
    description: 'Create new educational content',
    resource: 'content',
    action: 'create',
    scope: 'all'
  },
  {
    name: 'content:update:all',
    description: 'Update and review content',
    resource: 'content',
    action: 'update',
    scope: 'all'
  },
  {
    name: 'content:delete:all',
    description: 'Delete content from the system',
    resource: 'content',
    action: 'delete',
    scope: 'all'
  }
];

async function resetPermissions() {
  try {
    console.log('📡 Connecting to database...');
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MongoDB URI not found in environment variables');
    }
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to database\n');

    // Step 1: Delete ALL existing permissions and role-permission assignments
    console.log('🗑️  Removing all existing permissions...');
    await RolePermissions.deleteMany({});
    await Permission.deleteMany({});
    console.log('✅ Cleared all permissions and assignments\n');

    // Step 2: Create new permissions
    console.log('🔐 Creating actual system permissions...\n');
    const createdPermissions = [];
    
    for (const permData of ACTUAL_PERMISSIONS) {
      const permission = await Permission.create({
        ...permData,
        is_active: true,
        deleted_at: null
      });
      createdPermissions.push(permission);
      console.log(`   ✅ Created: ${permData.name}`);
    }

    console.log(`\n✅ Created ${createdPermissions.length} permissions\n`);

    // Step 3: Find super_admin role
    console.log('👑 Finding super_admin role...');
    let superAdminRole = await Role.findOne({ role_name: 'super_admin' });
    
    if (!superAdminRole) {
      console.log('📝 Creating super_admin role...');
      superAdminRole = await Role.create({
        role_name: 'super_admin',
        description: 'Super Administrator with full system access'
      });
      console.log('✅ Created super_admin role');
    } else {
      console.log('✅ Found super_admin role');
    }

    // Step 4: Assign ALL permissions to super_admin
    console.log('\n🎯 Assigning ALL permissions to super_admin...\n');
    let assignedCount = 0;

    for (const permission of createdPermissions) {
      await RolePermissions.create({
        role_id: superAdminRole._id,
        permission_id: permission._id,
        is_active: true
      });
      console.log(`   ✅ Assigned: ${permission.name}`);
      assignedCount++;
    }

    console.log('\n' + '='.repeat(70));
    console.log('📊 SUMMARY:');
    console.log(`   🗑️  Deleted: ALL old permissions`);
    console.log(`   ✅ Created: ${createdPermissions.length} new permissions`);
    console.log(`   👑 Assigned: ${assignedCount} permissions to super_admin`);
    console.log(`   📝 Super Admin now has: 100% of system permissions`);
    console.log('='.repeat(70));
    console.log('\n✨ Done! Permission system reset complete.\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

resetPermissions();
