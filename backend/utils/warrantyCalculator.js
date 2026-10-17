const dayjs = require('dayjs');

/**
 * Calculates the warranty expiration date based on warranty start date and duration in months.
 * 
 * Rules:
 * - If duration is 0 or null, returns null (indicates No Warranty).
 * - Expiration date is INCLUSIVE: Coverage lasts through 23:59:59 of the final day.
 *   Example: Start Date = 2024-01-15, Duration = 12 months.
 *   Coverage runs through 2025-01-14 23:59:59.999.
 * - Handles month-ends properly via Day.js month addition:
 *   Example: 2024-01-31 + 1 month = 2024-02-29 (leap year) -> inclusive end = 2024-02-28 23:59:59.999
 *            2023-01-31 + 1 month = 2023-02-28 (non-leap) -> inclusive end = 2023-02-27 23:59:59.999
 *
 * @param {Date|string} startDate 
 * @param {number} durationMonths 
 * @returns {Date|null}
 */
const calculateWarrantyExpiryDate = (startDate, durationMonths) => {
  const duration = parseInt(durationMonths, 10);
  if (!startDate || isNaN(duration) || duration <= 0) {
    return null;
  }

  const start = dayjs(startDate);
  if (!start.isValid()) {
    return null;
  }

  // Add months, subtract 1 day to make the period inclusive, and set to end of that calendar day
  const expiry = start
    .add(duration, 'month')
    .subtract(1, 'day')
    .endOf('day');

  return expiry.toDate();
};

/**
 * Computes dynamic warranty status and days remaining relative to current date.
 * Does not require manual database cron changes to maintain correctness.
 * 
 * Statuses:
 * - 'No Warranty' (duration <= 0 or no expiry date)
 * - 'Active' (daysRemaining > 30)
 * - 'Expiring Soon' (0 <= daysRemaining <= 30)
 * - 'Expired' (daysRemaining < 0)
 * 
 * @param {Object} product 
 * @param {Date} [referenceDate=new Date()]
 * @returns {{ status: string, daysRemaining: number|null, isExpiringSoon: boolean, isExpired: boolean }}
 */
const getWarrantyStatus = (product, referenceDate = new Date()) => {
  if (!product || !product.warrantyDurationMonths || product.warrantyDurationMonths <= 0 || !product.warrantyExpiryDate) {
    return {
      status: 'No Warranty',
      daysRemaining: null,
      isExpiringSoon: false,
      isExpired: false
    };
  }

  const now = dayjs(referenceDate).startOf('day');
  const expiry = dayjs(product.warrantyExpiryDate).endOf('day');

  // Exact calendar days difference
  const diffDays = Math.ceil(expiry.diff(now, 'day', true));

  if (diffDays < 0) {
    return {
      status: 'Expired',
      daysRemaining: 0,
      isExpiringSoon: false,
      isExpired: true
    };
  }

  if (diffDays <= 30) {
    return {
      status: 'Expiring Soon',
      daysRemaining: diffDays,
      isExpiringSoon: true,
      isExpired: false
    };
  }

  return {
    status: 'Active',
    daysRemaining: diffDays,
    isExpiringSoon: false,
    isExpired: false
  };
};

module.exports = {
  calculateWarrantyExpiryDate,
  getWarrantyStatus
};
