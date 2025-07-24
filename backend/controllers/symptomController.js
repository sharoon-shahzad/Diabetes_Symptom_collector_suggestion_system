import { Symptom } from '../models/Symptom.js';

// Get all symptoms for a disease
export const getSymptomsByDisease = async (req, res) => {
  try {
    const { diseaseId } = req.params;
    const symptoms = await Symptom.find({ disease_id: diseaseId });
    res.json(symptoms);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching symptoms', error: err.message });
  }
};

// Add a symptom to a disease
export const addSymptom = async (req, res) => {
  try {
    const { diseaseId } = req.params;
    const { name, description } = req.body;
    const newSymptom = new Symptom({ name, description, disease_id: diseaseId });
    await newSymptom.save();
    res.status(201).json(newSymptom);
  } catch (err) {
    res.status(500).json({ message: 'Error adding symptom', error: err.message });
  }
};

// Update a symptom
export const updateSymptom = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const updatedSymptom = await Symptom.findByIdAndUpdate(
      id,
      { name, description },
      { new: true }
    );
    if (!updatedSymptom) {
      return res.status(404).json({ message: 'Symptom not found' });
    }
    res.json(updatedSymptom);
  } catch (err) {
    res.status(500).json({ message: 'Error updating symptom', error: err.message });
  }
};

// Delete a symptom
export const deleteSymptom = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedSymptom = await Symptom.findByIdAndDelete(id);
    if (!deletedSymptom) {
      return res.status(404).json({ message: 'Symptom not found' });
    }
    res.json({ message: 'Symptom deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting symptom', error: err.message });
  }
}; 