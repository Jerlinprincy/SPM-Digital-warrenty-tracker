const nodemailer = require('nodemailer');

const isEmailConfigured = () => {
  return Boolean(
    process.env.SMTP_USER &&
    process.env.SMTP_PASS &&
    process.env.SMTP_USER.trim() !== '' &&
    process.env.SMTP_PASS.trim() !== ''
  );
};

let cachedTransporter = null;

/**
 * Returns or initializes the nodemailer transporter based on .env config.
 */
const getTransporter = async () => {
  if (cachedTransporter) return cachedTransporter;

  if (isEmailConfigured()) {
    const isGmail =
      process.env.SMTP_SERVICE?.toLowerCase() === 'gmail' ||
      process.env.SMTP_HOST?.toLowerCase().includes('gmail');

    if (isGmail) {
      cachedTransporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS, // App password without spaces
        },
      });
      console.log(`[Email Service] Configured Gmail SMTP for ${process.env.SMTP_USER}`);
    } else {
      cachedTransporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_PORT === '465',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      console.log(`[Email Service] Configured custom SMTP (${process.env.SMTP_HOST}:${process.env.SMTP_PORT || 587})`);
    }

    try {
      await cachedTransporter.verify();
      console.log('[Email Service] ✓ SMTP connection verified successfully.');
    } catch (verifyErr) {
      console.warn('[Email Service Warning] SMTP verification failed:', verifyErr.message);
    }

    return cachedTransporter;
  }

  return null;
};

/**
 * Sends an email notification.
 * @param {object} param0 { to, subject, html, text }
 */
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const transporter = await getTransporter();

    if (!transporter) {
      console.log(`[Email Skipped] SMTP not configured. Notification was created in-app for ${to}.`);
      return { success: false, reason: 'SMTP_NOT_CONFIGURED' };
    }

    const fromAddress =
      process.env.EMAIL_FROM ||
      `"Digital Warranty Tracker" <${process.env.SMTP_USER || 'notifications@warrantytracker.local'}>`;

    const info = await transporter.sendMail({
      from: fromAddress,
      to,
      subject,
      html,
      text: text || html?.replace(/<[^>]*>?/gm, ''),
    });

    console.log(`[Email Sent Successfully] Message ID: ${info.messageId} to ${to}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[Email Notification Error] Failed sending to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Verifies email connection and sends a test email to the user.
 */
const sendTestEmail = async (targetEmail, userName = 'User') => {
  const { buildWarrantyEmailTemplate } = require('./emailTemplates');

  const testHtml = buildWarrantyEmailTemplate({
    userName,
    productName: 'Sony Bravia 55" OLED TV (Demo Test)',
    brand: 'Sony',
    modelNumber: 'XR-55A80L',
    serialNumber: 'SN-DEMO-2026',
    warrantyExpiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    daysRemaining: 7,
    milestoneType: 'warranty_expiring_7',
    brandHelpline: '1800-103-7799',
  });

  return sendEmail({
    to: targetEmail,
    subject: '[Test Alert] ⚠️ 1 Week Left: Warranty Expiration Test',
    html: testHtml,
  });
};

module.exports = {
  sendEmail,
  sendTestEmail,
  isEmailConfigured,
  getTransporter,
};
