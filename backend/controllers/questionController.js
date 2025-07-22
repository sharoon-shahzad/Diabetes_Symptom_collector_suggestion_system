const { Question } = require("../models/Question.js");
const { Symptom } = require("../models/Symptom.js");

// Get all questions for a disease (populate symptom)
exports.getQuestionsByDisease = async (req, res) => {
  try {
    const { diseaseId } = req.params;
    const questions = await Question.find({ disease: diseaseId });
    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: "Error fetching questions", error: err.message });
  }
};

// Get all symptoms for a disease
exports.getSymptomsByDisease = async (req, res) => {
  try {
    const { diseaseId } = req.params;
    const symptoms = await Symptom.find({ disease_id: diseaseId });
    res.json(symptoms);
  } catch (err) {
    res.status(500).json({ message: "Error fetching symptoms", error: err.message });
  }
};

// Get all questions for a symptom
exports.getQuestionsBySymptom = async (req, res) => {
  try {
    const { symptomId } = req.params;
    const questions = await Question.find({ symptom_id: symptomId, deleted_at: null });
    res.status(200).json({ success: true, data: questions });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching questions for symptom', error: err.message });
  }
}; 