import { User } from '../models/User.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { Role } from '../models/Role.js';
import { 
    generateAccessToken, 
    generateRefreshToken, 
    verifyRefreshToken 
} from '../utils/generateJWT.js';
import { sendActivationEmail, sendResetPasswordEmail } from '../services/emailService.js';

// Helper: Generate and store tokens
const generateAccessAndRefreshTokens = async (userId, email) => {
    try {
        const accessToken = generateAccessToken(userId, email);
        const refreshToken = generateRefreshToken(userId, email);

        // Store refresh token in database
        await User.findByIdAndUpdate(userId, {
            refreshToken: refreshToken
        });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new Error('Error generating tokens');
    }
};

// Registration controller
export const register = async (req, res) => {
    try {
        const { fullName, email, password, gender, date_of_birth } = req.body;
        
        // Validation
        if (!fullName || !email || !password || !gender || !date_of_birth) {
            return res.status(400).json({ 
                success: false,
                message: 'All fields are required.' 
            });
        }
        
        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                success: false,
                message: 'Invalid email format.' 
            });
        }
        
        // Password strength validation
        if (password.length < 8) {
            return res.status(400).json({ 
                success: false,
                message: 'Password must be at least 8 characters.' 
            });
        }
        
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ 
                success: false,
                message: 'Email already registered.' 
            });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Generate activation token
        const activationToken = crypto.randomBytes(32).toString('hex');
        const activationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        
        // Create user
        const user = new User({
            fullName,
            email,
            password: hashedPassword,
            gender,
            date_of_birth,
            isActivated: false,
            activationToken,
            activationTokenExpires
        });
        
        await user.save();
        
        // Send activation email
        await sendActivationEmail(email, activationToken);
        
        return res.status(201).json({ 
            success: true,
            message: 'Check your email to activate your account.' 
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ 
            success: false,
            message: 'Server error.' 
        });
    }
};

// Account activation controller
export const activateAccount = async (req, res) => {
    try {
        const { token } = req.params;
        const user = await User.findOne({ activationToken: token });
        if (!user) {
            // If not found by token, try to find by isActivated=true and token already cleared
            const activatedUser = await User.findOne({ isActivated: true });
            if (activatedUser) {
                return res.status(200).json({ message: 'Your account has already been activated. You can now log in.' });
            }
            return res.status(400).json({ message: 'Invalid or expired activation link.' });
        }
        if (user.isActivated) {
            return res.status(200).json({ message: 'Your account has already been activated. You can now log in.' });
        }
        if (!user.activationTokenExpires || user.activationTokenExpires < new Date()) {
            return res.status(400).json({ message: 'Activation link has expired.' });
        }
        user.isActivated = true;
        user.activationToken = undefined;
        user.activationTokenExpires = undefined;
        await user.save();
        return res.status(200).json({ message: 'Your account has been activated. You can now log in.' });
    } catch (err) {
        return res.status(500).json({ message: 'Server error.' });
    }
};

// Login controller
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ 
                success: false,
                message: 'Email and password are required.' 
            });
        }
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ 
                success: false,
                message: 'Invalid email or password.' 
            });
        }
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ 
                success: false,
                message: 'Invalid email or password.' 
            });
        }
        
        // Fetch user roles
        let roles = [];
        try {
            const { UsersRoles } = await import('../models/User_Role.js');
            const userRoles = await UsersRoles.find({ user_id: user._id }).populate('role_id');
            roles = userRoles.map(ur => ur.role_id.role_name);
        } catch (roleErr) {
            console.error('Error fetching user roles during login:', roleErr);
        }
        
        // Generate access and refresh tokens
        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id, user.email);
        
        // Set refresh token as HTTP-only cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        
        return res.status(200).json({
            success: true,
            message: 'Login successful.',
            data: {
                user: {
                    id: user._id,
                    fullName: user.fullName,
                    email: user.email,
                    gender: user.gender,
                    date_of_birth: user.date_of_birth,
                    roles: roles
                },
                accessToken,
                refreshToken
            }
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ 
            success: false,
            message: 'Server error.' 
        });
    }
};

// Refresh access token controller
export const refreshAccessToken = async (req, res) => {
    try {
        // Get refresh token from cookies or body
        const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
        
        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: "Refresh token is required",
                code: "REFRESH_TOKEN_MISSING"
            });
        }

        // Verify refresh token
        const decoded = verifyRefreshToken(refreshToken);
        
        // Find user by ID
        const user = await User.findById(decoded.userId);
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found",
                code: "USER_NOT_FOUND"
            });
        }

        // Compare refresh token with stored token in database
        if (user.refreshToken !== refreshToken) {
            return res.status(401).json({
                success: false,
                message: "Invalid refresh token",
                code: "INVALID_REFRESH_TOKEN"
            });
        }

        // Generate new access and refresh tokens
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshTokens(user._id, user.email);

        // Set new refresh token as HTTP-only cookie
        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        return res.status(200).json({
            success: true,
            message: "Access token refreshed successfully",
            data: {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken
            }
        });

    } catch (error) {
        console.error('Refresh token error:', error);
        return res.status(401).json({
            success: false,
            message: "Invalid or expired refresh token",
            code: "REFRESH_TOKEN_EXPIRED"
        });
    }
};

// Logout controller
export const logout = async (req, res) => {
    try {
        // Get user ID from request (if authenticated)
        const userId = req.user?._id;
        
        if (userId) {
            // Clear refresh token from database
            await User.findByIdAndUpdate(userId, {
                refreshToken: null
            });
        }

        // Clear cookies
        res.clearCookie('refreshToken');
        res.clearCookie('accessToken');
        
        return res.status(200).json({
            success: true,
            message: 'User logged out successfully'
        });
    } catch (error) {
        console.error('Logout error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error during logout'
        });
    }
};

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

// Forgot password controller
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            return res.status(400).json({ message: 'Please enter a valid email address.' });
        }
        const user = await User.findOne({ email });
        if (user) {
            // Generate reset token
            const resetToken = crypto.randomBytes(32).toString('hex');
            const resetTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
            user.resetPasswordToken = resetToken;
            user.resetPasswordExpires = resetTokenExpires;
            await user.save();
            // Send reset email
            await sendResetPasswordEmail(email, resetToken);
        }
        // Always respond with a generic message
        return res.status(200).json({ message: 'If this email is registered, a password reset link has been sent.' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error.' });
    }
};

// Reset password controller
export const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;
        if (!password || password.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters.' });
        }
        const user = await User.findOne({ resetPasswordToken: token });
        if (!user || !user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
            return res.status(400).json({ message: 'Invalid or expired reset link.' });
        }
        // Hash new password
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        // Invalidate all previous sessions (by changing password hash)
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        return res.status(200).json({ message: 'Your password has been reset. You can now log in.' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error.' });
    }
}; 

// Change password controller
export const changePassword = async (req, res) => {
    try {
        const userId = req.user._id;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Current and new password are required.' });
        }
        if (newPassword.length < 8) {
            return res.status(400).json({ message: 'New password must be at least 8 characters.' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect.' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        return res.status(200).json({ message: 'Password changed successfully.' });
    } catch (error) {
        console.error('Change password error:', error);
        return res.status(500).json({ message: 'Error changing password.' });
    }
}; 

// Resend activation link controller
export const resendActivationLink = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Email is required.' });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        if (user.isActivated) {
            return res.status(400).json({ message: 'Account is already activated.' });
        }
        // Generate new activation token
        const activationToken = crypto.randomBytes(32).toString('hex');
        const activationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        user.activationToken = activationToken;
        user.activationTokenExpires = activationTokenExpires;
        await user.save();
        // Send activation email
        await sendActivationEmail(email, activationToken);
        return res.status(200).json({ message: 'Activation link resent. Please check your email.' });
    } catch (error) {
        console.error('Resend activation link error:', error);
        return res.status(500).json({ message: 'Error resending activation link.' });
    }
}; 