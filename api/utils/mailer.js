const nodemailer = require('nodemailer');

// Configure transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'localhost',
    port: process.env.SMTP_PORT || 25,
    secure: process.env.SMTP_SECURE === 'true', 
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    },
    debug: true,
    logger: true
});

exports.sendResetEmail = async (email, token) => {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${token}`;

    if (!process.env.SMTP_HOST || process.env.SMTP_HOST === 'localhost') {
        console.log('-----------------------------------------');
        console.log('📬 RESET PASSWORD EMAIL (DEVELOPMENT MODE)');
        console.log(`To: ${email}`);
        console.log(`Link: ${resetUrl}`);
        console.log('-----------------------------------------');
        return true;
    }

    const mailOptions = {
        from: `"RealHub" <${process.env.SMTP_FROM}>`,
        to: email,
        subject: 'Redefinição de Senha - RealHub',
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px;">
                <h2 style="color: #1e3a8a;">Olá,</h2>
                <p>Recebemos uma solicitação para redefinir a senha da sua conta no RealHub.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}" style="background-color: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Redefinir Senha</a>
                </div>
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                <p style="font-size: 12px; color: #94a3b8;">RealHub - Sistema de Gestão Condominial</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Error sending reset email:', error);
        throw error;
    }
};

exports.sendNotificationEmail = async (email, title, body) => {
    if (!process.env.SMTP_HOST || process.env.SMTP_HOST === 'localhost') {
        console.log('-----------------------------------------');
        console.log('📬 NOTIFICATION EMAIL (DEVELOPMENT MODE)');
        console.log(`To: ${email}`);
        console.log(`Title: ${title}`);
        console.log(`Body: ${body}`);
        console.log('-----------------------------------------');
        return true;
    }

    const mailOptions = {
        from: `"RealHub" <${process.env.SMTP_FROM}>`,
        to: email,
        subject: title,
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px;">
                <h2 style="color: #1e3a8a;">Olá,</h2>
                <p>${body}</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" style="background-color: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Ver no RealHub</a>
                </div>
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                <p style="font-size: 12px; color: #94a3b8;">RealHub - Sistema de Gestão Condominial</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Error sending notification email:', error);
        throw error;
    }
};
