import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export const formatDate = (date, formatStr = 'MMM D, YYYY') => {
  if (!date) return 'N/A';
  return dayjs(date).format(formatStr);
};

export const formatInputDate = (date) => {
  if (!date) return '';
  return dayjs(date).format('YYYY-MM-DD');
};

export const fromNow = (date) => {
  if (!date) return '';
  return dayjs(date).fromNow();
};

export const calculateDaysRemaining = (expiryDate) => {
  if (!expiryDate) return null;
  const now = dayjs().startOf('day');
  const expiry = dayjs(expiryDate).endOf('day');
  return Math.ceil(expiry.diff(now, 'day', true));
};
