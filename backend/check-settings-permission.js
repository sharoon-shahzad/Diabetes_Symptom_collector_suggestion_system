import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { Permissions } from './models/Permissions.js';
import { Role } from './models/Role.js';
import { RolePermissions } from './models/RolePermissions.js';

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

const checkPermissions = async () => {
    await connectDB();
    
    try {
        console.log('\n🔍 Checking settings permission...\n');
        
        // Find settings permission
        const settingsPermission = await Permissions.findOne({ name: 'settings:manage:all' });
        
        if (!settingsPermission) {
            console.log('❌ Settings permission not found!');
            console.log('💡 Run: node seed-settings-permission.js');
        } else {
            console.log(`✅ Settings permission exists: ${settingsPermission.name}`);
            console.log(`   Description: ${settingsPermission.description}\n`);
            
            // Find super_admin role
            const superAdminRole = await Role.findOne({ name: 'super_admin' });
            if (superAdminRole) {
                console.log(`✅ Super Admin role found: ${superAdminRole.name}\n`);
                
                // Check if permission is assigned to super_admin
                const rolePermission = await RolePermissions.findOne({
                    role_id: superAdminRole._id,
                    permission_id: settingsPermission._id
                });
                
                if (rolePermission) {
                    console.log(`✅ Settings permission is assigned to Super Admin role`);
                } else {
                    console.log(`❌ Settings permission NOT assigned to Super Admin role`);
                    console.log('💡 Run: node seed-settings-permission.js');
                }
            } else {
                console.log('❌ Super Admin role not found!');
            }
        }
        
    } catch (error) {
        console.error('❌ Error checking permissions:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n✅ Disconnected from MongoDB');
    }
};

checkPermissions();
