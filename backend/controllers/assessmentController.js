import { UsersAnswers } from '../models/Users_Answers.js';
import { Question } from '../models/Question.js';
import { Symptom } from '../models/Symptom.js';
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

  const symptomNameToFeature = {
    'Frequent Urination (Polyuria)': 'Polyuria',
    'Excessive Thirst (Polydipsia)': 'Polydipsia',
    'Unexplained Weight Loss': 'sudden weight loss',
    'Fatigue / Tiredness': 'weakness',
    'Increased Hunger (Polyphagia)': 'Polyphagia',
    'Frequent Infections': 'Genital thrush',
    'Blurred Vision': 'visual blurring',
    'Very Dry Skin': 'Itching',
    'Irritability / Mood Changes': 'Irritability',
    'Slow Healing Wounds': 'delayed healing',
    'Muscle Weakness': 'partial paresis',
    'Muscle Stiffness / Cramps': 'muscle stiffness',
    'Hair Loss / Thinning': 'Alopecia',
  };

  for (const q of questions) {
    const ans = answersByQuestionId.get(String(q._id));
    if (!ans) continue;
    const text = (ans.answer_id?.answer_text || '').toString().trim();

    // Age and Gender and Obesity come from General Health category questions seeded under symptom General Health
    if (/what is your age\?/i.test(q.question_text)) {
      const num = parseInt(text, 10);
      if (!Number.isNaN(num)) features.Age = num;
      continue;
    }
    if (/what is your biological sex\?/i.test(q.question_text)) {
      features.Gender = /male/i.test(text) ? 1 : 0;
      continue;
    }
    if (/are you obese|bmi|weight|height/i.test(q.question_text)) {
      // Simple heuristic: explicit Yes/No obesity question preferred
      if (/yes/i.test(text)) features.Obesity = 1;
      if (/no/i.test(text)) features.Obesity = 0;
      continue;
    }

    // Map symptom presence yes/no from symptom name
    if (q.symptom_id && q.symptom_id.name) {
      const featureName = symptomNameToFeature[q.symptom_id.name];
      if (featureName) {
        features[featureName] = /yes|often|severe|every/i.test(text) ? 1 : 0;
      }
    }
  }

  return features;
}

export const assessDiabetes = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ success: false, message: 'Not authenticated' });

    // Load user's latest answers with populated question and symptom
    const userAnswers = await UsersAnswers.find({ user_id: userId, deleted_at: null })
      .populate({ path: 'question_id', model: 'Question', populate: { path: 'symptom_id', model: 'Symptom' } })
      .populate({ path: 'answer_id', model: 'Answer' });

    const questions = userAnswers.map(ua => ua.question_id).filter(Boolean);
    const answersByQuestionId = new Map(userAnswers.map(ua => [String(ua.question_id?._id), ua]));

    const features = mapAnswersToFeatures(answersByQuestionId, questions);

    const result = await assessDiabetesRiskPython(features);

    return res.status(200).json({ success: true, data: { features, result } });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Assessment failed', error: err.message });
  }
};





