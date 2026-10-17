const Product = require('../models/Product');
const ServiceRecord = require('../models/ServiceRecord');
const dayjs = require('dayjs');

// @desc    Get dashboard summary statistics
// @route   GET /api/dashboard/summary
// @access  Private
const getDashboardSummary = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = dayjs().startOf('day').toDate();

    // Fetch all products of user to compute exact dynamic warranty statuses
    const products = await Product.find({ userId });
    const totalProducts = products.length;

    let activeWarranties = 0;
    let expiringWithin30Days = 0;
    let expiredWarranties = 0;
    let noWarrantyCount = 0;

    products.forEach((p) => {
      const status = p.warrantyStatus.status;
      if (status === 'Active') activeWarranties++;
      else if (status === 'Expiring Soon') expiringWithin30Days++;
      else if (status === 'Expired') expiredWarranties++;
      else if (status === 'No Warranty') noWarrantyCount++;
    });

    // Count upcoming & overdue services
    const upcomingServices = await ServiceRecord.countDocuments({
      userId,
      status: 'Scheduled',
      scheduledDate: { $gte: now },
    });

    const overdueServices = await ServiceRecord.countDocuments({
      userId,
      status: 'Scheduled',
      scheduledDate: { $lt: now },
    });

    const completedServices = await ServiceRecord.countDocuments({
      userId,
      status: 'Completed',
    });

    res.status(200).json({
      success: true,
      data: {
        totalProducts,
        activeWarranties,
        expiringWithin30Days,
        expiredWarranties,
        noWarrantyCount,
        upcomingServices,
        overdueServices,
        completedServices,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get warranty status distribution for charts
// @route   GET /api/dashboard/warranty-stats
// @access  Private
const getWarrantyStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const products = await Product.find({ userId });

    const statusCounts = {
      Active: 0,
      'Expiring Soon': 0,
      Expired: 0,
      'No Warranty': 0,
    };

    products.forEach((p) => {
      const status = p.warrantyStatus.status;
      if (statusCounts[status] !== undefined) {
        statusCounts[status]++;
      }
    });

    const chartData = [
      { name: 'Active', value: statusCounts.Active, color: '#10b981' }, // emerald-500
      { name: 'Expiring Soon', value: statusCounts['Expiring Soon'], color: '#f59e0b' }, // amber-500
      { name: 'Expired', value: statusCounts.Expired, color: '#ef4444' }, // red-500
      { name: 'No Warranty', value: statusCounts['No Warranty'], color: '#94a3b8' }, // slate-400
    ];

    res.status(200).json({
      success: true,
      data: chartData,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get category distribution and spending for charts
// @route   GET /api/dashboard/category-stats
// @access  Private
const getCategoryStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const categoryStats = await Product.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalValue: { $sum: '$purchasePrice' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const categories = ['Electronics', 'Home Appliances', 'Furniture', 'Kitchen Appliances', 'Other'];
    const palette = ['#6366f1', '#3b82f6', '#14b8a6', '#f97316', '#8b5cf6'];

    const formattedData = categories.map((cat, index) => {
      const existing = categoryStats.find((item) => item._id === cat);
      return {
        name: cat,
        count: existing ? existing.count : 0,
        totalValue: existing ? existing.totalValue : 0,
        color: palette[index % palette.length],
      };
    });

    res.status(200).json({
      success: true,
      data: formattedData,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get upcoming and expiring action items for quick dashboard visibility
// @route   GET /api/dashboard/upcoming-items
// @access  Private
const getUpcomingItems = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = dayjs().startOf('day').toDate();
    const thirtyDaysAhead = dayjs().add(30, 'day').endOf('day').toDate();

    // Products expiring in the next 30 days
    const expiringProducts = await Product.find({
      userId,
      warrantyDurationMonths: { $gt: 0 },
      warrantyExpiryDate: { $gte: now, $lte: thirtyDaysAhead },
    })
      .sort({ warrantyExpiryDate: 1 })
      .limit(5);

    // Upcoming scheduled services
    const upcomingServices = await ServiceRecord.find({
      userId,
      status: 'Scheduled',
      scheduledDate: { $gte: now },
    })
      .populate('productId', 'productName brand')
      .sort({ scheduledDate: 1 })
      .limit(5);

    // Overdue services
    const overdueServices = await ServiceRecord.find({
      userId,
      status: 'Scheduled',
      scheduledDate: { $lt: now },
    })
      .populate('productId', 'productName brand')
      .sort({ scheduledDate: 1 })
      .limit(5);

    // Recent service history
    const recentServiceHistory = await ServiceRecord.find({
      userId,
      status: 'Completed',
    })
      .populate('productId', 'productName brand')
      .sort({ completedAt: -1, updatedAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        expiringProducts,
        upcomingServices,
        overdueServices,
        recentServiceHistory,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardSummary,
  getWarrantyStats,
  getCategoryStats,
  getUpcomingItems,
};
