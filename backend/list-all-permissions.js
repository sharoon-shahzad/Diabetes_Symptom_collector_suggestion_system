import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { Permission } from './models/Permissions.js';

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

const listAllPermissions = async () => {
    await connectDB();
    
    try {
        console.log('\n📋 Listing all permissions in database...\n');
        
        const permissions = await Permission.find();
        
        console.log(`Total permissions: ${permissions.length}\n`);
        
        if (permissions.length > 0) {
            console.log('Permissions:');
            permissions.forEach((perm, index) => {
                console.log(`\n${index + 1}. ${perm.name}`);
                console.log(`   Description: ${perm.description}`);
                console.log(`   Resource: ${perm.resource}`);
                console.log(`   Action: ${perm.action}`);
                console.log(`   Scope: ${perm.scope}`);
                console.log(`   Active: ${perm.is_active}`);
                console.log(`   Deleted: ${perm.deleted_at ? 'YES' : 'NO'}`);
                console.log(`   ID: ${perm._id}`);
            });
        } else {
            console.log('No permissions found in database.');
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n✅ Disconnected from MongoDB\n');
    }
};

listAllPermissions();
