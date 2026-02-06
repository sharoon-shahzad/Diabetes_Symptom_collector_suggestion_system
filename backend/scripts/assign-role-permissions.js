/**
 * Assign Permissions to User and Admin Roles
 * 
 * This script assigns appropriate permissions to:
 * - user role: Basic permissions for regular users
 * - admin role: Most permissions except role/permission management
 * 
 * Run with: node scripts/assign-role-permissions.js
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

// Permissions for USER role (basic user permissions)
const USER_PERMISSIONS = [
  // View own disease data
  'disease:view:own',
  'disease:edit:own',
  'disease:submit:own',
  
  // Submit answers and complete onboarding
  'answer:submit:own',
  'onboarding:access:own',
  'onboarding:complete:own',
  
  // View symptoms and questions during onboarding
  'symptom:view:all',
  'question:view:all',
  
  // View content and categories (educational content)
  'category:view:all',
  'content:view:all'
];

// Permissions for ADMIN role (most permissions except super admin only ones)
const ADMIN_PERMISSIONS = [
  // User management
  'user:read:all',
  'user:update:all',
  'user:delete:all',
  
  // Disease management
  'disease:create:all',
  'disease:update:all',
  'disease:delete:all',
  'disease:view:own',
  'disease:edit:own',
  'disease:submit:own',
  
  // Symptom management
  'symptom:view:all',
  'symptom:create:all',
  'symptom:update:all',
  'symptom:delete:all',
  
  // Question management
  'question:view:all',
  'question:create:all',
  'question:update:all',
  'question:delete:all',
  
  // Answer submission
  'answer:submit:own',
  
  // Onboarding
  'onboarding:access:own',
  'onboarding:complete:own',
  
  // Category management
  'category:view:all',
  'category:create:all',
  'category:update:all',
  'category:delete:all',
  
  // Content management
  'content:view:all',
  'content:create:all',
  'content:update:all',
  'content:delete:all'
  
  // NOTE: role:manage:all and permission:manage:all are ONLY for super_admin
];

async function assignRolePermissions() {
  try {
    console.log('📡 Connecting to database...');
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MongoDB URI not found in environment variables');
    }
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to database\n');

    // Find or create USER role
    console.log('👤 Setting up USER role...');
    let userRole = await Role.findOne({ role_name: 'user' });
    
    if (!userRole) {
      console.log('📝 Creating user role...');
      userRole = await Role.create({
        role_name: 'user',
        description: 'Regular user with basic permissions'
      });
      console.log('✅ Created user role');
    } else {
      console.log('✅ Found user role');
      // Clear existing permissions for user role
      await RolePermissions.deleteMany({ role_id: userRole._id });
      console.log('🗑️  Cleared existing user permissions');
    }

    // Find or create ADMIN role
    console.log('\n👨‍💼 Setting up ADMIN role...');
    let adminRole = await Role.findOne({ role_name: 'admin' });
    
    if (!adminRole) {
      console.log('📝 Creating admin role...');
      adminRole = await Role.create({
        role_name: 'admin',
        description: 'Administrator with extensive permissions'
      });
      console.log('✅ Created admin role');
    } else {
      console.log('✅ Found admin role');
      // Clear existing permissions for admin role
      await RolePermissions.deleteMany({ role_id: adminRole._id });
      console.log('🗑️  Cleared existing admin permissions');
    }

    // Assign permissions to USER role
    console.log('\n🎯 Assigning permissions to USER role...\n');
    let userAssignedCount = 0;

    for (const permName of USER_PERMISSIONS) {
      const permission = await Permission.findOne({ name: permName });
      
      if (permission) {
        await RolePermissions.create({
          role_id: userRole._id,
          permission_id: permission._id,
          is_active: true
        });
        console.log(`   ✅ User: ${permName}`);
        userAssignedCount++;
      } else {
        console.log(`   ⚠️  Not found: ${permName}`);
      }
    }

    // Assign permissions to ADMIN role
    console.log('\n🎯 Assigning permissions to ADMIN role...\n');
    let adminAssignedCount = 0;

    for (const permName of ADMIN_PERMISSIONS) {
      const permission = await Permission.findOne({ name: permName });
      
      if (permission) {
        await RolePermissions.create({
          role_id: adminRole._id,
          permission_id: permission._id,
          is_active: true
        });
        console.log(`   ✅ Admin: ${permName}`);
        adminAssignedCount++;
      } else {
        console.log(`   ⚠️  Not found: ${permName}`);
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log('📊 SUMMARY:');
    console.log(`   👤 USER role: ${userAssignedCount}/${USER_PERMISSIONS.length} permissions`);
    console.log(`   👨‍💼 ADMIN role: ${adminAssignedCount}/${ADMIN_PERMISSIONS.length} permissions`);
    console.log(`   👑 SUPER_ADMIN role: Already has all 30 permissions`);
    console.log('\n📝 Permission Breakdown:');
    console.log(`   • USER: Basic access (view own data, submit assessments, view content)`);
    console.log(`   • ADMIN: Full management (users, diseases, content, symptoms, questions)`);
    console.log(`   • SUPER_ADMIN: Everything + role/permission management`);
    console.log('='.repeat(70));
    console.log('\n✨ Done! All roles now have appropriate permissions.\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

assignRolePermissions();
