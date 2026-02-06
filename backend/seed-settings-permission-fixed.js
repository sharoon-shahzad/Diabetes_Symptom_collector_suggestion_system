import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { Permission } from './models/Permissions.js';
import { RolePermissions } from './models/RolePermissions.js';
import { Role } from './models/Role.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB connected');
    } catch (err) {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    }
};

const seedSettingsPermission = async () => {
    await connectDB();
    
    try {
        console.log('\n🔐 Adding settings:manage:all permission...\n');
        
        // Check if permission already exists
        let permission = await Permission.findOne({ name: 'settings:manage:all' });
        
        if (permission) {
            console.log('⏭️  Permission "settings:manage:all" already exists');
            console.log(`   ID: ${permission._id}`);
            console.log(`   is_active: ${permission.is_active}`);
            console.log(`   deleted_at: ${permission.deleted_at || 'null'}`);
        } else {
            permission = await Permission.create({
                name: 'settings:manage:all',
                description: 'Full access to manage system-wide settings and configurations',
                resource: 'settings',
                action: 'manage',
                scope: 'all',
                is_active: true,
                deleted_at: null
            });
            console.log('✅ Created permission: "settings:manage:all"');
            console.log(`   ID: ${permission._id}`);
        }
        
        // Find super_admin role
        const superAdminRole = await Role.findOne({ role_name: 'super_admin' });
        
        if (!superAdminRole) {
            console.log('\n❌ super_admin role not found!');
            console.log('💡 Make sure roles are seeded first');
            return;
        }
        
        console.log(`\n✅ Found super_admin role`);
        console.log(`   ID: ${superAdminRole._id}`);
        
        // Check if already assigned
        const existingAssignment = await RolePermissions.findOne({
            role_id: superAdminRole._id,
            permission_id: permission._id
        });
        
        if (existingAssignment) {
            console.log('\n⏭️  Permission already assigned to super_admin');
            console.log(`   is_active: ${existingAssignment.is_active}`);
            console.log(`   deleted_at: ${existingAssignment.deleted_at || 'null'}`);
            
            // Make sure it's active and not deleted
            if (!existingAssignment.is_active || existingAssignment.deleted_at) {
                existingAssignment.is_active = true;
                existingAssignment.deleted_at = null;
                await existingAssignment.save();
                console.log('✅ Reactivated permission assignment');
            }
        } else {
            await RolePermissions.create({
                role_id: superAdminRole._id,
                permission_id: permission._id,
                is_active: true,
                deleted_at: null
            });
            console.log('\n✅ Assigned permission to super_admin role');
        }
        
        // Verify the assignment
        const verification = await RolePermissions.findOne({
            role_id: superAdminRole._id,
            permission_id: permission._id,
            is_active: true,
            deleted_at: null
        }).populate('permission_id').populate('role_id');
        
        if (verification) {
            console.log('\n✅ Verification successful:');
            console.log(`   Role: ${verification.role_id.role_name}`);
            console.log(`   Permission: ${verification.permission_id.name}`);
            console.log(`   Active: ${verification.is_active}`);
        }
        
        console.log('\n✅ Settings permission seeded successfully!');
        console.log('💡 Users with super_admin role can now access settings');
        
    } catch (error) {
        console.error('\n❌ Error seeding permission:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n✅ Disconnected from MongoDB\n');
    }
};

seedSettingsPermission();
