import mongoose from 'mongoose';
import encryptionService from '../services/encryptionService.js';

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    phone_number: {
        type: String,
    },
    country: {
        type: String,
        required: false,
        trim: true,
    },
    country_code: {
        type: String,
        trim: true,
    },
    whatsapp_number: {
        type: String,
    },
    isActivated: {
        type: Boolean,
        default: false,
    },
    diabetes_diagnosed: {
        type: String,
        enum: ['yes', 'no', null],
        default: null, // null means not yet answered
    },
    diabetes_diagnosed_answered_at: {
        type: Date,
    },
    activationToken: {
        type: String,
    },
    activationTokenExpires: {
        type: Date,
    },
    refreshToken: {
        type: String,
    },
    resetPasswordToken: {
        type: String,
    },
    resetPasswordExpires: {
        type: Date,
    },
    deleted_at: {
        type: Date,
        default: null,
    },
    onboardingCompleted: {
        type: Boolean,
        default: false,
    },
    onboardingCompletedAt: {
        type: Date,
    },
    // New fields for disease data editing window
    diseaseDataSubmittedAt: {
        type: Date,
    },
    diseaseDataEditingExpiresAt: {
        type: Date,
    },
    diseaseDataStatus: {
        type: String,
        enum: ['draft', 'submitted'],
        default: 'draft',
    },
    // Latest diabetes risk assessment summary
    last_assessment_risk_level: {
        type: String,
    },
    last_assessment_probability: {
        type: Number,
    },
    last_assessment_at: {
        type: Date,
    },
    last_assessment_popup_handled_at: {
        type: Date,
    },
}, { timestamps: true });

// Add index for onboarding completion check
userSchema.index({ _id: 1, onboardingCompleted: 1 });

/**
 * ENCRYPTION MIDDLEWARE - Pre-save hook
 * Encrypts sensitive PII before saving to database
 * Fields encrypted: phone_number, whatsapp_number
 */
userSchema.pre('save', function (next) {
  try {
    if (this.phone_number && !encryptionService.isEncrypted(this.phone_number)) {
      this.phone_number = encryptionService.encrypt(this.phone_number);
    }
    if (this.whatsapp_number && !encryptionService.isEncrypted(this.whatsapp_number)) {
      this.whatsapp_number = encryptionService.encrypt(this.whatsapp_number);
    }
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * DECRYPTION MIDDLEWARE - Post-save hook
 * Decrypts sensitive fields after save (for immediate use in response)
 */
userSchema.post('save', function (doc) {
  try {
    if (doc.phone_number && encryptionService.isEncrypted(doc.phone_number)) {
      doc.phone_number = encryptionService.decrypt(doc.phone_number);
    }
    if (doc.whatsapp_number && encryptionService.isEncrypted(doc.whatsapp_number)) {
      doc.whatsapp_number = encryptionService.decrypt(doc.whatsapp_number);
    }
  } catch (error) {
    console.error('Decryption error in post-save:', error.message);
  }
});

/**
 * DECRYPTION MIDDLEWARE - Post-findOne hook
 * Decrypts sensitive fields after querying single document
 */
userSchema.post('findOne', function (doc) {
  try {
    if (doc) {
      console.log('🔓 [User] Post-findOne decryption triggered');
      if (doc.phone_number) {
        console.log('  - phone_number:', String(doc.phone_number).substring(0, 50), 'isEncrypted:', encryptionService.isEncrypted(doc.phone_number));
        if (encryptionService.isEncrypted(doc.phone_number)) {
          doc.phone_number = encryptionService.decrypt(doc.phone_number);
          console.log('  ✅ Decrypted phone_number');
        }
      }
      if (doc.whatsapp_number && encryptionService.isEncrypted(doc.whatsapp_number)) {
        doc.whatsapp_number = encryptionService.decrypt(doc.whatsapp_number);
      }
    }
  } catch (error) {
    console.error('❌ Decryption error in post-findOne:', error.message);
  }
});

/**
 * DECRYPTION MIDDLEWARE - Post-findById hook (same as findOne but explicit)
 */
userSchema.post('findById', function (doc) {
  try {
    if (doc) {
      console.log('🔓 [User] Post-findById decryption triggered');
      if (doc.phone_number) {
        console.log('  - phone_number:', String(doc.phone_number).substring(0, 50));
        if (encryptionService.isEncrypted(doc.phone_number)) {
          doc.phone_number = encryptionService.decrypt(doc.phone_number);
          console.log('  ✅ Decrypted phone_number in findById');
        }
      }
      if (doc.whatsapp_number && encryptionService.isEncrypted(doc.whatsapp_number)) {
        doc.whatsapp_number = encryptionService.decrypt(doc.whatsapp_number);
      }
    }
  } catch (error) {
    console.error('❌ Decryption error in post-findById:', error.message);
  }
});

/**
 * DECRYPTION MIDDLEWARE - Post-find hook
 * Decrypts sensitive fields after querying multiple documents
 */
userSchema.post('find', function (docs) {
  try {
    if (Array.isArray(docs)) {
      docs.forEach((doc) => {
        if (doc.phone_number && encryptionService.isEncrypted(doc.phone_number)) {
          doc.phone_number = encryptionService.decrypt(doc.phone_number);
        }
        if (doc.whatsapp_number && encryptionService.isEncrypted(doc.whatsapp_number)) {
          doc.whatsapp_number = encryptionService.decrypt(doc.whatsapp_number);
        }
      });
    }
  } catch (error) {
    console.error('Decryption error in post-find:', error.message);
  }
});

/**
 * DECRYPTION MIDDLEWARE - Post-findOneAndUpdate hook
 * Decrypts sensitive fields after findOneAndUpdate
 */
userSchema.post('findOneAndUpdate', function (doc) {
  try {
    if (doc) {
      if (doc.phone_number && encryptionService.isEncrypted(doc.phone_number)) {
        doc.phone_number = encryptionService.decrypt(doc.phone_number);
      }
      if (doc.whatsapp_number && encryptionService.isEncrypted(doc.whatsapp_number)) {
        doc.whatsapp_number = encryptionService.decrypt(doc.whatsapp_number);
      }
    }
  } catch (error) {
    console.error('Decryption error in post-findOneAndUpdate:', error.message);
  }
});

export const User = mongoose.model('User', userSchema);