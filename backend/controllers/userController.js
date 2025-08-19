import { User } from '../models/User.js';
import { UsersRoles } from '../models/User_Role.js';
import { UsersAnswers } from '../models/Users_Answers.js';
import { Question } from '../models/Question.js';
import { Symptom } from '../models/Symptom.js';
import { Disease } from '../models/Disease.js';
import { Answer } from '../models/Answer.js';
import { QuestionsAnswers } from '../models/Questions_Answers.js';


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

        // Check for email uniqueness if email is being changed
        if (email !== user.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ success: false, message: "Email is already in use by another user" });
            }
        }

        // Update user
        const updatedUser = await User.findByIdAndUpdate(
            id,
            {
                fullName,
                email,
                gender,
                date_of_birth,
                isActivated,
                phone_number,
                whatsapp_number
            },
            { new: true, runValidators: true }
        );

        return res.status(200).json({
            success: true,
            message: "User updated successfully",
            data: updatedUser
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

// GET /users/my-disease-data
export const getMyDiseaseData = async (req, res) => {
    try {
        const userId = req.user._id;
        // Fetch all user's answers (not deleted)
        const userAnswers = await UsersAnswers.find({ user_id: userId, deleted_at: null })
            .populate({
                path: 'question_id',
                populate: {
                    path: 'symptom_id',
                    populate: {
                        path: 'disease_id',
                        model: 'Disease',
                    },
                    model: 'Symptom',
                },
                model: 'Question',
            })
            .populate('answer_id');

        if (!userAnswers.length) {
            return res.status(200).json({
                success: true,
                data: {}
            });
        }

        // Assume all answers are for the same disease (if not, pick the first)
        const firstSymptom = userAnswers[0]?.question_id?.symptom_id;
        const disease = firstSymptom?.disease_id;
        const diseaseName = disease?.name || 'Unknown Disease';
        const lastUpdated = userAnswers.reduce((latest, ua) => {
            const date = ua.createdAt || ua.updatedAt;
            return (!latest || (date && date > latest)) ? date : latest;
        }, null);

        // Group answers by symptom
        const symptomMap = {};
        userAnswers.forEach(ua => {
            const symptom = ua.question_id?.symptom_id;
            if (!symptom) return;
            const symptomName = symptom.name || 'Unknown Symptom';
            if (!symptomMap[symptomName]) {
                symptomMap[symptomName] = [];
            }
            symptomMap[symptomName].push({
                question: ua.question_id?.question_text || 'Unknown Question',
                answer: ua.answer_id?.answer_text || 'N/A',
                date: ua.createdAt,
            });
        });

        // Format for frontend
        const symptoms = Object.entries(symptomMap).map(([name, questions]) => ({
            name,
            questions,
        }));

        // Find all questions for this disease
        let totalQuestions = 0;
        if (disease && disease._id) {
          const allSymptoms = await Symptom.find({ disease_id: disease._id, deleted_at: null });
          const symptomIds = allSymptoms.map(s => s._id);
          totalQuestions = await Question.countDocuments({ symptom_id: { $in: symptomIds }, deleted_at: null });
        }
        // Count answered questions (unique question_ids in userAnswers)
        const answeredQuestions = new Set(userAnswers.map(ua => String(ua.question_id?._id))).size;

        return res.status(200).json({
            success: true,
            data: {
                disease: diseaseName,
                lastUpdated,
                symptoms,
                totalQuestions,
                answeredQuestions,
            }
        });
    } catch (error) {
        console.error('Error in getMyDiseaseData:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch disease data.'
        });
    }
};

// Get user's disease data for editing
export const getUserDiseaseDataForEditing = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    
    if (!user.onboardingCompleted) {
      return res.status(400).json({
        success: false,
        message: 'You must complete your details first before editing.'
      });
    }

    // Check if editing window is still open
    const now = new Date();
    if (user.diseaseDataEditingExpiresAt && now > user.diseaseDataEditingExpiresAt) {
      // Auto-submit if editing window has expired
      if (user.diseaseDataStatus === 'draft') {
        user.diseaseDataStatus = 'submitted';
        await user.save();
      }
      return res.status(400).json({
        success: false,
        message: 'Editing window has expired. Your disease data has been submitted and can no longer be edited.'
      });
    }

    // Get user's answers with full details
    const userAnswers = await UsersAnswers.find({ user_id: userId, deleted_at: null })
      .populate({
        path: 'question_id',
        populate: {
          path: 'symptom_id',
          populate: {
            path: 'disease_id',
            model: 'Disease'
          },
          model: 'Symptom'
        },
        model: 'Question'
      })
      .populate('answer_id');

    // Group by disease, then by symptom
    const diseaseMap = {};
    userAnswers.forEach(ua => {
      const disease = ua.question_id?.symptom_id?.disease_id;
      const symptom = ua.question_id?.symptom_id;
      
      if (!disease || !symptom) return;
      
      if (!diseaseMap[disease._id]) {
        diseaseMap[disease._id] = {
          _id: disease._id,
          name: disease.name,
          description: disease.description,
          symptoms: {}
        };
      }
      
      if (!diseaseMap[disease._id].symptoms[symptom._id]) {
        diseaseMap[disease._id].symptoms[symptom._id] = {
          _id: symptom._id,
          name: symptom.name,
          description: symptom.description,
          questions: []
        };
      }
      
      diseaseMap[disease._id].symptoms[symptom._id].questions.push({
        _id: ua.question_id._id,
        question_text: ua.question_id.question_text,
        question_type: ua.question_id.question_type,
        options: ua.question_id.options || [],
        current_answer: ua.answer_id.answer_text,
        answer_id: ua.answer_id._id,
        user_answer_id: ua._id
      });
    });

    const diseases = Object.values(diseaseMap);
    
    return res.status(200).json({
      success: true,
      data: {
        diseases,
        editingWindow: {
          expiresAt: user.diseaseDataEditingExpiresAt,
          status: user.diseaseDataStatus,
          canEdit: user.diseaseDataStatus === 'draft' && (!user.diseaseDataEditingExpiresAt || now <= user.diseaseDataEditingExpiresAt)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching user disease data for editing:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching disease data for editing'
    });
  }
};

// Update user's disease data answer
export const updateUserDiseaseDataAnswer = async (req, res) => {
  try {
    const userId = req.user._id;
    const { questionId, answerText } = req.body;
    
    if (!questionId || !answerText) {
      return res.status(400).json({
        success: false,
        message: 'Missing questionId or answerText'
      });
    }

    const user = await User.findById(userId);
    
    if (!user.onboardingCompleted) {
      return res.status(400).json({
        success: false,
        message: 'You must complete your details first before editing.'
      });
    }

    // Check if editing window is still open
    const now = new Date();
    if (user.diseaseDataEditingExpiresAt && now > user.diseaseDataEditingExpiresAt) {
      // Auto-submit if editing window has expired
      if (user.diseaseDataStatus === 'draft') {
        user.diseaseDataStatus = 'submitted';
        await user.save();
      }
      return res.status(400).json({
        success: false,
        message: 'Editing window has expired. Your disease data has been submitted and can no longer be edited.'
      });
    }

    if (user.diseaseDataStatus !== 'draft') {
      return res.status(400).json({
        success: false,
        message: 'Disease data has already been submitted and cannot be edited.'
      });
    }

    // Find or create the answer
    let answer = await Answer.findOne({ answer_text: answerText, deleted_at: null });
    if (!answer) {
      answer = await Answer.create({ answer_text: answerText });
    }

    // Ensure Questions_Answers entry exists
    let qa = await QuestionsAnswers.findOne({ question_id: questionId, answer_id: answer._id, deleted_at: null });
    if (!qa) {
      qa = await QuestionsAnswers.create({ question_id: questionId, answer_id: answer._id });
    }

    // Update the user's answer
    const updatedUserAnswer = await UsersAnswers.findOneAndUpdate(
      { user_id: userId, question_id: questionId, deleted_at: null },
      { answer_id: answer._id },
      { new: true }
    );

    if (!updatedUserAnswer) {
      return res.status(404).json({
        success: false,
        message: 'Answer not found for this question'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Answer updated successfully',
      data: {
        answerId: answer._id,
        answerText: answer.answer_text
      }
    });
  } catch (error) {
    console.error('Error updating user disease data answer:', error);
    console.error('Error details:', {
      userId: req.user._id,
      questionId: req.body.questionId,
      answerText: req.body.answerText,
      errorMessage: error.message,
      errorStack: error.stack
    });
    return res.status(500).json({
      success: false,
      message: 'Error updating answer'
    });
  }
};

// Submit disease data (mark as submitted)
export const submitDiseaseData = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    
    if (!user.onboardingCompleted) {
      return res.status(400).json({
        success: false,
        message: 'You must complete your details first before submitting.'
      });
    }

    if (user.diseaseDataStatus === 'submitted') {
      return res.status(400).json({
        success: false,
        message: 'Disease data has already been submitted.'
      });
    }

    // Check if editing window is still open
    const now = new Date();
    if (user.diseaseDataEditingExpiresAt && now > user.diseaseDataEditingExpiresAt) {
      return res.status(400).json({
        success: false,
        message: 'Editing window has expired. Your disease data has been automatically submitted.'
      });
    }

    // Mark as submitted
    user.diseaseDataStatus = 'submitted';
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Disease data submitted successfully'
    });
  } catch (error) {
    console.error('Error submitting disease data:', error);
    return res.status(500).json({
      success: false,
      message: 'Error submitting disease data'
    });
  }
};

// Get all admins (users with admin or super_admin role)
export const getAllAdmins = async (req, res) => {
    try {
        // Get admin and super_admin role IDs
        const { Role } = await import('../models/Role.js');
        const adminRole = await Role.findOne({ role_name: 'admin' });
        const superAdminRole = await Role.findOne({ role_name: 'super_admin' });
        
        if (!adminRole || !superAdminRole) {
            return res.status(500).json({
                success: false,
                message: 'Admin roles not found'
            });
        }

        // Find users with admin or super_admin roles
        const adminUsers = await UsersRoles.find({
            role_id: { $in: [adminRole._id, superAdminRole._id] }
        }).populate('user_id').populate('role_id');

        // Format the response
        const admins = adminUsers.map(ur => {
            const user = ur.user_id;
            const role = ur.role_id;
            const { password, refreshToken, activationToken, resetPasswordToken, ...safeUser } = user.toObject();
            return {
                ...safeUser,
                roles: [role.role_name]
            };
        });

        return res.status(200).json({
            success: true,
            data: admins
        });
    } catch (error) {
        console.error('Get all admins error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching admins'
        });
    }
};

// Get user roles
export const getUserRoles = async (req, res) => {
    try {
        const user = req.user;
        const userRoles = await UsersRoles.find({ user_id: user._id }).populate('role_id');
        const roles = userRoles.map(ur => ur.role_id.role_name);
        
        return res.status(200).json({
            success: true,
            data: roles
        });
    } catch (error) {
        console.error('Get user roles error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching user roles'
        });
    }
};

// Update user role
export const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!role) {
            return res.status(400).json({
                success: false,
                message: 'Role is required'
            });
        }

        // Find the role
        const { Role } = await import('../models/Role.js');
        const targetRole = await Role.findOne({ role_name: role });
        if (!targetRole) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role'
            });
        }

        // Remove existing roles for this user
        await UsersRoles.deleteMany({ user_id: id });

        // Assign new role
        await UsersRoles.create({
            user_id: id,
            role_id: targetRole._id
        });

        return res.status(200).json({
            success: true,
            message: 'User role updated successfully'
        });
    } catch (error) {
        console.error('Update user role error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error updating user role'
        });
    }
};


