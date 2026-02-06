import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

// Define schemas
const permissionSchema = new mongoose.Schema({
    name: String,
    description: String,
    is_active: Boolean,
    deleted_at: Date
});

const roleSchema = new mongoose.Schema({
    name: String,
    display_name: String
});

const rolePermissionSchema = new mongoose.Schema({
    role_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' },
    permission_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Permissions' },
    is_active: Boolean,
    deleted_at: Date
});

const Permission = mongoose.model('Permissions', permissionSchema);
const Role = mongoose.model('Role', roleSchema);
const RolePermission = mongoose.model('RolePermissions', rolePermissionSchema);

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB connected');
    } catch (err) {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    }
};

const diagnosePermission = async () => {
    await connectDB();
    
    try {
        console.log('\n🔍 Diagnosing settings:manage:all permission...\n');
        
        // Step 1: Check if permission exists
        const permission = await Permission.findOne({ name: 'settings:manage:all' });
        
        if (!permission) {
            console.log('❌ Permission "settings:manage:all" NOT FOUND in database!');
            console.log('💡 Run: node seed-settings-permission.js\n');
            return;
        }
        
        console.log('✅ Permission exists:');
        console.log(`   Name: ${permission.name}`);
        console.log(`   Description: ${permission.description}`);
        console.log(`   Is Active: ${permission.is_active}`);
        console.log(`   Deleted: ${permission.deleted_at ? 'YES' : 'NO'}`);
        console.log(`   ID: ${permission._id}\n`);
        
        // Step 2: Check which roles have this permission
        const rolePermissions = await RolePermission.find({ 
            permission_id: permission._id 
        }).populate('role_id');
        
        if (rolePermissions.length === 0) {
            console.log('❌ Permission NOT assigned to any role!');
            console.log('💡 Run: node seed-settings-permission.js\n');
            return;
        }
        
        console.log(`✅ Permission assigned to ${rolePermissions.length} role(s):\n`);
        
        for (const rp of rolePermissions) {
            if (rp.role_id) {
                const status = rp.is_active && !rp.deleted_at ? '✅ ACTIVE' : '❌ INACTIVE/DELETED';
                console.log(`   ${status} ${rp.role_id.name} (${rp.role_id.display_name})`);
                console.log(`      - is_active: ${rp.is_active}`);
                console.log(`      - deleted_at: ${rp.deleted_at || 'null'}`);
            }
        }
        
        console.log('\n📊 Summary:');
        const activeAssignments = rolePermissions.filter(rp => rp.is_active && !rp.deleted_at);
        console.log(`   Total assignments: ${rolePermissions.length}`);
        console.log(`   Active assignments: ${activeAssignments.length}`);
        
        if (activeAssignments.length === 0) {
            console.log('\n❌ No ACTIVE role assignments found!');
            console.log('💡 The permission exists but is not actively assigned to any role.');
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n✅ Disconnected from MongoDB\n');
    }
};

diagnosePermission();
