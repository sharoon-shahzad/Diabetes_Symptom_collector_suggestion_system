import mongoose from "mongoose";

const userSymptomLogSchema = new mongoose.Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    symptom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Symptom',
      required: true
    },
    severity: { type: String, enum: ['mild', 'moderate', 'severe'] },
    log_date: { type: Date, default: Date.now },
    notes: { type: String }
  }, { timestamps: true });
  
  export const UserSymptomLog = mongoose.model('UserSymptomLog', userSymptomLogSchema);
  