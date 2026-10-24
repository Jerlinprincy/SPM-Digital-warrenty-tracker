const dayjs = require('dayjs');

/**
 * Builds responsive, modern HTML email templates for warranty alerts.
 */
function buildWarrantyEmailTemplate({
  userName,
  productName,
  brand,
  modelNumber,
  serialNumber,
  warrantyExpiryDate,
  daysRemaining,
  milestoneType,
  brandHelpline,
  brandPortal,
}) {
  const isOneDay = daysRemaining === 1;
  const isOneWeek = daysRemaining === 7;
  const isExpired = daysRemaining <= 0;

  let bannerBg = 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)';
  let badgeText = `${daysRemaining} Days Left`;
  let badgeBg = '#e0e7ff';
  let badgeColor = '#3730a3';
  let alertTitle = `Warranty Alert: ${daysRemaining} Days Remaining`;

  if (isOneDay) {
    bannerBg = 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)';
    badgeText = 'Expires Tomorrow (1 Day Left)';
    badgeBg = '#fee2e2';
    badgeColor = '#991b1b';
    alertTitle = '🚨 Final Warning: Warranty Expires Tomorrow!';
  } else if (isOneWeek) {
    bannerBg = 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)';
    badgeText = '1 Week Remaining (7 Days)';
    badgeBg = '#ffedd5';
    badgeColor = '#9a3412';
    alertTitle = '⚠️ Urgent Notice: Warranty Expiring in 1 Week';
  } else if (isExpired) {
    bannerBg = 'linear-gradient(135deg, #475569 0%, #1e293b 100%)';
    badgeText = 'Warranty Concluded';
    badgeBg = '#f1f5f9';
    badgeColor = '#475569';
    alertTitle = 'Warranty Coverage Expired';
  }

  const formattedExpiry = dayjs(warrantyExpiryDate).format('MMMM D, YYYY');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${alertTitle}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 30px 15px;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;" cellspacing="0" cellpadding="0">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: ${bannerBg}; padding: 36px 30px; text-align: center; color: #ffffff;">
              <table role="presentation" align="center" style="margin-bottom: 12px;">
                <tr>
                  <td style="background-color: rgba(255, 255, 255, 0.2); padding: 8px 16px; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
                    🛡️ Digital Warranty Tracker
                  </td>
                </tr>
              </table>
              <h1 style="margin: 0; font-size: 24px; font-weight: 800; line-height: 1.3; letter-spacing: -0.5px;">
                ${alertTitle}
              </h1>
              <p style="margin: 8px 0 0; font-size: 14px; opacity: 0.9;">
                Automated Milestone Alert for your Household Assets
              </p>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 30px;">
              <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #334155;">
                Hello <strong>${userName || 'Valued User'}</strong>,
              </p>
              
              <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.6; color: #334155;">
                ${
                  isOneDay
                    ? `This is your <strong>final reminder</strong> that the manufacturer warranty for your <strong>${productName}</strong> ends <strong>tomorrow (${formattedExpiry})</strong>.`
                    : isOneWeek
                    ? `This is an important reminder that your manufacturer warranty for <strong>${productName}</strong> will expire in <strong>1 week (${formattedExpiry})</strong>.`
                    : `Your warranty coverage for <strong>${productName}</strong> is expiring soon on <strong>${formattedExpiry}</strong>.`
                }
              </p>

              <!-- Product Specifications Card -->
              <table role="presentation" width="100%" style="background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 24px;" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding: 20px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td colspan="2" style="padding-bottom: 12px; border-bottom: 1px solid #e2e8f0;">
                          <span style="font-size: 16px; font-weight: 700; color: #0f172a;">${productName}</span>
                          <span style="display: inline-block; background-color: ${badgeBg}; color: ${badgeColor}; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 6px; margin-left: 8px;">
                            ${badgeText}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-top: 12px; font-size: 13px; color: #64748b; width: 40%;">Brand / Manufacturer:</td>
                        <td style="padding-top: 12px; font-size: 13px; font-weight: 600; color: #1e293b;">${brand || 'N/A'}</td>
                      </tr>
                      <tr>
                        <td style="padding-top: 8px; font-size: 13px; color: #64748b;">Model Number:</td>
                        <td style="padding-top: 8px; font-size: 13px; font-weight: 600; color: #1e293b;">${modelNumber || 'N/A'}</td>
                      </tr>
                      ${
                        serialNumber
                          ? `<tr>
                              <td style="padding-top: 8px; font-size: 13px; color: #64748b;">Serial Number:</td>
                              <td style="padding-top: 8px; font-size: 13px; font-weight: 600; color: #1e293b; font-family: monospace;">${serialNumber}</td>
                            </tr>`
                          : ''
                      }
                      <tr>
                        <td style="padding-top: 8px; font-size: 13px; color: #64748b;">Expiration Date:</td>
                        <td style="padding-top: 8px; font-size: 13px; font-weight: 700; color: ${isOneDay ? '#dc2626' : '#ea580c'};">
                          ${formattedExpiry} (Valid through 23:59:59)
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Actionable Advice -->
              <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 14px 16px; border-radius: 8px; margin-bottom: 24px;">
                <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #92400e;">
                  <strong>💡 Pro-tip before expiration:</strong> Check if your appliance has any pending defects, unusual noises, or loose parts. Book a free authorized technician inspection or request free replacement parts before the warranty window closes.
                </p>
              </div>

              ${
                brandHelpline
                  ? `<!-- Helpline Banner -->
                    <table role="presentation" width="100%" style="background-color: #f1f5f9; border-radius: 12px; border: 1px solid #cbd5e1; margin-bottom: 24px;" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="padding: 16px; text-align: center;">
                          <p style="margin: 0 0 6px; font-size: 12px; font-weight: 700; text-transform: uppercase; color: #475569;">
                            Official ${brand} Customer Helpline
                          </p>
                          <p style="margin: 0; font-size: 18px; font-weight: 800; color: #0f172a; font-family: monospace;">
                            📞 ${brandHelpline}
                          </p>
                        </td>
                      </tr>
                    </table>`
                  : ''
              }

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding: 10px 0 20px;">
                    <a href="${brandPortal || 'http://localhost:5173/products'}" target="_blank" style="display: inline-block; background-color: #4f46e5; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 700; padding: 14px 30px; border-radius: 10px; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);">
                      Manage Product in Digital Warranty Tracker →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 16px 0 0; font-size: 12px; line-height: 1.5; color: #94a3b8; text-align: center;">
                Need to log a technician appointment? Visit your <a href="http://localhost:5173/services" style="color: #6366f1; text-decoration: underline;">Service Records</a> tab.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f1f5f9; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b;">
              <p style="margin: 0 0 4px;">
                This automated reminder was sent by <strong>Digital Warranty & Service Tracker</strong>.
              </p>
              <p style="margin: 0;">
                Milestone reminders are dispatched at 30 days, 7 days (1 week), and 1 day before expiration.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

module.exports = {
  buildWarrantyEmailTemplate,
};
