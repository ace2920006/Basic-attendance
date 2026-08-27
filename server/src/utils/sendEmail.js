const nodemailer = require('nodemailer');

/**
 * Sends an email using Nodemailer with SMTP config or dev simulation fallback
 *
 * @param {Object} options { email, subject, message, html }
 * @returns {Promise<Object>} info
 */
const sendEmail = async (options) => {
  const { email, subject, message, html } = options;

  // Check if SMTP environment variables are configured
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT || 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (smtpHost && smtpUser && smtpPass) {
    // Configured Transporter
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: Number(smtpPort),
      secure: Number(smtpPort) === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });

    const mailOptions = {
      from: `"${process.env.FROM_NAME || 'AttendPro System'}" <${process.env.FROM_EMAIL || 'noreply@attendpro.edu'}>`,
      to: email,
      subject: subject,
      text: message,
      html: html || `<p>${message}</p>`
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✉️ Email dispatched to ${email}: Message ID ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  }

  // Development / Simulation Mode
  console.log(`
============================================================
📧 SIMULATED PASSWORD RESET EMAIL DISPATCH
------------------------------------------------------------
To: ${email}
Subject: ${subject}
Message: ${message}
------------------------------------------------------------
(SMTP credentials not set in .env. Email simulation active.)
============================================================
  `);

  return { success: true, simulated: true };
};

module.exports = sendEmail;
