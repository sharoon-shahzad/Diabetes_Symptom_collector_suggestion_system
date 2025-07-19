import express from 'express';
import { User } from '../models/User.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Helper: send activation email
async function sendActivationEmail(email, token) {
    // Configure nodemailer with SMTP
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT, 10),
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
    const activationUrl = `${process.env.FRONTEND_URL}/activate/${token}`;
    const html = `
    <div style="font-family: Arial, sans-serif; background: #f4f6fb; padding: 40px 0;">
      <div style="max-width: 480px; margin: 0 auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.07); padding: 32px;">
        <h2 style="color: #1e2a3a; text-align: center; margin-bottom: 24px;">Welcome to Diabetes Symptom Collector!</h2>
        <p style="color: #333; font-size: 16px;">Thank you for registering. Please activate your account by clicking the button below:</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${activationUrl}" style="display: inline-block; padding: 14px 32px; background: #1976d2; color: #fff; border-radius: 4px; font-size: 16px; text-decoration: none; font-weight: bold; letter-spacing: 1px;">Activate Account</a>
        </div>
        <p style="color: #888; font-size: 14px;">If the button above does not work, copy and paste the following link into your browser:</p>
        <p style="word-break: break-all; color: #1976d2; font-size: 14px;">${activationUrl}</p>
        <hr style="margin: 32px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #aaa; font-size: 13px; text-align: center;">&copy; ${new Date().getFullYear()} Diabetes Symptom Collector. All rights reserved.</p>
      </div>
    </div>
    `;
    await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: email,
        subject: 'Activate your Diabetes Symptom Collector account',
        html
    });
}

// Helper: send password reset email
async function sendResetPasswordEmail(email, token) {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT, 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
    const html = `
    <div style="font-family: Arial, sans-serif; background: #f4f6fb; padding: 40px 0;">
      <div style="max-width: 480px; margin: 0 auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.07); padding: 32px;">
        <h2 style="color: #1e2a3a; text-align: center; margin-bottom: 24px;">Reset Your Password</h2>
        <p style="color: #333; font-size: 16px;">We received a request to reset your password. Click the button below to set a new password:</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${resetUrl}" style="display: inline-block; padding: 14px 32px; background: #1976d2; color: #fff; border-radius: 4px; font-size: 16px; text-decoration: none; font-weight: bold; letter-spacing: 1px;">Reset Password</a>
        </div>
        <p style="color: #888; font-size: 14px;">If you did not request this, you can safely ignore this email.</p>
        <p style="color: #888; font-size: 14px;">If the button above does not work, copy and paste the following link into your browser:</p>
        <p style="word-break: break-all; color: #1976d2; font-size: 14px;">${resetUrl}</p>
        <hr style="margin: 32px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #aaa; font-size: 13px; text-align: center;">&copy; ${new Date().getFullYear()} Diabetes Symptom Collector. All rights reserved.</p>
      </div>
    </div>
    `;
    await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: email,
        subject: 'Reset your Diabetes Symptom Collector password',
        html
    });
}

// Registration route
router.post('/register', async (req, res) => {
    try {
        const { fullName, email, password, gender, date_of_birth } = req.body;
        // Backend validation
        if (!fullName || !email || !password || !gender || !date_of_birth) {
            return res.status(400).json({ message: 'All fields are required.' });
        }
        // Email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email format.' });
        }
        // Password strength
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({ message: 'Password must be at least 8 characters and include at least 1 letter, 1 number, and 1 symbol.' });
        }
        // Gender check
        const validGenders = ['Male', 'Female', 'Prefer not to say'];
        if (!validGenders.includes(gender)) {
            return res.status(400).json({ message: 'Invalid gender.' });
        }
        // DOB check (must be a valid date)
        if (isNaN(Date.parse(date_of_birth))) {
            return res.status(400).json({ message: 'Invalid date of birth.' });
        }
        // Uniqueness
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered.' });
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
        return res.status(201).json({ message: 'Check your email to activate your account.' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error.' });
    }
});

// Account activation route
router.get('/activate/:token', async (req, res) => {
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
        console.error(err);
        return res.status(500).json({ message: 'Server error.' });
    }
});

// Login route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password.' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password.' });
        }
        // Generate JWT tokens
        const accessToken = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );
        const refreshToken = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        // Optionally, set refresh token as HTTP-only cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        return res.status(200).json({
            message: 'Login successful.',
            accessToken,
            refreshToken
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error.' });
    }
});

// Forgot password route
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
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
});

// Reset password route
router.post('/reset-password/:token', async (req, res) => {
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
});

// Resend activation link route
router.post('/resend-activation', async (req, res) => {
    try {
        const { email } = req.body;
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            return res.status(400).json({ message: 'Please enter a valid email address.' });
        }
        const user = await User.findOne({ email });
        if (!user) {
            // Always respond with a generic message for security
            return res.status(200).json({ message: 'If your account is inactive, a new activation link has been sent.' });
        }
        if (user.isActivated) {
            return res.status(200).json({ message: 'Your account is already activated.' });
        }
        // Invalidate previous activation tokens
        user.activationToken = undefined;
        user.activationTokenExpires = undefined;
        // Generate new activation token
        const activationToken = crypto.randomBytes(32).toString('hex');
        const activationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        user.activationToken = activationToken;
        user.activationTokenExpires = activationTokenExpires;
        await user.save();
        // Send activation email
        await sendActivationEmail(email, activationToken);
        return res.status(200).json({ message: 'If your account is inactive, a new activation link has been sent.' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error.' });
    }
});

// Logout route
router.get('/logout', (req, res) => {
    res.clearCookie('refreshToken');
    return res.status(200).json({ message: 'Logged out successfully.' });
});

// Change password route (for authenticated users)
router.post('/change-password', async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const token = authHeader.replace('Bearer ', '');
        let userId;
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            userId = decoded.userId;
        } catch {
            return res.status(401).json({ message: 'Invalid or expired token' });
        }
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'All fields are required.' });
        }
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            return res.status(400).json({ message: 'Password must be at least 8 characters and include at least 1 letter, 1 number, and 1 symbol.' });
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect.' });
        }
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();
        return res.status(200).json({ message: 'Password changed successfully.' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error.' });
    }
});

export default router; 