const Notification = require('../models/Notification');
const Product = require('../models/Product');
const ServiceRecord = require('../models/ServiceRecord');
const User = require('../models/User');
const { sendEmail } = require('./emailService');
const { buildWarrantyEmailTemplate } = require('./emailTemplates');
const dayjs = require('dayjs');

/**
 * Scans products and services to generate reminders idempotently.
 * Safe to run frequently or upon server restart.
 */
const generateReminders = async () => {
  let createdCount = 0;
  const today = dayjs().startOf('day');

  try {
    // 1. Process Warranty Expiration Reminders
    const productsWithWarranty = await Product.find({
      warrantyDurationMonths: { $gt: 0 },
      warrantyExpiryDate: { $ne: null },
    }).populate('userId', 'name email');

    for (const product of productsWithWarranty) {
      if (!product.userId) continue;

      const expiry = dayjs(product.warrantyExpiryDate).startOf('day');
      const diffDays = Math.ceil(expiry.diff(today, 'day', true));
      const expiryFormatted = dayjs(product.warrantyExpiryDate).format('YYYY-MM-DD');

      // Milestone check: 30 days, 7 days (1 week), 1 day (tomorrow), or expired today (0)
      const milestones = [
        { days: 30, type: 'warranty_expiring_30', title: 'Warranty Expiring in 30 Days' },
        { days: 7, type: 'warranty_expiring_7', title: 'Urgent: Warranty Expiring in 1 Week (7 Days)' },
        { days: 1, type: 'warranty_expiring_1', title: 'Final Reminder: Warranty Expires Tomorrow (1 Day)' },
        { days: 0, type: 'warranty_expired', title: 'Warranty Expired' },
      ];

      for (const milestone of milestones) {
        if (diffDays === milestone.days) {
          const deduplicationKey = `${product.userId._id}_${product._id}_${milestone.type}_${expiryFormatted}`;

          const exists = await Notification.findOne({ deduplicationKey });
          if (!exists) {
            let message = '';
            if (milestone.days > 0) {
              message = `Your warranty for "${product.productName}" (${product.brand} ${product.modelNumber}) expires in ${milestone.days} day${milestone.days > 1 ? 's' : ''} on ${dayjs(product.warrantyExpiryDate).format('MMM D, YYYY')}.`;
            } else {
              message = `The warranty coverage for "${product.productName}" (${product.brand} ${product.modelNumber}) has concluded.`;
            }

            try {
              await Notification.create({
                userId: product.userId._id,
                productId: product._id,
                type: milestone.type,
                title: milestone.title,
                message,
                deduplicationKey,
                scheduledFor: new Date(),
              });
              createdCount++;

              // Dispatch real-time Nodemailer alert if user has email
              if (product.userId.email) {
                let subject = `[Warranty Alert] ${milestone.title}: ${product.productName}`;
                if (milestone.days === 7) {
                  subject = `[Warranty Alert] ⚠️ 1 Week Left: Your warranty for "${product.productName}" expires in 7 days`;
                } else if (milestone.days === 1) {
                  subject = `[Final Warning] 🚨 1 Day Left: Your warranty for "${product.productName}" expires tomorrow!`;
                }

                const emailHtml = buildWarrantyEmailTemplate({
                  userName: product.userId.name,
                  productName: product.productName,
                  brand: product.brand,
                  modelNumber: product.modelNumber,
                  serialNumber: product.serialNumber,
                  warrantyExpiryDate: product.warrantyExpiryDate,
                  daysRemaining: milestone.days,
                  milestoneType: milestone.type,
                });

                await sendEmail({
                  to: product.userId.email,
                  subject,
                  html: emailHtml,
                });
              }
            } catch (err) {
              // Ignore duplicate key race conditions silently
              if (err.code !== 11000) {
                console.error('[Notification Creation Error]:', err.message);
              }
            }
          }
        }
      }
    }

    // 2. Process Service Maintenance Reminders
    const scheduledServices = await ServiceRecord.find({
      status: 'Scheduled',
    })
      .populate('userId', 'name email')
      .populate('productId', 'productName brand modelNumber');

    for (const service of scheduledServices) {
      if (!service.userId) continue;

      const scheduledDate = dayjs(service.scheduledDate).startOf('day');
      const diffDays = Math.ceil(scheduledDate.diff(today, 'day', true));
      const scheduledDateStr = scheduledDate.format('YYYY-MM-DD');

      // Check for upcoming service (in 1 or 2 days)
      if (diffDays >= 0 && diffDays <= 2) {
        const deduplicationKey = `${service.userId._id}_${service._id}_upcoming_${scheduledDateStr}_d${diffDays}`;
        const exists = await Notification.findOne({ deduplicationKey });

        if (!exists) {
          const prodName = service.productId ? service.productId.productName : 'Product';
          const message = `Service reminder: "${service.title}" for ${prodName} is scheduled ${
            diffDays === 0 ? 'today' : `in ${diffDays} day(s)`
          } on ${dayjs(service.scheduledDate).format('MMM D, YYYY')}.`;

          try {
            await Notification.create({
              userId: service.userId._id,
              serviceRecordId: service._id,
              productId: service.productId ? service.productId._id : null,
              type: 'service_upcoming',
              title: 'Upcoming Service Appointment',
              message,
              deduplicationKey,
              scheduledFor: new Date(),
            });
            createdCount++;

            if (service.userId.email) {
              await sendEmail({
                to: service.userId.email,
                subject: `[Service Reminder] Upcoming Service: ${service.title}`,
                html: `<p>Hello ${service.userId.name},</p><p>${message}</p>`,
              });
            }
          } catch (err) {
            if (err.code !== 11000) console.error(err.message);
          }
        }
      }

      // Check for overdue service (past scheduled date and still 'Scheduled')
      if (diffDays < 0) {
        const deduplicationKey = `${service.userId._id}_${service._id}_overdue_${scheduledDateStr}`;
        const exists = await Notification.findOne({ deduplicationKey });

        if (!exists) {
          const prodName = service.productId ? service.productId.productName : 'Product';
          const message = `Attention: Service appointment "${service.title}" for ${prodName} was scheduled for ${dayjs(service.scheduledDate).format('MMM D, YYYY')} and is now overdue. Please update or reschedule.`;

          try {
            await Notification.create({
              userId: service.userId._id,
              serviceRecordId: service._id,
              productId: service.productId ? service.productId._id : null,
              type: 'service_overdue',
              title: 'Overdue Service Appointment',
              message,
              deduplicationKey,
              scheduledFor: new Date(),
            });
            createdCount++;

            if (service.userId.email) {
              await sendEmail({
                to: service.userId.email,
                subject: `[Overdue Service Alert] ${service.title}`,
                html: `<p>Hello ${service.userId.name},</p><p>${message}</p>`,
              });
            }
          } catch (err) {
            if (err.code !== 11000) console.error(err.message);
          }
        }
      }
    }

    console.log(`[Notification Engine] Idempotent scan complete. Generated ${createdCount} new reminder(s).`);
    return { success: true, createdCount };
  } catch (error) {
    console.error('[Notification Engine Error]:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  generateReminders,
};
