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
    key: { type: String, required: true, unique: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
    category: { type: String, enum: ['general', 'appearance', 'email', 'system'], default: 'general' },
    description: { type: String, default: '' },
    is_editable: { type: Boolean, default: true },
    updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const Settings = mongoose.model('Settings', settingsSchema);

const addDateFormatSetting = async () => {
    await connectDB();
    
    try {
        console.log('\n📅 Adding date_format setting...\n');
        
        const existing = await Settings.findOne({ key: 'date_format' });
        
        if (existing) {
            console.log('⏭️  date_format setting already exists');
            console.log(`   Current value: ${existing.value}`);
        } else {
            const setting = await Settings.create({
                key: 'date_format',
                value: 'DD MMMM, YYYY', // Default format: 23 January, 2026
                category: 'general',
                description: 'Date format used throughout the application (with full month names)',
                is_editable: true
            });
            console.log('✅ Created date_format setting');
            console.log(`   Default value: ${setting.value}`);
        }
        
        const count = await Settings.countDocuments();
        console.log(`\n📊 Total settings in database: ${count}`);
        
        console.log('\n✅ Date format setting added successfully!');
        
    } catch (error) {
        console.error('❌ Error adding setting:', error);
    } finally {
        await mongoose.disconnect();
        console.log('✅ Disconnected from MongoDB\n');
    }
};

addDateFormatSetting();
