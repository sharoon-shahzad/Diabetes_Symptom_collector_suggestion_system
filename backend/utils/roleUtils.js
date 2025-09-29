import { Role } from '../models/Role.js';

/**
 * Ensures that all necessary roles exist in the database
 * This function should be called during server startup
 */
export const ensureRolesExist = async () => {
    try {
        const requiredRoles = ['user', 'admin', 'super_admin'];
        
        for (const roleName of requiredRoles) {
            const existingRole = await Role.findOne({ role_name: roleName });
            if (!existingRole) {
                const newRole = new Role({ role_name: roleName });
                await newRole.save();
                console.log(`✅ Created role: ${roleName}`);
            } else {
                console.log(`✅ Role already exists: ${roleName}`);
            }
        }
        
        console.log('✅ All required roles are available in the database');
        return true;
    } catch (error) {
        console.error('❌ Error ensuring roles exist:', error);
        return false;
    }
};

/**
 * Gets the user role from the database
 * @returns {Object|null} The user role object or null if not found
 */
export const getUserRole = async () => {
    try {
        const userRole = await Role.findOne({ role_name: 'user' });
        return userRole;
    } catch (error) {
        console.error('Error getting user role:', error);
        return null;
    }
};

/**
 * Assigns the default 'user' role to a new user
 * @param {string} userId - The ID of the user to assign the role to
 * @returns {boolean} True if successful, false otherwise
 */
export const assignDefaultUserRole = async (userId) => {
    try {
        const { UsersRoles } = await import('../models/User_Role.js');
        
        // Get the user role
        const userRole = await getUserRole();
        if (!userRole) {
            console.error('User role not found in database');
            return false;
        }
        
        // Check if user already has this role
        const existingUserRole = await UsersRoles.findOne({ 
            user_id: userId, 
            role_id: userRole._id 
        });
        
        if (existingUserRole) {
            console.log('User already has user role assigned');
            return true;
        }
        
        // Assign the user role
        await UsersRoles.create({
            user_id: userId,
            role_id: userRole._id
        });
        
        console.log(`✅ Assigned 'user' role to user: ${userId}`);
        return true;
    } catch (error) {
        console.error('Error assigning default user role:', error);
        return false;
    }
};
