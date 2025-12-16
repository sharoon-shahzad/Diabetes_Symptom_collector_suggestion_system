import { UserPersonalInfo } from '../models/UserPersonalInfo.js';
import { UserMedicalInfo } from '../models/UserMedicalInfo.js';
import { User } from '../models/User.js';

// Get user's personal information
export const getPersonalInfo = async (req, res) => {
    try {
        const userId = req.user._id;
        
        const personalInfo = await UserPersonalInfo.findOne({ user_id: userId });
        const user = await User.findById(userId).select('country country_code phone_number');
        
        if (!personalInfo) {
            // Return user data even if personal info doesn't exist yet
            return res.status(200).json({
                success: true,
                data: {
                    country: user?.country || '',
                    country_code: user?.country_code || '',
                    phone_number: user?.phone_number || ''
                }
            });
        }
        
        // Merge user data (country, phone) with personal info
        const responseData = {
            ...personalInfo.toObject(),
            country: user?.country || '',
            country_code: user?.country_code || '',
            phone_number: user?.phone_number || ''
        };
        
        return res.status(200).json({
            success: true,
            data: responseData,
        });
    } catch (err) {
        console.error('Error fetching personal info:', err);
        return res.status(500).json({
            success: false,
            message: 'Server error.',
        });
    }
};

// Create or update user's personal information
export const upsertPersonalInfo = async (req, res) => {
    try {
        const userId = req.user._id;
        
        console.log('🔍 FULL REQUEST BODY:', JSON.stringify(req.body, null, 2));
        
        const {
            date_of_birth,
            gender,
            country,
            country_code,
            phone_number,
            height,
            weight,
            activity_level,
            dietary_preference,
            smoking_status,
            alcohol_use,
            sleep_hours,
            emergency_contact,
            address,
        } = req.body;
        
        console.log('📝 Extracted fields:', { 
            date_of_birth, 
            gender, 
            country, 
            country_code, 
            phone_number,
            height,
            weight
        });
        
        // Validate required fields (temporarily make country optional for testing)
        if (!date_of_birth || !gender || !height || !weight) {
            console.log('❌ Validation failed - missing required fields');
            return res.status(400).json({
                success: false,
                message: 'Date of birth, gender, height, and weight are required.',
            });
        }
        
        // Log what we're about to save
        console.log('💾 Attempting to save country data:', { country, country_code, phone_number });
        
        // Update User model with country and phone
        const updatedUser = await User.findByIdAndUpdate(userId, {
            country,
            country_code,
            phone_number
        }, { new: true });
        
        console.log('✅ User updated with country:', updatedUser.country, updatedUser.country_code, updatedUser.phone_number);
        
        const personalInfoData = {
            user_id: userId,
            date_of_birth,
            gender,
            height,
            weight,
            activity_level,
            dietary_preference,
            smoking_status,
            alcohol_use,
            sleep_hours,
            emergency_contact,
            address,
        };
        
        // Update or create
        const personalInfo = await UserPersonalInfo.findOneAndUpdate(
            { user_id: userId },
            personalInfoData,
            { upsert: true, new: true, runValidators: true }
        );
        
        return res.status(200).json({
            success: true,
            message: 'Personal information saved successfully.',
            data: personalInfo,
        });
    } catch (err) {
        console.error('Error saving personal info:', err);
        return res.status(500).json({
            success: false,
            message: 'Server error.',
        });
    }
};

// Get user's medical information
export const getMedicalInfo = async (req, res) => {
    try {
        const userId = req.user._id;
        
        const medicalInfo = await UserMedicalInfo.findOne({ user_id: userId });
        
        if (!medicalInfo) {
            return res.status(404).json({
                success: false,
                message: 'Medical information not found.',
            });
        }
        
        return res.status(200).json({
            success: true,
            data: medicalInfo,
        });
    } catch (err) {
        console.error('Error fetching medical info:', err);
        return res.status(500).json({
            success: false,
            message: 'Server error.',
        });
    }
};

// Create or update user's medical information
export const upsertMedicalInfo = async (req, res) => {
    try {
        const userId = req.user._id;
        const {
            diabetes_type,
            diagnosis_date,
            current_medications,
            allergies,
            chronic_conditions,
            family_history,
            recent_lab_results,
            blood_pressure,
            last_medical_checkup,
        } = req.body;
        
        // Validate required fields
        if (!diabetes_type || !diagnosis_date) {
            return res.status(400).json({
                success: false,
                message: 'Diabetes type and diagnosis date are required.',
            });
        }
        
        const medicalInfoData = {
            user_id: userId,
            diabetes_type,
            diagnosis_date,
            current_medications,
            allergies,
            chronic_conditions,
            family_history,
            recent_lab_results,
            blood_pressure,
            last_medical_checkup,
        };
        
        // Update or create
        const medicalInfo = await UserMedicalInfo.findOneAndUpdate(
            { user_id: userId },
            medicalInfoData,
            { upsert: true, new: true, runValidators: true }
        );
        
        return res.status(200).json({
            success: true,
            message: 'Medical information saved successfully.',
            data: medicalInfo,
        });
    } catch (err) {
        console.error('Error saving medical info:', err);
        return res.status(500).json({
            success: false,
            message: 'Server error.',
        });
    }
};

// Update diabetes diagnosis status
export const updateDiabetesDiagnosis = async (req, res) => {
    try {
        console.log('=== updateDiabetesDiagnosis called ===');
        console.log('User ID:', req.user?._id);
        console.log('Request body:', req.body);
        
        const userId = req.user._id;
        const { diabetes_diagnosed } = req.body;
        
        // Validate input
        if (!diabetes_diagnosed || !['yes', 'no'].includes(diabetes_diagnosed)) {
            console.log('Validation failed:', diabetes_diagnosed);
            return res.status(400).json({
                success: false,
                message: 'Invalid diabetes diagnosis status. Must be "yes" or "no".',
            });
        }
        
        const user = await User.findById(userId);
        console.log('User found:', user ? 'Yes' : 'No');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found.',
            });
        }
        
        // Update diabetes diagnosis status
        user.diabetes_diagnosed = diabetes_diagnosed;
        user.diabetes_diagnosed_answered_at = new Date();
        await user.save();
        
        console.log('User updated successfully');
        
        return res.status(200).json({
            success: true,
            message: 'Diabetes diagnosis status updated successfully.',
            data: {
                diabetes_diagnosed: user.diabetes_diagnosed,
                diabetes_diagnosed_answered_at: user.diabetes_diagnosed_answered_at,
            },
        });
    } catch (err) {
        console.error('Error updating diabetes diagnosis:', err);
        return res.status(500).json({
            success: false,
            message: 'Server error.',
        });
    }
};
