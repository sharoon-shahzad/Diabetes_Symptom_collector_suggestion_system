import dotenv from 'dotenv';
import { connectDB } from '../config/db.js';
import { Permission } from '../models/Permissions.js';
import { Role } from '../models/Role.js';
import { RolePermissions } from '../models/RolePermissions.js';

dotenv.config();

const addOnboardingPermission = async () => {
    try {
        await connectDB();
        console.log('✅ Connected to database');

        // Check if permission exists
        let permission = await Permission.findOne({ name: 'onboarding:complete:own' });
        
        if (!permission) {
            permission = await Permission.create({
                name: 'onboarding:complete:own',
                description: 'Ability to mark own onboarding as complete',
                resource: 'onboarding',
                action: 'complete',
                scope: 'own'
            });
            console.log('✅ Created onboarding:complete:own permission');
        } else {
            console.log('✅ onboarding:complete:own permission already exists');
        }

        // Get user role
        const userRole = await Role.findOne({ role_name: 'user' });
        if (!userRole) {
            throw new Error('User role not found');
        }

        // Check if permission is already assigned to role
        const existingRolePermission = await RolePermissions.findOne({
            role_id: userRole._id,
            permission_id: permission._id,
            deleted_at: null
        });

        if (!existingRolePermission) {
            await RolePermissions.create({
                role_id: userRole._id,
                permission_id: permission._id,
                is_active: true
            });
            console.log('✅ Assigned onboarding:complete:own permission to user role');
        } else {
            console.log('✅ Permission already assigned to user role');
        }

        console.log('✅ Setup completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

addOnboardingPermission();