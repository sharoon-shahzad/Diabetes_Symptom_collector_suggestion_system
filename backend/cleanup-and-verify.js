import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { Permission } from './models/Permissions.js';
import { RolePermissions } from './models/RolePermissions.js';
import { Role } from './models/Role.js';
import { UsersRoles } from './models/User_Role.js';
import { User } from './models/User.js';

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

const cleanupAndVerify = async () => {
    await connectDB();
    
    try {
        console.log('\n🧹 Cleaning up duplicate/broken permissions...\n');
        
        // Delete the undefined permission
        const deletedUndefined = await Permission.deleteMany({ 
            $or: [
                { name: { $exists: false } },
                { name: null },
                { name: 'undefined' },
                { name: '' }
            ]
        });
        
        console.log(`🗑️  Deleted ${deletedUndefined.deletedCount} broken permission(s)\n`);
        
        // Verify settings:manage:all exists and is correct
        const settingsPermission = await Permission.findOne({ name: 'settings:manage:all' });
        
        if (!settingsPermission) {
            console.log('❌ settings:manage:all permission not found!');
            return;
        }
        
        console.log('✅ settings:manage:all permission exists');
        console.log(`   ID: ${settingsPermission._id}\n`);
        
        // Find super_admin role
        const superAdminRole = await Role.findOne({ role_name: 'super_admin' });
        
        if (!superAdminRole) {
            console.log('❌ super_admin role not found!');
            return;
        }
        
        console.log('✅ super_admin role found');
        console.log(`   ID: ${superAdminRole._id}\n`);
        
        // Check permission assignment
        const rolePermission = await RolePermissions.findOne({
            role_id: superAdminRole._id,
            permission_id: settingsPermission._id,
            is_active: true,
            deleted_at: null
        });
        
        if (rolePermission) {
            console.log('✅ Permission assigned to super_admin role\n');
        } else {
            console.log('❌ Permission NOT assigned to super_admin role\n');
        }
        
        // Show all users with super_admin role
        const superAdmins = await UsersRoles.find({ 
            role_id: superAdminRole._id,
            deleted_at: null 
        }).populate('user_id', 'email first_name last_name');
        
        console.log(`👑 Users with super_admin role (${superAdmins.length}):`);
        
        if (superAdmins.length > 0) {
            superAdmins.forEach(ua => {
                if (ua.user_id) {
                    console.log(`   - ${ua.user_id.email} (${ua.user_id.first_name || 'N/A'} ${ua.user_id.last_name || 'N/A'})`);
                }
            });
        } else {
            console.log('   (none)');
        }
        
        console.log('\n✅ Cleanup complete!');
        console.log('💡 Please restart backend server and logout/login in frontend');
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n✅ Disconnected from MongoDB\n');
    }
};

cleanupAndVerify();
