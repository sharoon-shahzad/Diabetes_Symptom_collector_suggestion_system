import nodemailer from 'nodemailer';

export async function sendActivationEmail(email, token) {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT, 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
    const activationUrl = `${process.env.FRONTEND_URL}/activate/${token}`;
    const html = `
    <div style="font-family: Arial, sans-serif; background: #f4f6fb; padding: 40px 0;">
      <div style="max-width: 480px; margin: 0 auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.07); padding: 32px;">
        <h2 style="color: #1e2a3a; text-align: center; margin-bottom: 24px;">Welcome to Diabetes Symptom Collector!</h2>
        <p style="color: #333; font-size: 16px;">Thank you for registering. Please activate your account by clicking the button below:</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${activationUrl}" style="display: inline-block; padding: 14px 32px; background: #1976d2; color: #fff; border-radius: 4px; font-size: 16px; text-decoration: none; font-weight: bold; letter-spacing: 1px;">Activate Account</a>
        </div>
        <p style="color: #888; font-size: 14px;">If the button above does not work, copy and paste the following link into your browser:</p>
        <p style="word-break: break-all; color: #1976d2; font-size: 14px;">${activationUrl}</p>
        <hr style="margin: 32px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #aaa; font-size: 13px; text-align: center;">&copy; ${new Date().getFullYear()} Diabetes Symptom Collector. All rights reserved.</p>
      </div>
    </div>
    `;
    await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: email,
        subject: 'Activate your Diabetes Symptom Collector account',
        html
    });
}

export async function sendResetPasswordEmail(email, token) {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT, 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
    const html = `
    <div style="font-family: Arial, sans-serif; background: #f4f6fb; padding: 40px 0;">
      <div style="max-width: 480px; margin: 0 auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.07); padding: 32px;">
        <h2 style="color: #1e2a3a; text-align: center; margin-bottom: 24px;">Reset Your Password</h2>
        <p style="color: #333; font-size: 16px;">We received a request to reset your password. Click the button below to set a new password:</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${resetUrl}" style="display: inline-block; padding: 14px 32px; background: #1976d2; color: #fff; border-radius: 4px; font-size: 16px; text-decoration: none; font-weight: bold; letter-spacing: 1px;">Reset Password</a>
        </div>
        <p style="color: #888; font-size: 14px;">If you did not request this, you can safely ignore this email.</p>
        <p style="color: #888; font-size: 14px;">If the button above does not work, copy and paste the following link into your browser:</p>
        <p style="word-break: break-all; color: #1976d2; font-size: 14px;">${resetUrl}</p>
        <hr style="margin: 32px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #aaa; font-size: 13px; text-align: center;">&copy; ${new Date().getFullYear()} Diabetes Symptom Collector. All rights reserved.</p>
      </div>
    </div>
    `;
    await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: email,
        subject: 'Reset your Diabetes Symptom Collector password',
        html
    });
}

export async function sendOnboardingCompletionEmail(email, userName, diseaseName, symptomMap) {
    console.log('📧 Email service configuration:', {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_SECURE,
        user: process.env.SMTP_USER ? '***configured***' : 'NOT CONFIGURED',
        pass: process.env.SMTP_PASS ? '***configured***' : 'NOT CONFIGURED'
    });

    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        throw new Error('SMTP configuration is incomplete. Please check your .env file.');
    }

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT, 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    // Generate PDF report
    const { generateOnboardingReportPDF, cleanupTempPDF } = await import('./pdfService.js');
    let pdfFilepath = null;
    let pdfFilename = null;

    try {
        console.log('📄 Generating PDF report...');
        const pdfResult = await generateOnboardingReportPDF(userName, diseaseName, symptomMap);
        pdfFilepath = pdfResult.filepath;
        pdfFilename = pdfResult.filename;
        console.log('📄 PDF generated successfully:', pdfFilename);
    } catch (error) {
        console.error('❌ Error generating PDF:', error);
        console.log('📄 Continuing without PDF attachment...');
        // Continue without PDF if generation fails
    }

    const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; background: #f4f8fb; padding: 40px 0;">
      <div style="max-width: 520px; margin: 0 auto; background: #fff; border-radius: 12px; box-shadow: 0 4px 24px rgba(25, 118, 210, 0.10); padding: 40px 32px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <img src='https://img.icons8.com/color/96/000000/checked--v2.png' alt='Completed' style='width: 64px; height: 64px;'/>
        </div>
        <h2 style="color: #1976d2; text-align: center; margin-bottom: 16px;">Congratulations, ${userName}!</h2>
        <p style="color: #333; font-size: 18px; text-align: center; margin-bottom: 24px;">You have successfully completed <b>100% of your details</b> for <b>${diseaseName}</b> in the Diabetes Symptom Collector system.</p>
        
        <div style="background: #fff3cd; border-radius: 8px; padding: 18px 24px; margin-bottom: 18px; border: 1px solid #ffe082;">
          <p style="color: #b26a00; font-size: 16px; text-align: center; margin: 0; font-weight: 600;">
            <span style="display: inline-block; vertical-align: middle; margin-right: 8px;">⏰</span>
            <b>You can edit your details within 7 days from now. After that, your data will be submitted and can no longer be changed.</b>
          </p>
        </div>
        
        <div style="background: #e3f0ff; border-radius: 8px; padding: 18px 24px; margin-bottom: 24px;">
          <p style="color: #1976d2; font-size: 16px; text-align: center; margin: 0;">You can now view and edit your responses anytime in your dashboard.</p>
        </div>
        
        <div style="background: #f8f9fa; border-radius: 8px; padding: 18px 24px; margin-bottom: 24px; border: 1px solid #e9ecef;">
          <p style="color: #495057; font-size: 16px; text-align: center; margin: 0;">
            <span style="display: inline-block; vertical-align: middle; margin-right: 8px;">📎</span>
            <b>A detailed PDF report with all your submitted information has been attached to this email.</b>
          </p>
        </div>
        
        <div style="text-align: center; margin: 32px 0;">
          <a href="${process.env.FRONTEND_URL}/dashboard" style="display: inline-block; padding: 14px 36px; background: #1976d2; color: #fff; border-radius: 6px; font-size: 17px; text-decoration: none; font-weight: bold; letter-spacing: 1px; box-shadow: 0 2px 8px rgba(25, 118, 210, 0.10);">Go to Dashboard</a>
        </div>
        <hr style="margin: 32px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #aaa; font-size: 13px; text-align: center;">&copy; ${new Date().getFullYear()} Diabetes Symptom Collector. All rights reserved.</p>
      </div>
    </div>
    `;

    const mailOptions = {
        from: process.env.SMTP_USER,
        to: email,
        subject: '🎉 Details 100% Completed - Diabetes Symptom Collector',
        html
    };

    // Add PDF attachment if generated successfully
    if (pdfFilepath && pdfFilename) {
        mailOptions.attachments = [{
            filename: pdfFilename,
            path: pdfFilepath,
            contentType: 'application/pdf'
        }];
    }

    console.log('📧 Sending email with options:', {
        to: email,
        subject: mailOptions.subject,
        hasAttachment: !!mailOptions.attachments
    });
    
    try {
        await transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully!');
    } catch (error) {
        console.error('❌ Email sending failed:', error.message);
        console.error('❌ Full error details:', error);
        throw error;
    }

    // Clean up the temporary PDF file after sending
    if (pdfFilepath) {
        setTimeout(() => {
            cleanupTempPDF(pdfFilepath);
        }, 5000); // Clean up after 5 seconds
    }
} 