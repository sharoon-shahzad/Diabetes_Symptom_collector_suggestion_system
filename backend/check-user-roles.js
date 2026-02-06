import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

// Define schemas inline
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

const checkUserRoles = async () => {
    await connectDB();
    
    try {
        console.log('\n👥 Checking user roles...\n');
        
        // Get all users with their roles
        const users = await User.find().select('email first_name last_name');
        
        for (const user of users) {
            // Find user roles
            const userRoles = await User_Role.find({ user_id: user._id }).populate('role_id');
            
            console.log(`📧 ${user.email} (${user.first_name} ${user.last_name})`);
            
            if (userRoles.length > 0) {
                userRoles.forEach(ur => {
                    const roleIcon = ur.role_id.name === 'super_admin' ? '👑' : '👤';
                    console.log(`   ${roleIcon} ${ur.role_id.name}`);
                });
            } else {
                console.log(`   ⚠️  No roles assigned!`);
            }
            console.log('');
        }
        
        // Find super_admin role
        const superAdminRole = await Role.findOne({ name: 'super_admin' });
        if (superAdminRole) {
            const superAdmins = await User_Role.find({ role_id: superAdminRole._id }).populate('user_id');
            console.log(`👑 Super Admins (${superAdmins.length}):`);
            superAdmins.forEach(sa => {
                console.log(`   - ${sa.user_id.email}`);
            });
        }
        
        console.log('\n💡 To make a user super admin, use: node assign-super-admin.js <email>');
        
    } catch (error) {
        console.error('❌ Error checking user roles:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n✅ Disconnected from MongoDB');
    }
};

checkUserRoles();
