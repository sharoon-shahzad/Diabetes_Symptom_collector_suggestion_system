import { Question } from "../models/Question.js";
import { Symptom } from "../models/Symptom.js";
import { Answer } from '../models/Answer.js';
import { QuestionsAnswers } from '../models/Questions_Answers.js';
import { UsersAnswers } from '../models/Users_Answers.js';
import mongoose from "mongoose";

// Get all questions for a disease (populate symptom)
export const getQuestionsByDisease = async (req, res) => {
  try {
    const { diseaseId } = req.params;
    const questions = await Question.find({ disease: diseaseId });
    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: "Error fetching questions", error: err.message });
  }
};

// Get all symptoms for a disease
export const getSymptomsByDisease = async (req, res) => {
  try {
    const { diseaseId } = req.params;
    console.log('Fetching symptoms for diseaseId:', diseaseId);
    // Query using the string directly
    const symptoms = await Symptom.find({ disease_id: diseaseId });
    res.json(symptoms);
  } catch (err) {
    console.error('Error in getSymptomsByDisease:', err);
    res.status(500).json({ message: "Error fetching symptoms", error: err.message });
  }
};

// Get all questions for a symptom
export const getQuestionsBySymptom = async (req, res) => {
  try {
    const { symptomId } = req.params;
    const questions = await Question.find({ symptom_id: symptomId, deleted_at: null });
    res.status(200).json({ success: true, data: questions });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching questions for symptom', error: err.message });
  }
};

// Add a question to a symptom (stub)
export const addQuestion = async (req, res) => {
  res.status(501).json({ message: 'Not implemented' });
};

// Update a question (stub)
export const updateQuestion = async (req, res) => {
  res.status(501).json({ message: 'Not implemented' });
};

// Delete a question (stub)
export const deleteQuestion = async (req, res) => {
  res.status(501).json({ message: 'Not implemented' });
};

// Save user's answer for onboarding
export const saveUserAnswer = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { questionId, answerText } = req.body;
    if (!userId) return res.status(401).json({ message: 'Not authenticated' });
    if (!questionId || !answerText) return res.status(400).json({ message: 'Missing questionId or answerText' });

    // 1. Find or create the answer
    let answer = await Answer.findOne({ answer_text: answerText, deleted_at: null });
    if (!answer) {
      answer = await Answer.create({ answer_text: answerText });
    }

    // 2. Ensure Questions_Answers entry exists
    let qa = await QuestionsAnswers.findOne({ question_id: questionId, answer_id: answer._id, deleted_at: null });
    if (!qa) {
      qa = await QuestionsAnswers.create({ question_id: questionId, answer_id: answer._id });
    }

    // 3. Create Users_Answers entry
    const ua = await UsersAnswers.create({ user_id: userId, question_id: questionId, answer_id: answer._id });

    return res.status(201).json({ success: true, message: 'Answer saved', answerId: answer._id });
  } catch (err) {
    console.error('Error saving user answer:', err);
    res.status(500).json({ success: false, message: 'Error saving answer', error: err.message });
  }
}; 