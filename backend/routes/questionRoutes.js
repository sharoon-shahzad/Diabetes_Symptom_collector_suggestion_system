const express = require("express");
const { getQuestionsByDisease, getSymptomsByDisease } = require("../controllers/questionController.js");

const router = express.Router();

// Get all questions for a disease
router.get("/questions/:diseaseId", getQuestionsByDisease);

// Get all symptoms for a disease
router.get("/symptoms/:diseaseId", getSymptomsByDisease);

module.exports = router; 