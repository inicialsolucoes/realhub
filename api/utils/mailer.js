const nodemailer = require('nodemailer');

// Configure transporter
// For production, these should be in .env: 
// SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'localhost',
    port: process.env.SMTP_PORT || 25,
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    },
    debug: true, // Show SMTP traffic
    logger: true // Log to console
});

exports.sendResetEmail = async (email, token) => {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${token}`;

    // If no SMTP host is provided, we stay in development mode (log to terminal only)
    if (!process.env.SMTP_HOST || process.env.SMTP_HOST === 'localhost') {
        console.log('-----------------------------------------');
        console.log('📬 RESET PASSWORD EMAIL (DEVELOPMENT MODE)');
        console.log(`To: ${email}`);
        console.log(`Link: ${resetUrl}`);
        console.log('Note: SMTP_HOST not configured or set to localhost. No real email sent.');
        console.log('-----------------------------------------');
        return true;
    }

    console.log(`Attempting to send real email to ${email} via ${process.env.SMTP_HOST}...`);

    const mailOptions = {
        from: `"RealHub" <${process.env.SMTP_FROM}>`,
        to: email,
        subject: 'Redefinição de Senha - RealHub',
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px;">
                <h2 style="color: #1e3a8a;">Olá,</h2>
                <p>Recebemos uma solicitação para redefinir a senha da sua conta no RealHub.</p>
                <p>Clique no botão abaixo para escolher uma nova senha. Este link expira em 1 hora.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}" style="background-color: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Redefinir Senha</a>
                </div>
                <p style="font-size: 14px; color: #64748b;">Se você não solicitou isso, pode ignorar este email com segurança.</p>
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                <p style="font-size: 12px; color: #94a3b8;">RealHub - Sistema de Gestão Condominial</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};
