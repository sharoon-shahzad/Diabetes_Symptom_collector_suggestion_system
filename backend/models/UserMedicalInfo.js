import mongoose from 'mongoose';
import encryptionService from '../services/encryptionService.js';

const userMedicalInfoSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },
    diabetes_type: {
        type: mongoose.Schema.Types.Mixed, // Encrypted
    },
    diagnosis_date: {
        type: mongoose.Schema.Types.Mixed, // Can be encrypted string or Date
    },
    current_medications: [{
        medication_name: {
            type: mongoose.Schema.Types.Mixed, // Encrypted
        },
        dosage: {
            type: mongoose.Schema.Types.Mixed, // Encrypted
        },
        frequency: {
            type: mongoose.Schema.Types.Mixed, // Encrypted
        },
    }],
    allergies: [{
        allergen: {
            type: mongoose.Schema.Types.Mixed, // Encrypted
        },
        reaction: {
            type: mongoose.Schema.Types.Mixed, // Encrypted
        },
    }],
    chronic_conditions: [{
        condition_name: {
            type: mongoose.Schema.Types.Mixed, // Encrypted
        },
        diagnosed_date: {
            type: mongoose.Schema.Types.Mixed, // Encrypted
        },
    }],
    family_history: [{
        relation: {
            type: mongoose.Schema.Types.Mixed, // Encrypted
        },
        condition: {
            type: mongoose.Schema.Types.Mixed, // Encrypted
        },
    }],
    recent_lab_results: {
        hba1c: {
            value: {
                type: mongoose.Schema.Types.Mixed, // Encrypted
            },
            date: {
                type: mongoose.Schema.Types.Mixed, // Encrypted
            },
            unit: {
                type: mongoose.Schema.Types.Mixed, // Encrypted
                default: '%',
            },
        },
        fasting_glucose: {
            value: {
                type: mongoose.Schema.Types.Mixed, // Encrypted
            },
            date: {
                type: mongoose.Schema.Types.Mixed, // Encrypted
            },
            unit: {
                type: mongoose.Schema.Types.Mixed, // Encrypted
                default: 'mg/dL',
            },
        },
        cholesterol: {
            total: {
                type: mongoose.Schema.Types.Mixed, // Encrypted
            },
            ldl: {
                type: mongoose.Schema.Types.Mixed, // Encrypted
            },
            hdl: {
                type: mongoose.Schema.Types.Mixed, // Encrypted
            },
            date: {
                type: mongoose.Schema.Types.Mixed, // Encrypted
            },
            unit: {
                type: mongoose.Schema.Types.Mixed, // Encrypted
                default: 'mg/dL',
            },
        },
    },
    blood_pressure: {
        systolic: {
            type: mongoose.Schema.Types.Mixed, // Encrypted
        },
        diastolic: {
            type: mongoose.Schema.Types.Mixed, // Encrypted
        },
        last_recorded: {
            type: mongoose.Schema.Types.Mixed, // Encrypted
        },
    },
    last_medical_checkup: {
        type: mongoose.Schema.Types.Mixed, // Encrypted
    },
}, { timestamps: true });

/**
 * ENCRYPTION MIDDLEWARE - Pre-save hook
 * Encrypts sensitive medical information before saving to database
 * Encrypted fields:
 * - current_medications (medication_name)
 * - allergies (allergen, reaction)
 * - chronic_conditions (condition_name)
 * - family_history (relation, condition)
 * - recent_lab_results (all numeric values)
 * - blood_pressure (systolic, diastolic)
 */
userMedicalInfoSchema.pre('save', function (next) {
  try {
    console.log('🔐 [UserMedicalInfo] Pre-save encryption middleware triggered');
    console.log('  - diabetes_type:', this.diabetes_type);
    console.log('  - diagnosis_date:', this.diagnosis_date);
    console.log('  - current_medications:', this.current_medications?.length || 0, 'items');
    console.log('  - allergies:', this.allergies?.length || 0, 'items');
    console.log('  - chronic_conditions:', this.chronic_conditions?.length || 0, 'items');
    console.log('  - family_history:', this.family_history?.length || 0, 'items');
    console.log('  - blood_pressure:', this.blood_pressure);
    console.log('  - last_medical_checkup:', this.last_medical_checkup);

    // Encrypt diabetes type
    if (this.diabetes_type) {
      const encrypted = encryptionService.encrypt(this.diabetes_type);
      console.log('  ✅ Encrypted diabetes_type');
      this.diabetes_type = encrypted;
    }

    // Encrypt diagnosis date
    if (this.diagnosis_date) {
      const dateStr = this.diagnosis_date instanceof Date
        ? this.diagnosis_date.toISOString()
        : this.diagnosis_date;
      const encrypted = encryptionService.encrypt(dateStr);
      console.log('  ✅ Encrypted diagnosis_date');
      this.diagnosis_date = encrypted;
    }

    // Encrypt medications
    if (this.current_medications && Array.isArray(this.current_medications)) {
      this.current_medications = this.current_medications.map((med) => {
        const medObj = med.toObject ? med.toObject() : med;
        console.log('  - Encrypting medication:', medObj.medication_name);
        return {
          ...medObj,
          medication_name: medObj.medication_name
            ? encryptionService.encrypt(medObj.medication_name)
            : medObj.medication_name,
          dosage: medObj.dosage ? encryptionService.encrypt(medObj.dosage) : medObj.dosage,
          frequency: medObj.frequency ? encryptionService.encrypt(medObj.frequency) : medObj.frequency,
        };
      });
    }

    // Encrypt allergies
    if (this.allergies && Array.isArray(this.allergies)) {
      this.allergies = this.allergies.map((allergy) => {
        const allergyObj = allergy.toObject ? allergy.toObject() : allergy;
        return {
          ...allergyObj,
          allergen: allergyObj.allergen
            ? encryptionService.encrypt(allergyObj.allergen)
            : allergyObj.allergen,
          reaction: allergyObj.reaction
            ? encryptionService.encrypt(allergyObj.reaction)
            : allergyObj.reaction,
        };
      });
    }

    // Encrypt chronic conditions
    if (this.chronic_conditions && Array.isArray(this.chronic_conditions)) {
      this.chronic_conditions = this.chronic_conditions.map((condition) => {
        const condObj = condition.toObject ? condition.toObject() : condition;
        const diagnosedDate = condObj.diagnosed_date instanceof Date
          ? condObj.diagnosed_date.toISOString()
          : condObj.diagnosed_date;
        return {
          ...condObj,
          condition_name: condObj.condition_name
            ? encryptionService.encrypt(condObj.condition_name)
            : condObj.condition_name,
          diagnosed_date: condObj.diagnosed_date
            ? encryptionService.encrypt(diagnosedDate)
            : condObj.diagnosed_date,
        };
      });
    }

    // Encrypt family history
    if (this.family_history && Array.isArray(this.family_history)) {
      this.family_history = this.family_history.map((history) => {
        const histObj = history.toObject ? history.toObject() : history;
        return {
          ...histObj,
          relation: histObj.relation ? encryptionService.encrypt(histObj.relation) : histObj.relation,
          condition: histObj.condition
            ? encryptionService.encrypt(histObj.condition)
            : histObj.condition,
        };
      });
    }

    // Encrypt lab results (ALL fields including dates and units)
    if (this.recent_lab_results) {
      if (this.recent_lab_results.hba1c) {
        const hba1c = this.recent_lab_results.hba1c;
        if (hba1c.value) {
          const encrypted = encryptionService.encrypt(hba1c.value);
          console.log('  ✅ Encrypted hba1c.value');
          hba1c.value = encrypted;
        }
        if (hba1c.date) {
          const dateStr = hba1c.date instanceof Date ? hba1c.date.toISOString() : hba1c.date;
          hba1c.date = encryptionService.encrypt(dateStr);
          console.log('  ✅ Encrypted hba1c.date');
        }
        if (hba1c.unit) {
          hba1c.unit = encryptionService.encrypt(hba1c.unit);
          console.log('  ✅ Encrypted hba1c.unit');
        }
      }

      if (this.recent_lab_results.fasting_glucose) {
        const fg = this.recent_lab_results.fasting_glucose;
        if (fg.value) {
          const encrypted = encryptionService.encrypt(fg.value);
          console.log('  ✅ Encrypted fasting_glucose.value');
          fg.value = encrypted;
        }
        if (fg.date) {
          const dateStr = fg.date instanceof Date ? fg.date.toISOString() : fg.date;
          fg.date = encryptionService.encrypt(dateStr);
          console.log('  ✅ Encrypted fasting_glucose.date');
        }
        if (fg.unit) {
          fg.unit = encryptionService.encrypt(fg.unit);
          console.log('  ✅ Encrypted fasting_glucose.unit');
        }
      }

      if (this.recent_lab_results.cholesterol) {
        const chol = this.recent_lab_results.cholesterol;
        if (chol.total) {
          chol.total = encryptionService.encrypt(chol.total);
          console.log('  ✅ Encrypted cholesterol.total');
        }
        if (chol.ldl) {
          chol.ldl = encryptionService.encrypt(chol.ldl);
          console.log('  ✅ Encrypted cholesterol.ldl');
        }
        if (chol.hdl) {
          chol.hdl = encryptionService.encrypt(chol.hdl);
          console.log('  ✅ Encrypted cholesterol.hdl');
        }
        if (chol.date) {
          const dateStr = chol.date instanceof Date ? chol.date.toISOString() : chol.date;
          chol.date = encryptionService.encrypt(dateStr);
          console.log('  ✅ Encrypted cholesterol.date');
        }
        if (chol.unit) {
          chol.unit = encryptionService.encrypt(chol.unit);
          console.log('  ✅ Encrypted cholesterol.unit');
        }
      }
    }

    // Encrypt blood pressure readings (ALL fields)
    if (this.blood_pressure) {
      if (this.blood_pressure.systolic) {
        const encrypted = encryptionService.encrypt(this.blood_pressure.systolic);
        console.log('  ✅ Encrypted blood_pressure.systolic');
        this.blood_pressure.systolic = encrypted;
      }
      if (this.blood_pressure.diastolic) {
        const encrypted = encryptionService.encrypt(this.blood_pressure.diastolic);
        console.log('  ✅ Encrypted blood_pressure.diastolic');
        this.blood_pressure.diastolic = encrypted;
      }
      if (this.blood_pressure.last_recorded) {
        const dateStr = this.blood_pressure.last_recorded instanceof Date
          ? this.blood_pressure.last_recorded.toISOString()
          : this.blood_pressure.last_recorded;
        this.blood_pressure.last_recorded = encryptionService.encrypt(dateStr);
        console.log('  ✅ Encrypted blood_pressure.last_recorded');
      }
    }

    // Encrypt last medical checkup
    if (this.last_medical_checkup) {
      const dateStr = this.last_medical_checkup instanceof Date
        ? this.last_medical_checkup.toISOString()
        : this.last_medical_checkup;
      const encrypted = encryptionService.encrypt(dateStr);
      console.log('  ✅ Encrypted last_medical_checkup');
      this.last_medical_checkup = encrypted;
    }

    console.log('✅ [UserMedicalInfo] Encryption complete');
    next();
  } catch (error) {
    console.error('❌ [UserMedicalInfo] Encryption error:', error.message);
    console.error(error);
    next(error);
  }
});

/**
 * DECRYPTION MIDDLEWARE - Post-save hook
 */
userMedicalInfoSchema.post('save', function (doc) {
  decryptMedicalInfo(doc);
});

/**
 * DECRYPTION MIDDLEWARE - Post-findOne hook
 */
userMedicalInfoSchema.post('findOne', function (doc) {
  decryptMedicalInfo(doc);
});

/**
 * DECRYPTION MIDDLEWARE - Post-find hook
 */
userMedicalInfoSchema.post('find', function (docs) {
  if (Array.isArray(docs)) {
    docs.forEach((doc) => decryptMedicalInfo(doc));
  }
});

/**
 * DECRYPTION MIDDLEWARE - Post-findOneAndUpdate hook
 */
userMedicalInfoSchema.post('findOneAndUpdate', function (doc) {
  decryptMedicalInfo(doc);
});

/**
 * Helper function to decrypt all medical information
 */
function decryptMedicalInfo(doc) {
  if (!doc) return;

  try {
    // Decrypt diabetes type
    if (doc.diabetes_type && encryptionService.isEncrypted(doc.diabetes_type)) {
      doc.diabetes_type = encryptionService.decrypt(doc.diabetes_type);
    }

    // Decrypt diagnosis date
    if (doc.diagnosis_date && encryptionService.isEncrypted(doc.diagnosis_date)) {
      doc.diagnosis_date = new Date(encryptionService.decrypt(doc.diagnosis_date));
    }

    // Decrypt medications
    if (doc.current_medications && Array.isArray(doc.current_medications)) {
      doc.current_medications = doc.current_medications.map((med) => ({
        ...med,
        medication_name:
          med.medication_name && encryptionService.isEncrypted(med.medication_name)
            ? encryptionService.decrypt(med.medication_name)
            : med.medication_name,
        dosage:
          med.dosage && encryptionService.isEncrypted(med.dosage)
            ? encryptionService.decrypt(med.dosage)
            : med.dosage,
        frequency:
          med.frequency && encryptionService.isEncrypted(med.frequency)
            ? encryptionService.decrypt(med.frequency)
            : med.frequency,
      }));
    }

    // Decrypt allergies
    if (doc.allergies && Array.isArray(doc.allergies)) {
      doc.allergies = doc.allergies.map((allergy) => ({
        ...allergy,
        allergen:
          allergy.allergen && encryptionService.isEncrypted(allergy.allergen)
            ? encryptionService.decrypt(allergy.allergen)
            : allergy.allergen,
        reaction:
          allergy.reaction && encryptionService.isEncrypted(allergy.reaction)
            ? encryptionService.decrypt(allergy.reaction)
            : allergy.reaction,
      }));
    }

    // Decrypt chronic conditions
    if (doc.chronic_conditions && Array.isArray(doc.chronic_conditions)) {
      doc.chronic_conditions = doc.chronic_conditions.map((condition) => ({
        ...condition,
        condition_name:
          condition.condition_name && encryptionService.isEncrypted(condition.condition_name)
            ? encryptionService.decrypt(condition.condition_name)
            : condition.condition_name,
        diagnosed_date:
          condition.diagnosed_date && encryptionService.isEncrypted(condition.diagnosed_date)
            ? new Date(encryptionService.decrypt(condition.diagnosed_date))
            : condition.diagnosed_date,
      }));
    }

    // Decrypt family history
    if (doc.family_history && Array.isArray(doc.family_history)) {
      doc.family_history = doc.family_history.map((history) => ({
        ...history,
        relation:
          history.relation && encryptionService.isEncrypted(history.relation)
            ? encryptionService.decrypt(history.relation)
            : history.relation,
        condition:
          history.condition && encryptionService.isEncrypted(history.condition)
            ? encryptionService.decrypt(history.condition)
            : history.condition,
      }));
    }

    // Decrypt lab results (ALL fields including dates and units)
    if (doc.recent_lab_results) {
      if (doc.recent_lab_results.hba1c) {
        const hba1c = doc.recent_lab_results.hba1c;
        if (hba1c.value) {
          const val = hba1c.value;
          hba1c.value = encryptionService.isEncrypted(val) ? parseFloat(encryptionService.decrypt(val)) : val;
        }
        if (hba1c.date) {
          const val = hba1c.date;
          hba1c.date = encryptionService.isEncrypted(val) ? new Date(encryptionService.decrypt(val)) : val;
        }
        if (hba1c.unit) {
          const val = hba1c.unit;
          hba1c.unit = encryptionService.isEncrypted(val) ? encryptionService.decrypt(val) : val;
        }
      }

      if (doc.recent_lab_results.fasting_glucose) {
        const fg = doc.recent_lab_results.fasting_glucose;
        if (fg.value) {
          const val = fg.value;
          fg.value = encryptionService.isEncrypted(val) ? parseFloat(encryptionService.decrypt(val)) : val;
        }
        if (fg.date) {
          const val = fg.date;
          fg.date = encryptionService.isEncrypted(val) ? new Date(encryptionService.decrypt(val)) : val;
        }
        if (fg.unit) {
          const val = fg.unit;
          fg.unit = encryptionService.isEncrypted(val) ? encryptionService.decrypt(val) : val;
        }
      }

      if (doc.recent_lab_results.cholesterol) {
        const chol = doc.recent_lab_results.cholesterol;
        if (chol.total) {
          const val = chol.total;
          chol.total = encryptionService.isEncrypted(val) ? parseFloat(encryptionService.decrypt(val)) : val;
        }
        if (chol.ldl) {
          const val = chol.ldl;
          chol.ldl = encryptionService.isEncrypted(val) ? parseFloat(encryptionService.decrypt(val)) : val;
        }
        if (chol.hdl) {
          const val = chol.hdl;
          chol.hdl = encryptionService.isEncrypted(val) ? parseFloat(encryptionService.decrypt(val)) : val;
        }
        if (chol.date) {
          const val = chol.date;
          chol.date = encryptionService.isEncrypted(val) ? new Date(encryptionService.decrypt(val)) : val;
        }
        if (chol.unit) {
          const val = chol.unit;
          chol.unit = encryptionService.isEncrypted(val) ? encryptionService.decrypt(val) : val;
        }
      }
    }

    // Decrypt blood pressure (ALL fields)
    if (doc.blood_pressure) {
      if (doc.blood_pressure.systolic) {
        const val = doc.blood_pressure.systolic;
        doc.blood_pressure.systolic = encryptionService.isEncrypted(val)
          ? parseFloat(encryptionService.decrypt(val))
          : val;
      }
      if (doc.blood_pressure.diastolic) {
        const val = doc.blood_pressure.diastolic;
        doc.blood_pressure.diastolic = encryptionService.isEncrypted(val)
          ? parseFloat(encryptionService.decrypt(val))
          : val;
      }
      if (doc.blood_pressure.last_recorded) {
        const val = doc.blood_pressure.last_recorded;
        doc.blood_pressure.last_recorded = encryptionService.isEncrypted(val)
          ? new Date(encryptionService.decrypt(val))
          : val;
      }
    }

    // Decrypt last medical checkup
    if (doc.last_medical_checkup && encryptionService.isEncrypted(doc.last_medical_checkup)) {
      doc.last_medical_checkup = new Date(encryptionService.decrypt(doc.last_medical_checkup));
    }
  } catch (error) {
    console.error('Decryption error in medical info:', error.message);
  }
}

export const UserMedicalInfo = mongoose.model('UserMedicalInfo', userMedicalInfoSchema);
