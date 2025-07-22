const { Disease } = require('../models/Disease.js');

// Get all diseases
const getAllDiseases = async (req, res) => {
  try {
    const diseases = await Disease.find({ deleted_at: null });
    res.status(200).json({ success: true, data: diseases });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching diseases', error: err.message });
  }
};

module.exports = { getAllDiseases }; 