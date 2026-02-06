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

const cleanupSettings = async () => {
    await connectDB();
    
    try {
        console.log('\n🧹 Cleaning up invalid settings...\n');
        
        // Delete settings with undefined key
        const deleted = await Settings.deleteMany({ 
            $or: [
                { key: { $exists: false } },
                { key: null },
                { key: 'undefined' },
                { key: '' }
            ]
        });
        
        console.log(`🗑️  Deleted ${deleted.deletedCount} invalid settings\n`);
        
        // Show remaining settings
        const allSettings = await Settings.find();
        console.log(`📊 Remaining settings: ${allSettings.length}\n`);
        
        if (allSettings.length > 0) {
            console.log('📝 Valid settings:\n');
            allSettings.forEach(setting => {
                console.log(`  ✅ ${setting.key}: "${setting.value}" (${setting.category})`);
            });
        }
        
        console.log('\n✅ Cleanup complete!');
        
    } catch (error) {
        console.error('❌ Error cleaning settings:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n✅ Disconnected from MongoDB');
    }
};

cleanupSettings();
