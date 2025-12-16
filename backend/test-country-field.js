import mongoose from 'mongoose';
import { User } from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const testCountryField = async () => {
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Get all users and check country field
        const users = await User.find({}).select('fullName email country country_code phone_number');
        
        console.log('\n📊 Users with country data:');
        users.forEach(user => {
            console.log(`\nUser: ${user.fullName} (${user.email})`);
            console.log(`  Country: ${user.country || 'NOT SET'}`);
            console.log(`  Country Code: ${user.country_code || 'NOT SET'}`);
            console.log(`  Phone: ${user.phone_number || 'NOT SET'}`);
        });

        console.log('\n✅ Test completed');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

testCountryField();
