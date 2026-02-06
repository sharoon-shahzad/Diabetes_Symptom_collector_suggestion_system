/**
 * Seed All Permissions Script
 * 
 * This script creates ALL permissions used across the application
 * Run with: node scripts/seed-all-permissions.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

// Import models
import { Permission } from '../models/Permissions.js';

// Complete list of ALL permissions used in the application
const ALL_PERMISSIONS = [
  // User Management Permissions
  {
    name: 'user:read:all',
    description: 'View all users in the system',
    resource: 'user',
    action: 'read',
    scope: 'all',
    category: 'user_management'
  },
  {
    name: 'user:update:all',
    description: 'Update any user in the system',
    resource: 'user',
    action: 'update',
    scope: 'all',
    category: 'user_management'
  },
  {
    name: 'user:delete:all',
    description: 'Delete any user in the system',
    resource: 'user',
    action: 'delete',
    scope: 'all',
    category: 'user_management'
  },

  // Role Management Permissions
  {
    name: 'role:manage:all',
    description: 'Full access to manage roles and role permissions',
    resource: 'role',
    action: 'manage',
    scope: 'all',
    category: 'role_management'
  },

  // Permission Management Permissions
  {
    name: 'permission:manage:all',
    description: 'Full access to manage permissions',
    resource: 'permission',
    action: 'manage',
    scope: 'all',
    category: 'permission_management'
  },

  // Category Management Permissions (CMS)
  {
    name: 'category:view:all',
    description: 'View all categories',
    resource: 'category',
    action: 'view',
    scope: 'all',
    category: 'content_management'
  },
  {
    name: 'category:create:all',
    description: 'Create new categories',
    resource: 'category',
    action: 'create',
    scope: 'all',
    category: 'content_management'
  },
  {
    name: 'category:update:all',
    description: 'Update existing categories',
    resource: 'category',
    action: 'update',
    scope: 'all',
    category: 'content_management'
  },
  {
    name: 'category:delete:all',
    description: 'Delete categories',
    resource: 'category',
    action: 'delete',
    scope: 'all',
    category: 'content_management'
  },

  // Content Management Permissions (CMS)
  {
    name: 'content:view:all',
    description: 'View all content and content statistics',
    resource: 'content',
    action: 'view',
    scope: 'all',
    category: 'content_management'
  },
  {
    name: 'content:create:all',
    description: 'Create new content',
    resource: 'content',
    action: 'create',
    scope: 'all',
    category: 'content_management'
  },
  {
    name: 'content:update:all',
    description: 'Update and review content',
    resource: 'content',
    action: 'update',
    scope: 'all',
    category: 'content_management'
  },
  {
    name: 'content:delete:all',
    description: 'Delete content',
    resource: 'content',
    action: 'delete',
    scope: 'all',
    category: 'content_management'
  },

  // Disease Management Permissions
  {
    name: 'disease:view:own',
    description: 'View own disease data and assessments',
    resource: 'disease',
    action: 'view',
    scope: 'own',
    category: 'disease_management'
  },
  {
    name: 'disease:edit:own',
    description: 'Edit own disease data',
    resource: 'disease',
    action: 'edit',
    scope: 'own',
    category: 'disease_management'
  },
  {
    name: 'disease:submit:own',
    description: 'Submit disease assessment data',
    resource: 'disease',
    action: 'submit',
    scope: 'own',
    category: 'disease_management'
  },
  {
    name: 'disease:create:all',
    description: 'Create new disease types (Admin)',
    resource: 'disease',
    action: 'create',
    scope: 'all',
    category: 'disease_management'
  },
  {
    name: 'disease:update:all',
    description: 'Update disease types (Admin)',
    resource: 'disease',
    action: 'update',
    scope: 'all',
    category: 'disease_management'
  },
  {
    name: 'disease:delete:all',
    description: 'Delete disease types (Admin)',
    resource: 'disease',
    action: 'delete',
    scope: 'all',
    category: 'disease_management'
  },

  // Symptom Management Permissions
  {
    name: 'symptom:create:all',
    description: 'Create new symptoms for diseases',
    resource: 'symptom',
    action: 'create',
    scope: 'all',
    category: 'symptom_management'
  },
  {
    name: 'symptom:update:all',
    description: 'Update existing symptoms',
    resource: 'symptom',
    action: 'update',
    scope: 'all',
    category: 'symptom_management'
  },
  {
    name: 'symptom:delete:all',
    description: 'Delete symptoms',
    resource: 'symptom',
    action: 'delete',
    scope: 'all',
    category: 'symptom_management'
  },

  // Question Management Permissions
  {
    name: 'question:create:all',
    description: 'Create new questions for symptoms',
    resource: 'question',
    action: 'create',
    scope: 'all',
    category: 'question_management'
  },
  {
    name: 'question:update:all',
    description: 'Update existing questions',
    resource: 'question',
    action: 'update',
    scope: 'all',
    category: 'question_management'
  },
  {
    name: 'question:delete:all',
    description: 'Delete questions',
    resource: 'question',
    action: 'delete',
    scope: 'all',
    category: 'question_management'
  },

  // Answer Submission Permissions
  {
    name: 'answer:submit:own',
    description: 'Submit answers to assessment questions',
    resource: 'answer',
    action: 'submit',
    scope: 'own',
    category: 'assessment'
  },

  // Onboarding Permissions
  {
    name: 'onboarding:complete:own',
    description: 'Complete onboarding process',
    resource: 'onboarding',
    action: 'complete',
    scope: 'own',
    category: 'onboarding'
  },

  // Audit Log Permissions (if you have audit functionality)
  {
    name: 'audit:view:all',
    description: 'View all audit logs',
    resource: 'audit',
    action: 'view',
    scope: 'all',
    category: 'system_administration'
  },

  // Feedback Management Permissions
  {
    name: 'feedback:view:all',
    description: 'View all user feedback',
    resource: 'feedback',
    action: 'view',
    scope: 'all',
    category: 'feedback_management'
  },
  {
    name: 'feedback:submit:own',
    description: 'Submit feedback',
    resource: 'feedback',
    action: 'submit',
    scope: 'own',
    category: 'feedback_management'
  },
  {
    name: 'feedback:respond:all',
    description: 'Respond to user feedback',
    resource: 'feedback',
    action: 'respond',
    scope: 'all',
    category: 'feedback_management'
  },

  // Analytics/Dashboard Permissions
  {
    name: 'dashboard:view:all',
    description: 'View admin dashboard and analytics',
    resource: 'dashboard',
    action: 'view',
    scope: 'all',
    category: 'analytics'
  },
  {
    name: 'analytics:view:all',
    description: 'View detailed analytics and reports',
    resource: 'analytics',
    action: 'view',
    scope: 'all',
    category: 'analytics'
  }
];

async function seedPermissions() {
  try {
    console.log('📡 Connecting to database...');
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MongoDB URI not found in environment variables');
    }
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to database\n');

    console.log('🔐 Seeding permissions...\n');
    
    let createdCount = 0;
    let existingCount = 0;
    let updatedCount = 0;

    for (const permData of ALL_PERMISSIONS) {
      const existing = await Permission.findOne({ name: permData.name });
      
      if (!existing) {
        await Permission.create({
          ...permData,
          is_active: true,
          deleted_at: null
        });
        console.log(`   ✅ Created: ${permData.name}`);
        createdCount++;
      } else {
        // Update existing permission with new description/category if changed
        const updated = await Permission.findByIdAndUpdate(
          existing._id,
          {
            description: permData.description,
            category: permData.category,
            resource: permData.resource,
            action: permData.action,
            scope: permData.scope,
            is_active: true
          },
          { new: true }
        );
        
        if (existing.description !== permData.description || existing.category !== permData.category) {
          console.log(`   🔄 Updated: ${permData.name}`);
          updatedCount++;
        } else {
          console.log(`   ⏭️  Exists: ${permData.name}`);
          existingCount++;
        }
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 Summary:');
    console.log(`   ✅ Created: ${createdCount} new permissions`);
    console.log(`   🔄 Updated: ${updatedCount} permissions`);
    console.log(`   ⏭️  Unchanged: ${existingCount} permissions`);
    console.log(`   📦 Total permissions: ${ALL_PERMISSIONS.length}`);
    console.log('='.repeat(60));
    console.log('\n✨ Done! All permissions have been seeded.\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

// Run the script
seedPermissions();
