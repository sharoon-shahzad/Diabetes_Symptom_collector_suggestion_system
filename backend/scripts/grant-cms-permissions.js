/**
 * Grant CMS Permissions Script
 * 
 * This script grants Content Management System permissions to a user.
 * Run with: node scripts/grant-cms-permissions.js <email>
 * Example: node scripts/grant-cms-permissions.js zeeshanasghar1502@gmail.com
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

// Import models (using named exports)
import { User } from '../models/User.js';
import { Role } from '../models/Role.js';
import { Permission } from '../models/Permissions.js';
import { RolePermissions } from '../models/RolePermissions.js';
import { UsersRoles } from '../models/User_Role.js';

// CMS Permissions to grant
const CMS_PERMISSIONS = [
  'category:view:all',
  'category:create:all',
  'category:update:all',
  'category:delete:all',
  'content:view:all',
  'content:create:all',
  'content:update:all',
  'content:delete:all',
];

async function grantCMSPermissions(userEmail) {
  try {
    // Connect to database
    console.log('📡 Connecting to database...');
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MongoDB URI not found in environment variables');
    }
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to database\n');

    // Find user
    console.log(`🔍 Finding user: ${userEmail}`);
    const user = await User.findOne({ email: userEmail });
    
    if (!user) {
      console.error(`❌ User not found: ${userEmail}`);
      process.exit(1);
    }
    
    console.log(`✅ Found user: ${user.fullName} (${user.email})\n`);

    // Get or create user role
    let userRole = await Role.findOne({ role_name: 'user' });
    
    if (!userRole) {
      console.log('📝 Creating "user" role...');
      userRole = await Role.create({
        role_name: 'user'
      });
      console.log('✅ Created "user" role\n');
    }

    // Ensure user has the role
    const existingUserRole = await UsersRoles.findOne({
      user_id: user._id,
      role_id: userRole._id
    });
    
    if (!existingUserRole) {
      console.log('📝 Adding "user" role to user...');
      await UsersRoles.create({
        user_id: user._id,
        role_id: userRole._id
      });
      console.log('✅ Added "user" role\n');
    } else {
      console.log('✅ User already has "user" role\n');
    }

    // Process each CMS permission
    console.log('🔐 Processing CMS permissions...\n');
    let grantedCount = 0;
    let existingCount = 0;

    for (const permissionName of CMS_PERMISSIONS) {
      // Get or create permission
      let permission = await Permission.findOne({ name: permissionName });
      
      if (!permission) {
        console.log(`   📝 Creating permission: ${permissionName}`);
        
        // Parse permission name into resource:action:scope
        const [resource, action, scope] = permissionName.split(':');
        
        permission = await Permission.create({
          name: permissionName,
          description: `CMS permission: ${permissionName}`,
          resource: resource,
          action: action,
          scope: scope
        });
      }

      // Check if role already has this permission
      const existingRolePermission = await RolePermissions.findOne({
        role_id: userRole._id,
        permission_id: permission._id
      });

      if (!existingRolePermission) {
        await RolePermissions.create({
          role_id: userRole._id,
          permission_id: permission._id
        });
        console.log(`   ✅ Granted: ${permissionName}`);
        grantedCount++;
      } else {
        console.log(`   ⏭️  Already has: ${permissionName}`);
        existingCount++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 Summary:');
    console.log(`   ✅ Granted: ${grantedCount} new permissions`);
    console.log(`   ⏭️  Existing: ${existingCount} permissions`);
    console.log(`   📦 Total CMS permissions: ${CMS_PERMISSIONS.length}`);
    console.log('='.repeat(60));
    console.log('\n✨ Done! User can now access CMS features.');
    console.log('🔄 User may need to log out and log back in for changes to take effect.\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

// Get email from command line arguments
const userEmail = process.argv[2];

if (!userEmail) {
  console.error('❌ Error: Please provide a user email');
  console.log('\nUsage: node scripts/grant-cms-permissions.js <email>');
  console.log('Example: node scripts/grant-cms-permissions.js zeeshanasghar1502@gmail.com\n');
  process.exit(1);
}

// Run the script
grantCMSPermissions(userEmail);
