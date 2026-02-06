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

const settingsSchema = new mongoose.Schema({
    site_title: { type: String, default: 'DiabetesCare' },
    site_description: { type: String, default: 'Comprehensive diabetes management and symptom tracking system' },
    contact_email: { type: String, default: 'support@diabetescare.com' },
    admin_email: { type: String, default: 'admin@diabetescare.com' },
    date_format: { type: String, default: 'DD MMMM, YYYY' },
    updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const Settings = mongoose.model('Settings', settingsSchema);

const defaultSettings = {
    site_title: 'DiabetesCare',
    site_description: 'Comprehensive diabetes management and symptom tracking system',
    contact_email: 'support@diabetescare.com',
    admin_email: 'admin@diabetescare.com',
    date_format: 'DD MMMM, YYYY'
};

const seedSettings = async () => {
    await connectDB();
    
    try {
        console.log('\n🌱 Seeding settings...\n');
        
        // Check if settings document exists
        const existing = await Settings.findOne();
        
        if (existing) {
            console.log('⏭️  Settings document already exists');
            console.log('   Current values:');
            console.log(`   - site_title: "${existing.site_title}"`);
            console.log(`   - site_description: "${existing.site_description}"`);
            console.log(`   - contact_email: "${existing.contact_email}"`);
            console.log(`   - admin_email: "${existing.admin_email}"`);
            console.log(`   - date_format: "${existing.date_format}"`);
        } else {
            // Create the single settings document
            const settings = await Settings.create(defaultSettings);
            console.log('✅ Created settings document:');
            console.log(`   - site_title: "${settings.site_title}"`);
            console.log(`   - site_description: "${settings.site_description}"`);
            console.log(`   - contact_email: "${settings.contact_email}"`);
            console.log(`   - admin_email: "${settings.admin_email}"`);
            console.log(`   - date_format: "${settings.date_format}"`);
        }
        
        const totalSettings = await Settings.countDocuments();
        console.log(`\n📊 Total settings documents in database: ${totalSettings}`);
        console.log('\n✅ Settings seeded successfully!');
        
    } catch (error) {
        console.error('❌ Error seeding settings:', error);
    } finally {
        await mongoose.disconnect();
        console.log('✅ Disconnected from MongoDB');
    }
};

seedSettings();
