import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

async function testEmailConfiguration() {
    console.log('🔍 Testing Email Configuration...\n');
    
    // Check environment variables
    console.log('📋 Environment Variables:');
    console.log('SMTP_HOST:', process.env.SMTP_HOST || 'NOT SET');
    console.log('SMTP_PORT:', process.env.SMTP_PORT || 'NOT SET');
    console.log('SMTP_SECURE:', process.env.SMTP_SECURE || 'NOT SET');
    console.log('SMTP_USER:', process.env.SMTP_USER || 'NOT SET');
    console.log('SMTP_PASS:', process.env.SMTP_PASS ? '***SET***' : 'NOT SET');
    console.log('FRONTEND_URL:', process.env.FRONTEND_URL || 'NOT SET');
    
    // Validate port configuration
    if (process.env.SMTP_SECURE === 'true' && process.env.SMTP_PORT === '587') {
        console.log('\n⚠️  WARNING: SMTP_SECURE=true should use port 465, not 587');
        console.log('   For Gmail with SMTP_SECURE=true, use: SMTP_PORT=465');
        console.log('   For Gmail with SMTP_SECURE=false, use: SMTP_PORT=587');
    }
    
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.log('\n❌ Email configuration is incomplete!');
        console.log('Please create a .env file with the required SMTP settings.');
        return;
    }
    
    console.log('\n✅ All required environment variables are set.');
    
    // Test SMTP connection
    console.log('\n🔌 Testing SMTP Connection...');
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT, 10),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
            tls: {
                rejectUnauthorized: false
            }
        });
        
        // Verify connection
        await transporter.verify();
        console.log('✅ SMTP connection successful!');
        
        // Test sending a simple email
        console.log('\n📧 Testing email sending...');
        const testEmail = process.env.SMTP_USER; // Send to yourself for testing
        
        const mailOptions = {
            from: process.env.SMTP_USER,
            to: testEmail,
            subject: 'Test Email - Diabetes Symptom Collector',
            html: `
                <h2>Test Email</h2>
                <p>This is a test email to verify your SMTP configuration.</p>
                <p>If you receive this email, your email service is working correctly!</p>
                <p>Time: ${new Date().toLocaleString()}</p>
            `
        };
        
        await transporter.sendMail(mailOptions);
        console.log('✅ Test email sent successfully!');
        console.log(`📬 Check your inbox: ${testEmail}`);
        
    } catch (error) {
        console.error('❌ SMTP test failed:', error.message);
        console.error('Full error:', error);
        
        if (error.code === 'EAUTH') {
            console.log('\n💡 Common solutions:');
            console.log('1. Check your email and password');
            console.log('2. If using Gmail, make sure you have:');
            console.log('   - Enabled 2-Factor Authentication');
            console.log('   - Generated an App Password');
            console.log('   - Used the App Password (not your regular password)');
        }
        
        if (error.code === 'ECONNECTION') {
            console.log('\n💡 Connection issues:');
            console.log('1. Check your internet connection');
            console.log('2. Verify SMTP_HOST and SMTP_PORT are correct');
            console.log('3. For Gmail:');
            console.log('   - SMTP_SECURE=true → SMTP_PORT=465');
            console.log('   - SMTP_SECURE=false → SMTP_PORT=587');
        }
    }
}

testEmailConfiguration().catch(console.error); 