import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB connected');
    } catch (err) {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    }
};

// Old schema (key-value pairs)
const oldSettingsSchema = new mongoose.Schema({
    key: String,
    value: mongoose.Schema.Types.Mixed,
    category: String,
    description: String,
    is_editable: Boolean,
    updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// New schema (single document)
const newSettingsSchema = new mongoose.Schema({
    site_title: { type: String, default: 'DiabetesCare' },
    site_description: { type: String, default: 'Comprehensive diabetes management and symptom tracking system' },
    contact_email: { type: String, default: 'support@diabetescare.com' },
    admin_email: { type: String, default: 'admin@diabetescare.com' },
    date_format: { type: String, default: 'DD MMMM, YYYY' },
    updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const migrateSettings = async () => {
    await connectDB();
    
    try {
        console.log('\n🔄 Starting settings migration...\n');
        
        // Use the old collection temporarily
        const OldSettings = mongoose.model('OldSettings', oldSettingsSchema, 'settings');
        
        // Fetch all existing key-value settings
        const oldSettings = await OldSettings.find();
        console.log(`📊 Found ${oldSettings.length} old settings documents\n`);
        
        if (oldSettings.length === 0) {
            console.log('⚠️  No settings to migrate. Running seed instead...\n');
            return;
        }
        
        // Extract values from old documents
        const settingsData = {};
        oldSettings.forEach(setting => {
            console.log(`  📝 ${setting.key}: "${setting.value}"`);
            settingsData[setting.key] = setting.value;
        });
        
        // Create new single document structure
        const newSettingsData = {
            site_title: settingsData.site_title || 'DiabetesCare',
            site_description: settingsData.site_description || 'Comprehensive diabetes management and symptom tracking system',
            contact_email: settingsData.contact_email || 'support@diabetescare.com',
            admin_email: settingsData.admin_email || 'admin@diabetescare.com',
            date_format: settingsData.date_format || 'DD MMMM, YYYY'
        };
        
        console.log('\n🗑️  Deleting old settings documents...');
        await OldSettings.deleteMany({});
        console.log(`✅ Deleted ${oldSettings.length} old documents\n`);
        
        // Create new settings with the new schema
        const NewSettings = mongoose.model('Settings', newSettingsSchema);
        const newSettings = await NewSettings.create(newSettingsData);
        
        console.log('✅ Created new settings document:');
        console.log(`   - site_title: "${newSettings.site_title}"`);
        console.log(`   - site_description: "${newSettings.site_description}"`);
        console.log(`   - contact_email: "${newSettings.contact_email}"`);
        console.log(`   - admin_email: "${newSettings.admin_email}"`);
        console.log(`   - date_format: "${newSettings.date_format}"`);
        
        const totalSettings = await NewSettings.countDocuments();
        console.log(`\n📊 Total settings documents in database: ${totalSettings}`);
        console.log('\n✅ Migration completed successfully!');
        console.log('💡 Old key-value documents have been converted to a single document structure\n');
        
    } catch (error) {
        console.error('❌ Error during migration:', error);
    } finally {
        await mongoose.disconnect();
        console.log('✅ Disconnected from MongoDB');
    }
};

migrateSettings();
