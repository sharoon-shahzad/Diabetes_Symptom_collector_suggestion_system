import { Role } from '../models/Role.js';
import { Permission } from '../models/Permissions.js';
import { RolePermissions } from '../models/RolePermissions.js';

// Get all roles
export const getAllRoles = async (req, res) => {
    try {
        const roles = await Role.find({ deleted_at: null });
        return res.status(200).json({
            success: true,
            data: roles
        });
    } catch (error) {
        console.error('Error fetching roles:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch roles'
        });
    }
};

// Get permissions for a specific role
export const getRolePermissions = async (req, res) => {
    try {
        const { roleId } = req.params;
        
        const rolePermissions = await RolePermissions.find({ 
            role_id: roleId,
            is_active: true,
            deleted_at: null 
        }).populate('permission_id');
        
        return res.status(200).json({
            success: true,
            data: rolePermissions
        });
    } catch (error) {
        console.error('Error fetching role permissions:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch role permissions'
        });
    }
};

// Update permissions for a role
export const updateRolePermissions = async (req, res) => {
    try {
        const { roleId } = req.params;
        const { permissionIds } = req.body;
        
        if (!Array.isArray(permissionIds)) {
            return res.status(400).json({
                success: false,
                message: 'Permission IDs must be an array'
            });
        }
        
        // First, deactivate all existing permissions for this role
        await RolePermissions.updateMany(
            { role_id: roleId },
            { is_active: false }
        );
        
        // Then, create/activate new permissions
        const rolePermissionPromises = permissionIds.map(permissionId => {
            return RolePermissions.findOneAndUpdate(
                { role_id: roleId, permission_id: permissionId },
                { 
                    role_id: roleId, 
                    permission_id: permissionId,
                    is_active: true,
                    assigned_at: new Date()
                },
                { upsert: true, new: true }
            );
        });
        
        await Promise.all(rolePermissionPromises);
        
        return res.status(200).json({
            success: true,
            message: 'Role permissions updated successfully'
        });
    } catch (error) {
        console.error('Error updating role permissions:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update role permissions'
        });
    }
};
