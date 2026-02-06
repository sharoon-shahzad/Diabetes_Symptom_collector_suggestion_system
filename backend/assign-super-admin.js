import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

// Define schemas
const userSchema = new mongoose.Schema({
    email: String,
    first_name: String,
    last_name: String
});

const roleSchema = new mongoose.Schema({
    name: String,
    display_name: String
});

const userRoleSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' }
});

const User = mongoose.model('User', userSchema);
const Role = mongoose.model('Role', roleSchema);
const User_Role = mongoose.model('User_Role', userRoleSchema);

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB connected');
    } catch (err) {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    }
};

const assignSuperAdmin = async () => {
    await connectDB();
    
    try {
        const email = process.argv[2];
        
        if (!email) {
            console.log('\n❌ Please provide an email address');
            console.log('Usage: node assign-super-admin.js <email>\n');
            
            // Show available users
            const users = await User.find().select('email');
            console.log('Available users:');
            users.forEach(u => console.log(`  - ${u.email}`));
            console.log('');
            return;
        }
        
        console.log(`\n🔍 Looking for user: ${email}\n`);
        
        // Find user
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            console.log('❌ User not found!');
            return;
        }
        
        console.log(`✅ User found: ${user.email}`);
        
        // Find super_admin role
        const superAdminRole = await Role.findOne({ name: 'super_admin' });
        if (!superAdminRole) {
            console.log('❌ Super admin role not found!');
            return;
        }
        
        console.log(`✅ Super admin role found: ${superAdminRole.name}`);
        
        // Check if already assigned
        const existing = await User_Role.findOne({
            user_id: user._id,
            role_id: superAdminRole._id
        });
        
        if (existing) {
            console.log('⏭️  User already has super_admin role');
        } else {
            // Assign role
            await User_Role.create({
                user_id: user._id,
                role_id: superAdminRole._id
            });
            console.log('✅ Super admin role assigned successfully!');
        }
        
        console.log('\n👑 User is now a Super Admin!');
        console.log('💡 Please logout and login again for changes to take effect.\n');
        
    } catch (error) {
        console.error('❌ Error assigning role:', error);
    } finally {
        await mongoose.disconnect();
        console.log('✅ Disconnected from MongoDB\n');
    }
};

assignSuperAdmin();
