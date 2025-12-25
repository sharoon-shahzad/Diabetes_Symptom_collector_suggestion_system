import mongoose from 'mongoose';
import encryptionService from '../services/encryptionService.js';

const userPersonalInfoSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },
    date_of_birth: {
        type: mongoose.Schema.Types.Mixed, // Can be encrypted string or Date
    },
    gender: {
        type: mongoose.Schema.Types.Mixed, // Encrypted: can be string or encrypted value
    },
    height: {
        type: mongoose.Schema.Types.Mixed, // Can be encrypted string or number
    },
    weight: {
        type: mongoose.Schema.Types.Mixed, // Can be encrypted string or number
    },
    activity_level: {
        type: mongoose.Schema.Types.Mixed, // Encrypted: can be string or encrypted value
    },
    dietary_preference: {
        type: mongoose.Schema.Types.Mixed, // Encrypted: can be string or encrypted value
    },
    smoking_status: {
        type: mongoose.Schema.Types.Mixed, // Encrypted: can be string or encrypted value
    },
    alcohol_use: {
        type: mongoose.Schema.Types.Mixed, // Encrypted: can be string or encrypted value
    },
    sleep_hours: {
        type: mongoose.Schema.Types.Mixed, // Encrypted: average hours per night
    },
    emergency_contact: {
        name: {
            type: mongoose.Schema.Types.Mixed, // Encrypted
        },
        phone: {
            type: mongoose.Schema.Types.Mixed, // Encrypted
        },
        relationship: {
            type: mongoose.Schema.Types.Mixed, // Encrypted
        },
    },
    address: {
        street: {
            type: mongoose.Schema.Types.Mixed, // Encrypted
        },
        city: {
            type: mongoose.Schema.Types.Mixed, // Encrypted
        },
        state: {
            type: mongoose.Schema.Types.Mixed, // Encrypted
        },
        zip_code: {
            type: mongoose.Schema.Types.Mixed, // Encrypted
        },
        country: {
            type: mongoose.Schema.Types.Mixed, // Encrypted
        },
    },
}, { timestamps: true });

/**
 * ENCRYPTION MIDDLEWARE - Pre-save hook
 * Encrypts sensitive personally identifiable information before saving
 * Encrypted fields:
 * - date_of_birth (sensitive health-related PII)
 * - height, weight (sensitive health metrics)
 * - address (street, city, state, zip - full address)
 * - emergency_contact (name, phone)
 */
userPersonalInfoSchema.pre('save', function (next) {
  try {
    console.log('🔐 [UserPersonalInfo] Pre-save encryption middleware triggered');
    console.log('  - date_of_birth:', this.date_of_birth, 'Type:', typeof this.date_of_birth);
    console.log('  - height:', this.height, 'Type:', typeof this.height);
    console.log('  - weight:', this.weight, 'Type:', typeof this.weight);

    // Encrypt date of birth
    if (this.date_of_birth) {
      // Handle both Date objects and string dates
      const dateValue = typeof this.date_of_birth === 'string' 
        ? this.date_of_birth 
        : this.date_of_birth.toISOString();
      const encrypted = encryptionService.encrypt(dateValue);
      console.log('  ✅ Encrypted date_of_birth:', encrypted.substring(0, 20) + '...');
      this.date_of_birth = encrypted;
    }

    // Encrypt gender
    if (this.gender) {
      const encrypted = encryptionService.encrypt(this.gender);
      console.log('  ✅ Encrypted gender');
      this.gender = encrypted;
    }

    // Encrypt height and weight (sensitive health metrics)
    if (this.height) {
      const encrypted = encryptionService.encrypt(this.height);
      console.log('  ✅ Encrypted height:', encrypted.substring(0, 20) + '...');
      this.height = encrypted;
    }
    if (this.weight) {
      const encrypted = encryptionService.encrypt(this.weight);
      console.log('  ✅ Encrypted weight:', encrypted.substring(0, 20) + '...');
      this.weight = encrypted;
    }

    // Encrypt activity level
    if (this.activity_level) {
      const encrypted = encryptionService.encrypt(this.activity_level);
      console.log('  ✅ Encrypted activity_level');
      this.activity_level = encrypted;
    }

    // Encrypt dietary preference
    if (this.dietary_preference) {
      const encrypted = encryptionService.encrypt(this.dietary_preference);
      console.log('  ✅ Encrypted dietary_preference');
      this.dietary_preference = encrypted;
    }

    // Encrypt smoking status
    if (this.smoking_status) {
      const encrypted = encryptionService.encrypt(this.smoking_status);
      console.log('  ✅ Encrypted smoking_status');
      this.smoking_status = encrypted;
    }

    // Encrypt alcohol use
    if (this.alcohol_use) {
      const encrypted = encryptionService.encrypt(this.alcohol_use);
      console.log('  ✅ Encrypted alcohol_use');
      this.alcohol_use = encrypted;
    }

    // Encrypt sleep hours
    if (this.sleep_hours) {
      const encrypted = encryptionService.encrypt(this.sleep_hours);
      console.log('  ✅ Encrypted sleep_hours');
      this.sleep_hours = encrypted;
    }

    // Encrypt address components
    if (this.address) {
      if (this.address.street) {
        const encrypted = encryptionService.encrypt(this.address.street);
        console.log('  ✅ Encrypted address.street');
        this.address.street = encrypted;
      }
      if (this.address.city) {
        const encrypted = encryptionService.encrypt(this.address.city);
        console.log('  ✅ Encrypted address.city');
        this.address.city = encrypted;
      }
      if (this.address.state) {
        const encrypted = encryptionService.encrypt(this.address.state);
        console.log('  ✅ Encrypted address.state');
        this.address.state = encrypted;
      }
      if (this.address.zip_code) {
        const encrypted = encryptionService.encrypt(this.address.zip_code);
        console.log('  ✅ Encrypted address.zip_code');
        this.address.zip_code = encrypted;
      }
      if (this.address.country) {
        const encrypted = encryptionService.encrypt(this.address.country);
        console.log('  ✅ Encrypted address.country');
        this.address.country = encrypted;
      }
    }

    // Encrypt emergency contact information
    if (this.emergency_contact) {
      if (this.emergency_contact.name) {
        const encrypted = encryptionService.encrypt(this.emergency_contact.name);
        console.log('  ✅ Encrypted emergency_contact.name');
        this.emergency_contact.name = encrypted;
      }
      if (this.emergency_contact.phone) {
        const encrypted = encryptionService.encrypt(this.emergency_contact.phone);
        console.log('  ✅ Encrypted emergency_contact.phone');
        this.emergency_contact.phone = encrypted;
      }
      if (this.emergency_contact.relationship) {
        const encrypted = encryptionService.encrypt(this.emergency_contact.relationship);
        console.log('  ✅ Encrypted emergency_contact.relationship');
        this.emergency_contact.relationship = encrypted;
      }
    }

    console.log('✅ [UserPersonalInfo] Encryption complete');
    next();
  } catch (error) {
    console.error('❌ [UserPersonalInfo] Encryption error:', error.message);
    next(error);
  }
});

/**
 * DECRYPTION MIDDLEWARE - Post-save hook
 */
userPersonalInfoSchema.post('save', function (doc) {
  decryptPersonalInfo(doc);
});

/**
 * DECRYPTION MIDDLEWARE - Post-findOne hook
 */
userPersonalInfoSchema.post('findOne', function (doc) {
  decryptPersonalInfo(doc);
});

/**
 * DECRYPTION MIDDLEWARE - Post-find hook
 */
userPersonalInfoSchema.post('find', function (docs) {
  if (Array.isArray(docs)) {
    docs.forEach((doc) => decryptPersonalInfo(doc));
  }
});

/**
 * DECRYPTION MIDDLEWARE - Post-findOneAndUpdate hook
 */
userPersonalInfoSchema.post('findOneAndUpdate', function (doc) {
  decryptPersonalInfo(doc);
});

/**
 * Helper function to decrypt all personal information
 */
function decryptPersonalInfo(doc) {
  if (!doc) return;

  try {
    console.log('🔓 [UserPersonalInfo] Decryption middleware triggered');
    
    // Decrypt date of birth
    if (doc.date_of_birth) {
      console.log('  - date_of_birth:', String(doc.date_of_birth).substring(0, 50), 'Type:', typeof doc.date_of_birth);
      if (typeof doc.date_of_birth === 'string' && encryptionService.isEncrypted(doc.date_of_birth)) {
        const decrypted = encryptionService.decrypt(doc.date_of_birth);
        doc.date_of_birth = new Date(decrypted);
        console.log('  ✅ Decrypted date_of_birth');
      }
    }

    // Decrypt gender
    if (doc.gender) {
      console.log('  - gender:', String(doc.gender).substring(0, 50));
      if (encryptionService.isEncrypted(doc.gender)) {
        doc.gender = encryptionService.decrypt(doc.gender);
        console.log('  ✅ Decrypted gender');
      }
    }

    // Decrypt height and weight
    if (doc.height) {
      const val = doc.height;
      console.log('  - height:', String(val).substring(0, 50), 'isEncrypted:', encryptionService.isEncrypted(val));
      if (encryptionService.isEncrypted(val)) {
        doc.height = parseFloat(encryptionService.decrypt(val));
        console.log('  ✅ Decrypted height');
      }
    }
    if (doc.weight) {
      const val = doc.weight;
      console.log('  - weight:', String(val).substring(0, 50), 'isEncrypted:', encryptionService.isEncrypted(val));
      if (encryptionService.isEncrypted(val)) {
        doc.weight = parseFloat(encryptionService.decrypt(val));
        console.log('  ✅ Decrypted weight');
      }
    }

    // Decrypt activity level
    if (doc.activity_level) {
      console.log('  - activity_level:', String(doc.activity_level).substring(0, 50));
      if (encryptionService.isEncrypted(doc.activity_level)) {
        doc.activity_level = encryptionService.decrypt(doc.activity_level);
        console.log('  ✅ Decrypted activity_level');
      }
    }

    // Decrypt dietary preference
    if (doc.dietary_preference && encryptionService.isEncrypted(doc.dietary_preference)) {
      doc.dietary_preference = encryptionService.decrypt(doc.dietary_preference);
    }

    // Decrypt smoking status
    if (doc.smoking_status && encryptionService.isEncrypted(doc.smoking_status)) {
      doc.smoking_status = encryptionService.decrypt(doc.smoking_status);
    }

    // Decrypt alcohol use
    if (doc.alcohol_use && encryptionService.isEncrypted(doc.alcohol_use)) {
      doc.alcohol_use = encryptionService.decrypt(doc.alcohol_use);
    }

    // Decrypt sleep hours
    if (doc.sleep_hours) {
      console.log('  - sleep_hours:', String(doc.sleep_hours).substring(0, 50));
      if (encryptionService.isEncrypted(doc.sleep_hours)) {
        doc.sleep_hours = parseInt(encryptionService.decrypt(doc.sleep_hours));
        console.log('  ✅ Decrypted sleep_hours');
      }
    }

    // Decrypt address
    if (doc.address) {
      if (doc.address.street && encryptionService.isEncrypted(doc.address.street)) {
        doc.address.street = encryptionService.decrypt(doc.address.street);
      }
      if (doc.address.city && encryptionService.isEncrypted(doc.address.city)) {
        doc.address.city = encryptionService.decrypt(doc.address.city);
      }
      if (doc.address.state && encryptionService.isEncrypted(doc.address.state)) {
        doc.address.state = encryptionService.decrypt(doc.address.state);
      }
      if (doc.address.zip_code && encryptionService.isEncrypted(doc.address.zip_code)) {
        doc.address.zip_code = encryptionService.decrypt(doc.address.zip_code);
      }
      if (doc.address.country && encryptionService.isEncrypted(doc.address.country)) {
        doc.address.country = encryptionService.decrypt(doc.address.country);
      }
    }

    // Decrypt emergency contact
    if (doc.emergency_contact) {
      if (doc.emergency_contact.name && encryptionService.isEncrypted(doc.emergency_contact.name)) {
        doc.emergency_contact.name = encryptionService.decrypt(doc.emergency_contact.name);
      }
      if (doc.emergency_contact.phone && encryptionService.isEncrypted(doc.emergency_contact.phone)) {
        doc.emergency_contact.phone = encryptionService.decrypt(doc.emergency_contact.phone);
      }
      if (
        doc.emergency_contact.relationship &&
        encryptionService.isEncrypted(doc.emergency_contact.relationship)
      ) {
        doc.emergency_contact.relationship = encryptionService.decrypt(
          doc.emergency_contact.relationship
        );
      }
    }
    
    console.log('✅ [UserPersonalInfo] Decryption complete');
  } catch (error) {
    console.error('❌ Decryption error in personal info:', error.message);
    console.error('❌ Stack:', error.stack);
  }
}

export const UserPersonalInfo = mongoose.model('UserPersonalInfo', userPersonalInfoSchema);
