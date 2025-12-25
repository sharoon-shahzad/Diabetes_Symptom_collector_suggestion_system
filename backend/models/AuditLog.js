import mongoose from 'mongoose';
import encryptionService from '../services/encryptionService.js';

const auditLogSchema = new mongoose.Schema({
    // User Information
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    user_email: {
        type: String,
        required: true,
        index: true,
    },
    user_role: {
        type: [String],
        required: true,
    },

    // Action Information
    action: {
        type: String,
        enum: [
            'CREATE',
            'READ',
            'UPDATE',
            'DELETE',
            'EXPORT',
            'IMPORT',
            'LOGIN',
            'LOGOUT',
            'PERMISSION_CHANGE',
            'ROLE_CHANGE',
        ],
        required: true,
        index: true,
    },
    resource: {
        type: String,
        enum: [
            'User',
            'UserPersonalInfo',
            'UserMedicalInfo',
            'Disease',
            'Symptom',
            'Question',
            'Content',
            'Role',
            'Permission',
            'Feedback',
            'DietPlan',
            'ExercisePlan',
            'Document',
            'Assessment',
        ],
        required: true,
        index: true,
    },
    resource_id: {
        type: String,
        index: true,
    },

    // Change Tracking
    changes: {
        before: mongoose.Schema.Types.Mixed,
        after: mongoose.Schema.Types.Mixed,
        fields_modified: [String],
    },

    // Metadata
    timestamp: {
        type: Date,
        default: Date.now,
        index: true,
    },
    ip_address: {
        type: String,
    },
    user_agent: {
        type: String,
    },

    // Status Information
    status: {
        type: String,
        enum: ['SUCCESS', 'FAILURE', 'PARTIAL'],
        default: 'SUCCESS',
        index: true,
    },
    error_message: {
        type: String,
    },

    // Compliance Flags
    involves_pii: {
        type: Boolean,
        default: false,
    },
    involves_phi: {
        type: Boolean,
        default: false,
    },

    // Data Retention
    retention_expires_at: {
        type: Date,
        index: true,
    },

    // Timestamps
    createdAt: {
        type: Date,
        default: Date.now,
        index: true,
    },
}, {
    timestamps: true,
    collection: 'audit_logs',
});

// Indexes for performance
auditLogSchema.index({ user_id: 1, timestamp: -1 });
auditLogSchema.index({ resource: 1, action: 1 });
auditLogSchema.index({ timestamp: -1 });
auditLogSchema.index({ user_email: 1, timestamp: -1 });
auditLogSchema.index({ status: 1, timestamp: -1 });

// Middleware: Encrypt sensitive fields before saving
auditLogSchema.pre('save', function (next) {
    try {
        if (this.involves_pii && this.changes?.after && typeof this.changes.after === 'object') {
            const fieldsToEncrypt = Object.keys(this.changes.after);
            if (fieldsToEncrypt.length > 0) {
                this.changes.after = encryptionService.encryptObject(this.changes.after, fieldsToEncrypt);
            }
        }
        if (this.involves_phi && this.changes?.after && typeof this.changes.after === 'object') {
            const fieldsToEncrypt = Object.keys(this.changes.after);
            if (fieldsToEncrypt.length > 0) {
                this.changes.after = encryptionService.encryptObject(this.changes.after, fieldsToEncrypt);
            }
        }
    } catch (error) {
        console.warn('Audit log encryption note:', error.message);
    }
    next();
});

// Middleware: Decrypt sensitive fields after retrieval
auditLogSchema.post('findOne', function (doc) {
    if (doc && doc.changes?.after && typeof doc.changes.after === 'object') {
        // Decrypt all fields if they are encrypted
        try {
            const fieldsToDecrypt = Object.keys(doc.changes.after);
            if (fieldsToDecrypt.length > 0 && (doc.involves_pii || doc.involves_phi)) {
                doc.changes.after = encryptionService.decryptObject(doc.changes.after, fieldsToDecrypt);
            }
        } catch (err) {
            console.warn('Audit log decryption note:', err.message);
        }
    }
});

auditLogSchema.post('find', function (docs) {
    if (docs && Array.isArray(docs)) {
        docs.forEach((doc) => {
            if (doc && doc.changes?.after && typeof doc.changes.after === 'object') {
                try {
                    const fieldsToDecrypt = Object.keys(doc.changes.after);
                    if (fieldsToDecrypt.length > 0 && (doc.involves_pii || doc.involves_phi)) {
                        doc.changes.after = encryptionService.decryptObject(doc.changes.after, fieldsToDecrypt);
                    }
                } catch (err) {
                    console.warn('Audit log decryption note:', err.message);
                }
            }
        });
    }
});

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;
