const express = require('express');
const { getAllDiseases } = require('../controllers/diseaseController.js');

const router = express.Router();

// Get all diseases
router.get('/', getAllDiseases);

module.exports = router; 