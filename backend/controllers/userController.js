import { User } from '../models/User.js';


// Get current user controller
export const getCurrentUser = async (req, res) => {
    try {
        const user = req.user;
        
        return res.status(200).json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    fullName: user.fullName,
                    email: user.email,
                    gender: user.gender,
                    date_of_birth: user.date_of_birth,
                    isActivated: user.isActivated
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