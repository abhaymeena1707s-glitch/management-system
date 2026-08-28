const nodemailer = require('nodemailer');

/**
 * Send Email utility supporting standard SMTP and graceful console fallback
 */
const sendEmail = async ({ to, subject, html, text }) => {
  const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER;
  const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = process.env.SMTP_PORT || 587;
  const from = process.env.EMAIL_FROM || '"Library Management Portal" <noreply@library.com>';

  // If SMTP is configured, send via Nodemailer
  if (smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: Number(smtpPort),
        secure: Number(smtpPort) === 465, // true for 465, false for other ports
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      const info = await transporter.sendMail({
        from,
        to,
        subject,
        text: text || html.replace(/<[^>]*>?/gm, ''),
        html,
      });

      console.log(`📧 Email sent to ${to} (MessageId: ${info.messageId})`);
      return { success: true, messageId: info.messageId };
    } catch (err) {
      console.error(`❌ SMTP Email Sending Error: ${err.message}`);
      // Fallback logging
      console.log(`========================================`);
      console.log(`📧 [EMAIL FALLBACK TO LOG]`);
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`========================================`);
      return { success: true, fallback: true, error: err.message };
    }
  }

  // Fallback mode (Development / Demo when SMTP is not configured)
  console.log(`\n===================================================`);
  console.log(`📧 [EMAIL NOTICE - DEMO / DEV MODE]`);
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Content:\n${text || html.replace(/<[^>]*>?/gm, '')}`);
  console.log(`===================================================\n`);

  return { success: true, simulated: true };
};

module.exports = sendEmail;
