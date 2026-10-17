const {
  calculateWarrantyExpiryDate,
  getWarrantyStatus,
} = require('../utils/warrantyCalculator');
const dayjs = require('dayjs');

describe('Warranty Calculator Utility Tests', () => {
  describe('calculateWarrantyExpiryDate', () => {
    test('calculates 12-month warranty with inclusive end date', () => {
      const startDate = '2024-01-15';
      const durationMonths = 12;
      const expiry = calculateWarrantyExpiryDate(startDate, durationMonths);

      expect(expiry).not.toBeNull();
      // Ends on 2025-01-14 at 23:59:59.999
      expect(dayjs(expiry).format('YYYY-MM-DD')).toBe('2025-01-14');
      expect(dayjs(expiry).hour()).toBe(23);
      expect(dayjs(expiry).minute()).toBe(59);
    });

    test('correctly handles month-end in leap year (Jan 31, 2024 + 1 month)', () => {
      const startDate = '2024-01-31';
      const durationMonths = 1;
      const expiry = calculateWarrantyExpiryDate(startDate, durationMonths);

      expect(expiry).not.toBeNull();
      // Jan 31 + 1 month = Feb 29 (2024 is leap year). Subtract 1 day for inclusive end = Feb 28.
      expect(dayjs(expiry).format('YYYY-MM-DD')).toBe('2024-02-28');
    });

    test('correctly handles month-end in non-leap year (Jan 31, 2023 + 1 month)', () => {
      const startDate = '2023-01-31';
      const durationMonths = 1;
      const expiry = calculateWarrantyExpiryDate(startDate, durationMonths);

      expect(expiry).not.toBeNull();
      // Jan 31 + 1 month = Feb 28 (non-leap year). Subtract 1 day = Feb 27.
      expect(dayjs(expiry).format('YYYY-MM-DD')).toBe('2023-02-27');
    });

    test('returns null when duration is 0 or negative', () => {
      expect(calculateWarrantyExpiryDate('2024-01-01', 0)).toBeNull();
      expect(calculateWarrantyExpiryDate('2024-01-01', -5)).toBeNull();
      expect(calculateWarrantyExpiryDate('2024-01-01', null)).toBeNull();
    });

    test('returns null when start date is invalid', () => {
      expect(calculateWarrantyExpiryDate('not-a-valid-date', 12)).toBeNull();
    });
  });

  describe('getWarrantyStatus', () => {
    test('returns "No Warranty" when duration is 0', () => {
      const product = {
        warrantyDurationMonths: 0,
        warrantyExpiryDate: null,
      };
      const res = getWarrantyStatus(product);
      expect(res.status).toBe('No Warranty');
      expect(res.daysRemaining).toBeNull();
      expect(res.isExpired).toBe(false);
      expect(res.isExpiringSoon).toBe(false);
    });

    test('returns "Active" when expiry date is more than 30 days in future', () => {
      const today = dayjs('2024-06-01');
      const product = {
        warrantyDurationMonths: 12,
        warrantyExpiryDate: dayjs('2024-08-01').toDate(), // 61 days ahead
      };
      const res = getWarrantyStatus(product, today.toDate());
      expect(res.status).toBe('Active');
      expect(res.daysRemaining).toBeGreaterThan(30);
      expect(res.isExpiringSoon).toBe(false);
      expect(res.isExpired).toBe(false);
    });

    test('returns "Expiring Soon" when expiry date is within 30 days', () => {
      const today = dayjs('2024-06-01');
      const product = {
        warrantyDurationMonths: 12,
        warrantyExpiryDate: dayjs('2024-06-15').toDate(), // 14 days ahead
      };
      const res = getWarrantyStatus(product, today.toDate());
      expect(res.status).toBe('Expiring Soon');
      expect(res.daysRemaining).toBe(15);
      expect(res.isExpiringSoon).toBe(true);
      expect(res.isExpired).toBe(false);
    });

    test('returns "Expired" when expiry date has passed', () => {
      const today = dayjs('2024-06-01');
      const product = {
        warrantyDurationMonths: 12,
        warrantyExpiryDate: dayjs('2024-05-15').toDate(), // past date
      };
      const res = getWarrantyStatus(product, today.toDate());
      expect(res.status).toBe('Expired');
      expect(res.daysRemaining).toBe(0);
      expect(res.isExpired).toBe(true);
      expect(res.isExpiringSoon).toBe(false);
    });
  });
});
