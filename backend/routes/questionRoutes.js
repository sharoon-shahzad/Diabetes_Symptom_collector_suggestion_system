const express = require("express");
const { 
  getQuestionsByDisease, 
  getSymptomsByDisease,
  getQuestionsBySymptom
} = require("../controllers/questionController.js");

const router = express.Router();

// Get all questions for a disease
router.get("/questions/:diseaseId", getQuestionsByDisease);

// Get all symptoms for a disease
router.get("/symptoms/:diseaseId", getSymptomsByDisease);

// Get all questions for a symptom
router.get("/questions/symptom/:symptomId", getQuestionsBySymptom);

module.exports = router; 