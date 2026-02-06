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

const auditLogSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    user_email: { type: String, required: true },
    user_role: { type: [String], required: true },
    action: { type: String, required: true },
    resource: { type: String, required: true },
    resource_id: { type: mongoose.Schema.Types.ObjectId },
    changes: { type: mongoose.Schema.Types.Mixed },
    ip_address: { type: String },
    user_agent: { type: String },
    status: { type: String, enum: ['SUCCESS', 'FAILURE'], default: 'SUCCESS' },
    error_message: { type: String },
    involves_pii: { type: Boolean, default: false },
    involves_phi: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now },
}, { timestamps: true });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', userSchema);

const seedAuditLogs = async () => {
    await connectDB();
    
    try {
        // Get first activated user
        const user = await User.findOne({ isActivated: true });
        
        if (!user) {
            console.error('❌ No activated users found. Please create a user first.');
            process.exit(1);
        }
        
        console.log(`\n📝 Creating audit logs for user: ${user.email}`);
        
        // Create diverse audit logs over the past 7 days
        const now = new Date();
        const logs = [];
        
        // Simulate activity over past week
        for (let day = 0; day < 7; day++) {
            const dayDate = new Date(now);
            dayDate.setDate(dayDate.getDate() - day);
            
            // Morning activity (8-10 AM)
            for (let i = 0; i < 2 + Math.floor(Math.random() * 3); i++) {
                const timestamp = new Date(dayDate);
                timestamp.setHours(8 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60));
                
                logs.push({
                    user_id: user._id,
                    user_email: user.email,
                    user_role: ['admin'],
                    action: 'LOGIN',
                    resource: 'Auth',
                    ip_address: `192.168.1.${Math.floor(Math.random() * 255)}`,
                    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
                    status: 'SUCCESS',
                    timestamp,
                });
            }
            
            // Midday activity (11-2 PM) - User management
            for (let i = 0; i < 3 + Math.floor(Math.random() * 5); i++) {
                const timestamp = new Date(dayDate);
                timestamp.setHours(11 + Math.floor(Math.random() * 3), Math.floor(Math.random() * 60));
                
                const actions = [
                    { action: 'READ', resource: 'User' },
                    { action: 'UPDATE', resource: 'User', changes: { fields_modified: ['email', 'fullName'] } },
                    { action: 'CREATE', resource: 'User', changes: { email: 'newuser@example.com' } },
                ];
                const randomAction = actions[Math.floor(Math.random() * actions.length)];
                
                logs.push({
                    user_id: user._id,
                    user_email: user.email,
                    user_role: ['admin'],
                    action: randomAction.action,
                    resource: randomAction.resource,
                    resource_id: user._id,
                    changes: randomAction.changes,
                    ip_address: `192.168.1.${Math.floor(Math.random() * 255)}`,
                    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
                    status: 'SUCCESS',
                    involves_pii: true,
                    timestamp,
                });
            }
            
            // Afternoon activity (3-5 PM) - Role & Permission changes
            for (let i = 0; i < 1 + Math.floor(Math.random() * 2); i++) {
                const timestamp = new Date(dayDate);
                timestamp.setHours(15 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60));
                
                const actions = [
                    { action: 'UPDATE', resource: 'UserRole', changes: { before: { roles: ['user'] }, after: { roles: ['admin'] } } },
                    { action: 'UPDATE', resource: 'RolePermissions', changes: { permissions_added: 3 } },
                ];
                const randomAction = actions[Math.floor(Math.random() * actions.length)];
                
                logs.push({
                    user_id: user._id,
                    user_email: user.email,
                    user_role: ['admin'],
                    action: randomAction.action,
                    resource: randomAction.resource,
                    resource_id: user._id,
                    changes: randomAction.changes,
                    ip_address: `192.168.1.${Math.floor(Math.random() * 255)}`,
                    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
                    status: 'SUCCESS',
                    timestamp,
                });
            }
            
            // Evening activity (6-7 PM) - Logout and occasional failures
            for (let i = 0; i < 1 + Math.floor(Math.random() * 2); i++) {
                const timestamp = new Date(dayDate);
                timestamp.setHours(18 + Math.floor(Math.random() * 1), Math.floor(Math.random() * 60));
                
                const isFailed = Math.random() < 0.1; // 10% failure rate
                
                logs.push({
                    user_id: user._id,
                    user_email: user.email,
                    user_role: ['admin'],
                    action: 'LOGOUT',
                    resource: 'Auth',
                    ip_address: `192.168.1.${Math.floor(Math.random() * 255)}`,
                    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
                    status: isFailed ? 'FAILURE' : 'SUCCESS',
                    error_message: isFailed ? 'Session timeout' : null,
                    timestamp,
                });
            }
        }
        
        // Add some activity for today
        const today = new Date();
        for (let hour = 0; hour <= today.getHours(); hour++) {
            if (hour >= 8 && hour <= 18) { // Business hours
                const count = 1 + Math.floor(Math.random() * 3);
                for (let i = 0; i < count; i++) {
                    const timestamp = new Date(today);
                    timestamp.setHours(hour, Math.floor(Math.random() * 60));
                    
                    const actions = [
                        { action: 'LOGIN', resource: 'Auth' },
                        { action: 'READ', resource: 'User' },
                        { action: 'UPDATE', resource: 'User', changes: { fields_modified: ['isActivated'] } },
                        { action: 'DELETE', resource: 'User', changes: { deleted_at: new Date() } },
                    ];
                    const randomAction = actions[Math.floor(Math.random() * actions.length)];
                    
                    logs.push({
                        user_id: user._id,
                        user_email: user.email,
                        user_role: ['admin'],
                        action: randomAction.action,
                        resource: randomAction.resource,
                        resource_id: randomAction.resource !== 'Auth' ? user._id : undefined,
                        changes: randomAction.changes,
                        ip_address: `192.168.1.${Math.floor(Math.random() * 255)}`,
                        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
                        status: 'SUCCESS',
                        involves_pii: randomAction.resource === 'User',
                        timestamp,
                    });
                }
            }
        }
        
        // Insert all logs
        await AuditLog.insertMany(logs);
        
        console.log(`\n✅ Created ${logs.length} audit logs`);
        
        // Show summary
        const totalCount = await AuditLog.countDocuments();
        const successCount = await AuditLog.countDocuments({ status: 'SUCCESS' });
        const failureCount = await AuditLog.countDocuments({ status: 'FAILURE' });
        const todayCount = await AuditLog.countDocuments({ 
            timestamp: { $gte: new Date(today.setHours(0, 0, 0, 0)) } 
        });
        
        console.log(`\n📊 Database Summary:`);
        console.log(`   Total Events: ${totalCount}`);
        console.log(`   Success: ${successCount}`);
        console.log(`   Failed: ${failureCount}`);
        console.log(`   Today's Events: ${todayCount}`);
        console.log(`   Success Rate: ${((successCount / totalCount) * 100).toFixed(1)}%`);
        
        console.log('\n✅ Audit logs seeded successfully!');
        console.log('🔄 Now refresh the AuditLogs page to see the charts populated.');
        
    } catch (error) {
        console.error('❌ Error seeding audit logs:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n✅ Disconnected from MongoDB');
    }
};

seedAuditLogs();
