import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import AuditLog from './models/AuditLog.js';

dotenv.config();

const testAuditLogging = async () => {
    try {
        console.log('🔗 Connecting to database...');
        await connectDB();
        console.log('✅ Database connected\n');

        // Get initial count
        const initialCount = await AuditLog.countDocuments();
        console.log(`📊 Initial audit log count: ${initialCount}`);

        // Create a test user ID for simulation
        const testUserId = new mongoose.Types.ObjectId();
        
        console.log('\n📝 Creating test audit logs...');
        
        // Create multiple test audit logs to simulate different user actions
        const testLogs = [
            {
                user_id: testUserId,
                user_email: 'test@example.com',
                user_role: ['user'],
                action: 'CREATE',
                resource: 'User',
                resource_id: testUserId.toString(),
                changes: {
                    before: null,
                    after: { email: 'test@example.com', fullName: 'Test User' }
                },
                ip_address: '127.0.0.1',
                user_agent: 'Test Agent',
                status: 'SUCCESS',
                involves_pii: true,
            },
            {
                user_id: testUserId,
                user_email: 'test@example.com',
                user_role: ['user'],
                action: 'UPDATE',
                resource: 'UserPersonalInfo',
                resource_id: testUserId.toString(),
                changes: {
                    before: null,
                    after: { 
                        date_of_birth: '1990-01-01',
                        gender: 'Male',
                        height: 180,
                        weight: 75
                    }
                },
                ip_address: '127.0.0.1',
                user_agent: 'Test Agent',
                status: 'SUCCESS',
                involves_pii: true,
            },
            {
                user_id: testUserId,
                user_email: 'test@example.com',
                user_role: ['user'],
                action: 'UPDATE',
                resource: 'UserMedicalInfo',
                resource_id: testUserId.toString(),
                changes: {
                    before: null,
                    after: { 
                        diabetes_type: 'Type 2',
                        diagnosis_date: '2023-01-01',
                        current_medications: ['Metformin']
                    }
                },
                ip_address: '127.0.0.1',
                user_agent: 'Test Agent',
                status: 'SUCCESS',
                involves_phi: true,
            },
            {
                user_id: testUserId,
                user_email: 'test@example.com',
                user_role: ['user'],
                action: 'CREATE',
                resource: 'Assessment',
                resource_id: new mongoose.Types.ObjectId().toString(),
                changes: {
                    before: null,
                    after: { 
                        risk_level: 'HIGH',
                        probability: 0.85,
                        enhanced: true,
                        model_used: 'Hybrid (XGBoost + Diabetica 7B)'
                    }
                },
                ip_address: '127.0.0.1',
                user_agent: 'Test Agent',
                status: 'SUCCESS',
                involves_phi: true,
            }
        ];

        // Save all test logs
        const savedLogs = await AuditLog.insertMany(testLogs);
        console.log(`✅ Created ${savedLogs.length} test audit logs`);

        // Verify they were saved
        const newCount = await AuditLog.countDocuments();
        console.log(`\n📊 New audit log count: ${newCount}`);
        console.log(`✅ Added ${newCount - initialCount} new audit logs`);

        // Display all audit logs
        console.log('\n📄 All audit logs in database:');
        const allLogs = await AuditLog.find().sort({ timestamp: -1 }).limit(20);
        allLogs.forEach((log, index) => {
            console.log(`\n${index + 1}. ${log.resource} - ${log.action}`);
            console.log(`   Email: ${log.user_email}`);
            console.log(`   Status: ${log.status}`);
            console.log(`   Time: ${log.timestamp}`);
            console.log(`   PII: ${log.involves_pii}, PHI: ${log.involves_phi}`);
        });

        // Get statistics
        console.log('\n\n📊 AUDIT LOG STATISTICS:');
        const actionCounts = await AuditLog.aggregate([
            { $group: { _id: '$action', count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);
        
        console.log('\nBy Action:');
        actionCounts.forEach(item => {
            console.log(`  - ${item._id}: ${item.count}`);
        });

        const resourceCounts = await AuditLog.aggregate([
            { $group: { _id: '$resource', count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);
        
        console.log('\nBy Resource:');
        resourceCounts.forEach(item => {
            console.log(`  - ${item._id}: ${item.count}`);
        });

        const statusCounts = await AuditLog.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);
        
        console.log('\nBy Status:');
        statusCounts.forEach(item => {
            console.log(`  - ${item._id}: ${item.count}`);
        });

        console.log('\n✅ Audit logging test complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error testing audit logging:', error.message);
        console.error(error);
        process.exit(1);
    }
};

testAuditLogging();
