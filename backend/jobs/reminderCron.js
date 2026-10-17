const cron = require('node-cron');
const { generateReminders } = require('../services/notificationService');

const initReminderCron = () => {
  const schedule = process.env.CRON_SCHEDULE || '0 8 * * *';

  console.log(`[Cron Scheduler] Initializing reminder cron with schedule: "${schedule}"`);

  // Scheduled job
  cron.schedule(schedule, async () => {
    console.log('[Cron Job] Executing scheduled daily reminder check...');
    await generateReminders();
  });

  // Run initial scan 5 seconds after server startup to update any pending notifications
  setTimeout(async () => {
    console.log('[Cron Job] Running initial startup notification scan...');
    await generateReminders();
  }, 5000);
};

module.exports = initReminderCron;
