import { User } from '../models/User.js';
import { UsersRoles } from '../models/User_Role.js';


// Get current user controller
export const getCurrentUser = async (req, res) => {
    try {
        const user = req.user;
        // Fetch user roles
        const userRoles = await UsersRoles.find({ user_id: user._id }).populate('role_id');
        const roles = userRoles.map(ur => ur.role_id.role_name);
        return res.status(200).json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    fullName: user.fullName,
                    email: user.email,
                    gender: user.gender,
                    date_of_birth: user.date_of_birth,
                    isActivated: user.isActivated,
                    roles: roles
                }
            }
        });
    } catch (error) {
        console.error('Get current user error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching user data'
        });
    }
};

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        // Fetch roles for each user
        const usersWithRoles = await Promise.all(users.map(async (user) => {
            const userRoles = await UsersRoles.find({ user_id: user._id }).populate('role_id');
            const roles = userRoles.map(ur => ur.role_id.role_name);
            // Exclude sensitive fields
            const { password, refreshToken, activationToken, resetPasswordToken, ...safeUser } = user.toObject();
            return { ...safeUser, roles };
        }));
        return res.status(200).json({
            success: true,
            data: usersWithRoles
        });
    } catch (error) {
        console.error('Get all users error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching users'
        });
    }
};


export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { fullName, email, gender, date_of_birth, isActivated, phone_number, whatsapp_number } = req.body;

        // Find user
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Validate required fields
        if (!fullName) {
            return res.status(400).json({ success: false, message: "Full name is required" });
        }
        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required" });
        }
        if (!gender) {
            return res.status(400).json({ success: false, message: "Gender is required" });
        }
        if (!date_of_birth) {
            return res.status(400).json({ success: false, message: "Date of birth is required" });
        }
        // Optionally validate isActivated, phone_number, whatsapp_number as needed

        // Check for email uniqueness if email is being changed
        if (email !== user.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ success: false, message: "Email is already in use by another user" });
            }
        }

        // Update allowed fields
        user.fullName = fullName;
        user.email = email;
        user.gender = gender;
        user.date_of_birth = date_of_birth;
        if (typeof isActivated !== 'undefined') user.isActivated = isActivated;
        // if (typeof phone_number !== 'undefined') user.phone_number = phone_number;
        // if (typeof whatsapp_number !== 'undefined') user.whatsapp_number = whatsapp_number;

        await user.save();

        // Exclude sensitive fields in response
        const { password, refreshToken, activationToken, resetPasswordToken, ...safeUser } = user.toObject();

        return res.status(200).json({
            success: true,
            data: safeUser
        });
    } catch (error) {
        console.error('Update user error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error updating user'
        });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        // Soft delete: set deleted_at to current date
        user.deleted_at = new Date();
        await user.save();


        console.log(`User with id ${id} soft deleted by admin at ${user.deleted_at}`);
        return res.status(200).json({
            success: true,
            message: "User deleted successfully (soft delete)",
            deleted_at: user.deleted_at
        });
    } catch (error) {
        console.error('Delete user error:', error);
        return res.status(500).json({
            success: false,
            message: "Error deleting user"
        });
    }
};
