import { UsersAnswers } from '../models/Users_Answers.js';
import { Question } from '../models/Question.js';
import { Symptom } from '../models/Symptom.js';
import { User } from '../models/User.js';
import { assessDiabetesRiskPython } from '../services/mlService.js';

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
    console.log('User answers data:', userAnswers.map(ua => ({
      question: ua.question_id?.question_text,
      answer: ua.answer_id?.answer_text,
      symptom: ua.question_id?.symptom_id?.name
    })));

    const questions = userAnswers.map(ua => ua.question_id).filter(Boolean);
    const answersByQuestionId = new Map(userAnswers.map(ua => [String(ua.question_id?._id), ua]));

    console.log('Questions found:', questions.length);
    console.log('Answers by question ID:', Array.from(answersByQuestionId.entries()));

    const features = mapAnswersToFeatures(answersByQuestionId, questions);
    console.log('Mapped features for ML model:', features);

    const result = await assessDiabetesRiskPython(features);
    console.log('ML model result:', result);

    // Persist latest assessment summary on the user for dashboard insights
    try {
      const riskLevelRaw = result?.risk_level || 'low';
      const probabilityRaw = result?.diabetes_probability ?? 0;

      await User.findByIdAndUpdate(userId, {
        last_assessment_risk_level: typeof riskLevelRaw === 'string' ? riskLevelRaw : String(riskLevelRaw),
        last_assessment_probability: Number(probabilityRaw) || 0,
        last_assessment_at: new Date(),
        // Reset popup handled flag so the new assessment can trigger a fresh prompt
        last_assessment_popup_handled_at: null,
      });
    } catch (persistErr) {
      console.error('Failed to persist latest assessment summary on user:', persistErr);
    }

    // Check if the result contains an error
    if (result.error) {
      console.error('ML model returned error:', result.error);
      return res.status(500).json({ 
        success: false, 
        message: 'Assessment failed', 
        error: result.error,
        details: 'The machine learning model encountered an error during processing'
      });
    }

    return res.status(200).json({ success: true, data: { features, result } });
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





