import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

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

const permissionSchema = new mongoose.Schema({
    permission_key: { type: String, required: true, unique: true },
    permission_name: { type: String, required: true },
    resource: { type: String, required: true },
    action: { type: String, required: true },
    scope: { type: String, enum: ['own', 'all'], default: 'own' },
    description: { type: String },
}, { timestamps: true });

const Permission = mongoose.model('Permission', permissionSchema);

const rolePermissionsSchema = new mongoose.Schema({
    role_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: true },
    permission_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Permission', required: true },
    is_active: { type: Boolean, default: true },
}, { timestamps: true });

const RolePermissions = mongoose.model('RolePermissions', rolePermissionsSchema);

const roleSchema = new mongoose.Schema({
    role_name: { type: String, required: true, unique: true },
}, { timestamps: true });

const Role = mongoose.model('Role', roleSchema);

const seedSettingsPermission = async () => {
    await connectDB();
    
    try {
        console.log('\n🔐 Adding settings:manage:all permission...\n');
        
        // Check if permission already exists
        let permission = await Permission.findOne({ permission_key: 'settings:manage:all' });
        
        if (permission) {
            console.log('⏭️  Permission "settings:manage:all" already exists');
        } else {
            permission = await Permission.create({
                permission_key: 'settings:manage:all',
                permission_name: 'Manage All Settings',
                resource: 'settings',
                action: 'manage',
                scope: 'all',
                description: 'Manage system-wide settings and configurations'
            });
            console.log('✅ Created permission: "settings:manage:all"');
        }
        
        // Assign to super_admin role
        const superAdminRole = await Role.findOne({ role_name: 'super_admin' });
        
        if (superAdminRole) {
            const existingAssignment = await RolePermissions.findOne({
                role_id: superAdminRole._id,
                permission_id: permission._id
            });
            
            if (existingAssignment) {
                console.log('⏭️  Permission already assigned to super_admin');
            } else {
                await RolePermissions.create({
                    role_id: superAdminRole._id,
                    permission_id: permission._id,
                    is_active: true
                });
                console.log('✅ Assigned permission to super_admin role');
            }
        } else {
            console.log('⚠️  super_admin role not found');
        }
        
        console.log('\n✅ Settings permission seeded successfully!');
        
    } catch (error) {
        console.error('❌ Error seeding permission:', error);
    } finally {
        await mongoose.disconnect();
        console.log('✅ Disconnected from MongoDB');
    }
};

seedSettingsPermission();
