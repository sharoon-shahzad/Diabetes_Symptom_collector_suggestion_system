import { UsersAnswers } from '../models/Users_Answers.js';
import { Question } from '../models/Question.js';
import { Symptom } from '../models/Symptom.js';
import { User } from '../models/User.js';
import { UserMedicalInfo } from '../models/UserMedicalInfo.js';
import { assessDiabetesRiskPython } from '../services/mlService.js';
import hybridRiskService from '../services/hybridRiskService.js';
import { createAuditLog } from '../middlewares/auditMiddleware.js';
import { generateRiskAssessmentPDF } from '../services/pdfGenerationService.js';
import { sendRiskAssessmentEmail } from '../services/emailService.js';
import { UserPersonalInfo } from '../models/UserPersonalInfo.js';
import encryptionService from '../services/encryptionService.js';

// Map stored answers to model features expected by EnhancedDiabetesSystem
function mapAnswersToFeatures(answersByQuestionId, questions) {
  // Initialize defaults
  const features = {
    Age: 0,
    Gender: 0,
    Obesity: 0,
    Polyuria: 0,
    Polydipsia: 0,
    'sudden weight loss': 0,
    weakness: 0,
    Polyphagia: 0,
    'Genital thrush': 0,
    'visual blurring': 0,
    Itching: 0,
    Irritability: 0,
    'delayed healing': 0,
    'partial paresis': 0,
    'muscle stiffness': 0,
    Alopecia: 0,
  };

  // Helper: interpret "yes-like" responses
  const yesLike = (text) => /yes|often|severe|every|frequent|always/i.test(text || '');

  // Map symptom category names (seeded as Symptom.name) to features
  // These are the high-level groups from seed.js (e.g. "Urination Patterns")
  const symptomCategoryToFeature = {
    'urination patterns': 'Polyuria',
    'thirst and hydration': 'Polydipsia',
    'weight changes': 'sudden weight loss',
    'energy levels': 'weakness',
    'appetite changes': 'Polyphagia',
    infections: 'Genital thrush',
    'vision changes': 'visual blurring',
    'skin changes': 'Itching',
    'mood changes': 'Irritability',
    'wound healing': 'delayed healing',
    'muscle conditions': null, // handled via question-text patterns below
    'hair conditions': 'Alopecia',
  };

  // Detailed patterns based on question text
  const featurePatterns = [
    { feature: 'Polyuria', patterns: [/polyuria/i, /frequent urination/i] },
    { feature: 'Polydipsia', patterns: [/polydipsia/i, /excessive thirst/i] },
    { feature: 'sudden weight loss', patterns: [/sudden weight loss/i] },
    { feature: 'weakness', patterns: [/weak|fatigued|fatigue|tired/i, /energy levels?/i] },
    { feature: 'Polyphagia', patterns: [/polyphagia/i, /increased hunger|always hungry|very hungry/i] },
    { feature: 'Genital thrush', patterns: [/genital thrush/i, /genital.*yeast|yeast infection/i] },
    { feature: 'visual blurring', patterns: [/visual blurring/i, /blurred vision|vision changes?/i] },
    { feature: 'Itching', patterns: [/itching|itchy/i] },
    { feature: 'Irritability', patterns: [/irritable|irritability|mood changes?/i] },
    { feature: 'delayed healing', patterns: [/delayed healing/i, /wounds? take longer to heal/i, /slow healing/i] },
    { feature: 'partial paresis', patterns: [/partial paresis/i, /muscle weakness/i] },
    { feature: 'muscle stiffness', patterns: [/muscle stiffness/i] },
    { feature: 'Alopecia', patterns: [/alopecia/i, /hair loss|hair fall/i] },
  ];

  for (const q of questions) {
    const ans = answersByQuestionId.get(String(q._id));
    if (!ans) continue;

    const text = (ans.answer_id?.answer_text || '').toString().trim();
    const questionText = (q.question_text || '').toString();
    const symptomName = q.symptom_id?.name ? q.symptom_id.name.toString().trim().toLowerCase() : '';

    // Age: any question mentioning age; extract first number from answer
    if (/age/i.test(questionText)) {
      const match = text.match(/\d+/);
      if (match) {
        const num = parseInt(match[0], 10);
        if (!Number.isNaN(num)) features.Age = num;
      }
      continue;
    }

    // Gender / Sex
    if (/gender|sex/i.test(questionText)) {
      features.Gender = /male/i.test(text) ? 1 : 0;
      continue;
    }

    // Obesity / BMI / weight-related (future-proofed if such questions are added)
    if (/obese|obesity|bmi|body mass index|overweight/i.test(questionText)) {
      if (/yes/i.test(text)) features.Obesity = 1;
      if (/no/i.test(text)) features.Obesity = 0;
      continue;
    }

    // Try mapping via question-text patterns first (most precise)
    let featureName = null;
    for (const fp of featurePatterns) {
      if (fp.patterns.some((re) => re.test(questionText))) {
        featureName = fp.feature;
        break;
      }
    }

    // If still not mapped, try using the high-level symptom category name
    if (!featureName && symptomName) {
      featureName = symptomCategoryToFeature[symptomName] || null;
    }

    if (featureName) {
      features[featureName] = yesLike(text) ? 1 : 0;
    }
  }

  return features;
}

export const assessDiabetes = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ success: false, message: 'Not authenticated' });

    console.log('Assessment request for user:', userId);

    // Load user's latest answers with populated question and symptom
    const userAnswers = await UsersAnswers.find({ user_id: userId, deleted_at: null })
      .populate({ path: 'question_id', model: 'Question', populate: { path: 'symptom_id', model: 'Symptom' } })
      .populate({ path: 'answer_id', model: 'Answer' });

    console.log('Found user answers:', userAnswers.length);

    const questions = userAnswers.map(ua => ua.question_id).filter(Boolean);
    const answersByQuestionId = new Map(userAnswers.map(ua => [String(ua.question_id?._id), ua]));

    console.log('Questions found:', questions.length);

    const features = mapAnswersToFeatures(answersByQuestionId, questions);
    console.log('Mapped features for ML model:', features);

    // Step 1: Get XGBoost base assessment
    const xgboostResult = await assessDiabetesRiskPython(features);
    console.log('XGBoost model result:', xgboostResult);

    // Check if the XGBoost result contains an error
    if (xgboostResult.error) {
      console.error('XGBoost model returned error:', xgboostResult.error);
      return res.status(500).json({ 
        success: false, 
        message: 'Assessment failed', 
        error: xgboostResult.error,
        details: 'The machine learning model encountered an error during processing'
      });
    }

    // Step 2: Enhance with LLM (Diabetica 7B) if available
    let finalResult = xgboostResult;
    let enhancementStatus = { enhanced: false, reason: 'Not attempted' };

    try {
      // Get user context for better LLM assessment
      const user = await User.findById(userId);
      const medicalInfo = await UserMedicalInfo.findOne({ user_id: userId });
      
      const userContext = {
        age: features.Age,
        gender: features.Gender === 1 ? 'Male' : 'Female',
        diabetesType: user?.diabetes_type || 'Undiagnosed',
        medications: medicalInfo?.medications || []
      };

      console.log('Attempting LLM enhancement with Diabetica 7B...');
      
      // Check if LLM is available
      const llmAvailable = await hybridRiskService.checkLLMAvailability();
      
      if (llmAvailable) {
        // Enhance with LLM
        const enhancedResult = await hybridRiskService.enhanceRiskAssessment(
          xgboostResult,
          features,
          userContext
        );
        
        if (enhancedResult.enhanced) {
          finalResult = enhancedResult;
          enhancementStatus = { enhanced: true, reason: 'Successfully enhanced with Diabetica 7B' };
          console.log('✅ Assessment enhanced with LLM');
        } else {
          enhancementStatus = { enhanced: false, reason: enhancedResult.fallbackReason || 'LLM enhancement failed' };
          console.log('⚠️ LLM enhancement failed, using XGBoost only:', enhancedResult.fallbackReason);
        }
      } else {
        enhancementStatus = { enhanced: false, reason: 'LM Studio not available. Start LM Studio server for enhanced assessments.' };
        console.log('⚠️ LM Studio not available, using XGBoost only');
      }
    } catch (llmError) {
      // If LLM enhancement fails, continue with XGBoost result
      enhancementStatus = { enhanced: false, reason: `LLM enhancement error: ${llmError.message}` };
      console.error('LLM enhancement error (continuing with XGBoost):', llmError.message);
    }

    // Step 3: Persist latest assessment summary on the user for dashboard insights
    try {
      const riskLevelRaw = finalResult?.risk_level || 'low';
      const probabilityRaw = finalResult?.diabetes_probability ?? 0;

      const updatedUser = await User.findByIdAndUpdate(userId, {
        last_assessment_risk_level: typeof riskLevelRaw === 'string' ? riskLevelRaw : String(riskLevelRaw),
        last_assessment_probability: Number(probabilityRaw) || 0,
        last_assessment_at: new Date(),
        // Reset popup handled flag so the new assessment can trigger a fresh prompt
        last_assessment_popup_handled_at: null,
      }, { new: true });

      // Generate and send risk assessment report email in background
      setImmediate(async () => {
        try {
          console.log('📊 Generating risk assessment report for user:', updatedUser.email);
          
          // Fetch personal and medical info
          const personalInfo = await UserPersonalInfo.findOne({ user_id: userId });
          const medicalInfo = await UserMedicalInfo.findOne({ user_id: userId });
          
          // Decrypt if available
          let decryptedPersonalInfo = null;
          let decryptedMedicalInfo = null;
          
          if (personalInfo) {
            decryptedPersonalInfo = {
              date_of_birth: encryptionService.decrypt(personalInfo.date_of_birth),
              gender: encryptionService.decrypt(personalInfo.gender),
              height: encryptionService.decrypt(personalInfo.height),
              weight: encryptionService.decrypt(personalInfo.weight),
              activity_level: encryptionService.decrypt(personalInfo.activity_level),
              dietary_preference: encryptionService.decrypt(personalInfo.dietary_preference),
              smoking_status: encryptionService.decrypt(personalInfo.smoking_status),
              alcohol_use: encryptionService.decrypt(personalInfo.alcohol_use),
              sleep_hours: encryptionService.decrypt(personalInfo.sleep_hours)
            };
          }
          
          if (medicalInfo) {
            decryptedMedicalInfo = {
              diabetes_type: medicalInfo.diabetes_type ? encryptionService.decrypt(medicalInfo.diabetes_type) : null,
              diagnosis_date: medicalInfo.diagnosis_date ? encryptionService.decrypt(medicalInfo.diagnosis_date) : null,
              current_medications: medicalInfo.current_medications ? medicalInfo.current_medications.map(med => ({
                medication_name: encryptionService.decrypt(med.medication_name),
                dosage: encryptionService.decrypt(med.dosage),
                frequency: encryptionService.decrypt(med.frequency)
              })) : [],
              chronic_conditions: medicalInfo.chronic_conditions ? medicalInfo.chronic_conditions.map(cond => ({
                condition_name: encryptionService.decrypt(cond.condition_name)
              })) : [],
              blood_glucose_data: medicalInfo.blood_glucose_data ? {
                fasting_glucose: medicalInfo.blood_glucose_data.fasting_glucose ? encryptionService.decrypt(medicalInfo.blood_glucose_data.fasting_glucose) : null,
                hba1c: medicalInfo.blood_glucose_data.hba1c ? encryptionService.decrypt(medicalInfo.blood_glucose_data.hba1c) : null,
                postprandial_glucose: medicalInfo.blood_glucose_data.postprandial_glucose ? encryptionService.decrypt(medicalInfo.blood_glucose_data.postprandial_glucose) : null
              } : null
            };
          }
          
          // Prepare risk data with actual assessment results
          const riskData = {
            risk_level: updatedUser.last_assessment_risk_level || 'low',
            probability: updatedUser.last_assessment_probability || 0,
            confidence: finalResult?.confidence || 0,
            total_symptoms: finalResult?.total_symptoms || 0,
            assessment_date: new Date()
          };
          
          // Generate PDF
          const pdfPath = await generateRiskAssessmentPDF(
            updatedUser,
            decryptedPersonalInfo,
            decryptedMedicalInfo,
            riskData
          );
          
          // Send email with PDF
          await sendRiskAssessmentEmail(
            updatedUser.email,
            updatedUser.fullName,
            riskData.risk_level,
            pdfPath
          );
          
          console.log('✅ Risk assessment report email sent successfully to:', updatedUser.email);
        } catch (reportError) {
          console.error('❌ Error generating/sending risk assessment report:', reportError.message);
          console.error('Full error:', reportError);
        }
      });

    } catch (persistErr) {
      console.error('Failed to persist latest assessment summary on user:', persistErr);
    }

    // Log assessment to audit trail
    try {
      await createAuditLog('CREATE', 'Assessment', req, res, userId, {
        before: null,
        after: {
          risk_level: finalResult?.risk_level || 'low',
          probability: finalResult?.diabetes_probability ?? 0,
          enhanced: enhancementStatus.enhanced,
          model_used: enhancementStatus.enhanced ? 'Hybrid (XGBoost + Diabetica 7B)' : 'XGBoost'
        }
      });
    } catch (auditErr) {
      console.error('Failed to log assessment to audit trail:', auditErr);
    }

    // Return enhanced result with metadata
    return res.status(200).json({ 
      success: true, 
      data: { 
        features, 
        result: finalResult,
        enhancement_status: enhancementStatus,
        model_info: {
          primary_model: 'XGBoost (512 records)',
          enhancement_model: enhancementStatus.enhanced ? 'Diabetica 7B LLM' : 'None',
          assessment_type: enhancementStatus.enhanced ? 'Hybrid (Statistical + Medical Reasoning)' : 'Statistical Only'
        }
      } 
    });
  } catch (err) {
    console.error('Assessment error:', err);
    return res.status(500).json({ 
      success: false, 
      message: 'Assessment failed', 
      error: err.message,
      details: 'An error occurred while processing the diabetes risk assessment'
    });
  }
};





