import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import AuditLog from './models/AuditLog.js';

dotenv.config();

const testAuditCollection = async () => {
    try {
        console.log('🔗 Connecting to database...');
        await connectDB();
        console.log('✅ Database connected');

        // Check if collection exists
        const collections = await mongoose.connection.db.listCollections().toArray();
        const auditCollectionExists = collections.some(col => col.name === 'audit_logs');
        
        console.log('\n📋 Database Collections:');
        collections.forEach(col => console.log(`  - ${col.name}`));
        
        if (auditCollectionExists) {
            console.log('\n✅ audit_logs collection EXISTS');
        } else {
            console.log('\n⚠️  audit_logs collection DOES NOT EXIST - creating...');
            
            // Create a test document to trigger collection creation
            const testAudit = new AuditLog({
                user_id: new mongoose.Types.ObjectId(),
                user_email: 'test@example.com',
                user_role: ['user'],
                action: 'CREATE',
                resource: 'User',
                resource_id: null,
                changes: null,
                ip_address: '127.0.0.1',
                user_agent: 'Test Agent',
                status: 'SUCCESS',
            });
            
            const saved = await testAudit.save();
            console.log('✅ Test audit log created:', saved._id);
            
            // Verify collection now exists
            const collectionsAfter = await mongoose.connection.db.listCollections().toArray();
            const auditCollectionNowExists = collectionsAfter.some(col => col.name === 'audit_logs');
            console.log('✅ audit_logs collection now EXISTS');
            
            // Get the collection stats
            const stats = await mongoose.connection.db.collection('audit_logs').stats();
            console.log('\n📊 Collection Stats:');
            console.log(`  - Document Count: ${stats.count}`);
            console.log(`  - Size: ${stats.size} bytes`);
        }

        // Test finding audit logs
        const count = await AuditLog.countDocuments();
        console.log(`\n📝 Total audit logs in database: ${count}`);
        
        // Get sample audit logs
        const logs = await AuditLog.find().limit(5).sort({ timestamp: -1 });
        console.log('\n📄 Recent audit logs:');
        logs.forEach((log, index) => {
            console.log(`  ${index + 1}. ${log.resource} - ${log.action} by ${log.user_email} at ${log.timestamp}`);
        });

        console.log('\n✅ Audit collection test complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error testing audit collection:', error.message);
        console.error(error);
        process.exit(1);
    }
};

testAuditCollection();
