import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

// Old Setting model (multiple documents)
const oldSettingSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    value: { type: String, required: true },
    category: { type: String, default: 'general' },
    description: { type: String },
    is_editable: { type: Boolean, default: true },
    updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const OldSetting = mongoose.model('OldSetting', oldSettingSchema, 'settings');

// New Setting model (single document)
const newSettingSchema = new mongoose.Schema({
    site_title: { type: String, default: 'DiabetesCare' },
    site_description: { type: String, default: 'Comprehensive diabetes management and symptom tracking system' },
    contact_email: { type: String, default: 'support@diabetescare.com' },
    admin_email: { type: String, default: 'admin@diabetescare.com' },
    date_format: { type: String, default: 'DD MMMM, YYYY' },
    updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const NewSetting = mongoose.model('NewSetting', newSettingSchema, 'settings_new');

async function migrateSetting() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log('✅ Connected to MongoDB');

        // Fetch all old settings
        console.log('\n📋 Fetching existing settings...');
        const oldSettings = await OldSetting.find({});
        console.log(`Found ${oldSettings.length} setting(s)`);

        if (oldSettings.length === 0) {
            console.log('⚠️  No settings found in database. Creating default settings...');
            const defaultSettings = new NewSetting({
                site_title: 'DiabetesCare',
                site_description: 'Comprehensive diabetes management and symptom tracking system',
                contact_email: 'support@diabetescare.com',
                admin_email: 'admin@diabetescare.com',
                date_format: 'DD MMMM, YYYY'
            });
            await defaultSettings.save();
            console.log('✅ Default settings created');
        } else {
            // Map old settings to new structure
            const settingsMap = {};
            let lastUpdatedBy = null;

            oldSettings.forEach(setting => {
                console.log(`  - ${setting.key}: ${setting.value}`);
                settingsMap[setting.key] = setting.value;
                if (setting.updated_by) {
                    lastUpdatedBy = setting.updated_by;
                }
            });

            // Create new single document
            console.log('\n🔄 Creating new unified settings document...');
            const newSettings = new NewSetting({
                site_title: settingsMap.site_title || 'DiabetesCare',
                site_description: settingsMap.site_description || 'Comprehensive diabetes management and symptom tracking system',
                contact_email: settingsMap.contact_email || 'support@diabetescare.com',
                admin_email: settingsMap.admin_email || 'admin@diabetescare.com',
                date_format: settingsMap.date_format || 'DD MMMM, YYYY',
                updated_by: lastUpdatedBy
            });

            await newSettings.save();
            console.log('✅ New settings document created');

            // Backup old collection
            console.log('\n📦 Creating backup of old settings...');
            await mongoose.connection.db.collection('settings').rename('settings_backup_' + Date.now());
            console.log('✅ Old settings backed up');

            // Rename new collection to 'settings'
            console.log('\n🔄 Activating new settings structure...');
            await mongoose.connection.db.collection('settings_new').rename('settings');
            console.log('✅ New settings structure activated');
        }

        console.log('\n🎉 Migration completed successfully!');
        console.log('\n📊 New Settings Structure:');
        const finalSettings = await mongoose.connection.db.collection('settings').findOne({});
        console.log(JSON.stringify(finalSettings, null, 2));

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Database connection closed');
        process.exit(0);
    }
}

migrateSetting();
