export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export const getCategoryColor = (category) => {
  switch (category) {
    case 'Electronics':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'Home Appliances':
      return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    case 'Furniture':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'Kitchen Appliances':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
};
