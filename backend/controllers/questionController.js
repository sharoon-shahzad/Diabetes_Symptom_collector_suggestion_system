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
    const symptoms = await Symptom.find({ disease: diseaseId });
    res.json(symptoms);
  } catch (err) {
    res.status(500).json({ message: "Error fetching symptoms", error: err.message });
  }
}; 