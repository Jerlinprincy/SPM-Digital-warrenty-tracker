const nodemailer = require('nodemailer');

const isEmailConfigured = () => {
  return (
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS &&
    process.env.SMTP_HOST.trim() !== ''
  );
};

let transporter = null;

if (isEmailConfigured()) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

/**
 * Sends an email notification if SMTP is configured.
 * Safely resolves false if not configured or on network error.
 */
const sendEmail = async ({ to, subject, html }) => {
  if (!isEmailConfigured() || !transporter) {
    // Graceful skip - email service not configured
    return false;
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"Digital Warranty Tracker" <notifications@warrantytracker.local>',
      to,
      subject,
      html,
    });
    console.log(`[Email Sent] Message ID: ${info.messageId} to ${to}`);
    return true;
  } catch (error) {
    console.warn(`[Email Notification Warning] Failed to send email to ${to}: ${error.message}`);
    return false;
  }
};

module.exports = {
  sendEmail,
  isEmailConfigured,
};
