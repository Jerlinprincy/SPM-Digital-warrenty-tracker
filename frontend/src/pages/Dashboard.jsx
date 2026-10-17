import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Calendar,
  AlertTriangle,
  PlusCircle,
  Wrench,
  Clock,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import StatCard from '../components/StatCard';
import WarrantyBadge from '../components/WarrantyBadge';
import ServiceStatusBadge from '../components/ServiceStatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { dashboardService } from '../services/dashboardService';
import { formatDate, fromNow } from '../utils/dateUtils';
import { formatCurrency } from '../utils/formatters';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [warrantyStats, setWarrantyStats] = useState([]);
  const [categoryStats, setCategoryStats] = useState([]);
  const [upcomingItems, setUpcomingItems] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [sumRes, wStatsRes, catStatsRes, upItemsRes] = await Promise.all([
          dashboardService.getSummary(),
          dashboardService.getWarrantyStats(),
          dashboardService.getCategoryStats(),
          dashboardService.getUpcomingItems(),
        ]);

        setSummary(sumRes.data);
        setWarrantyStats(wStatsRes.data || []);
        setCategoryStats(catStatsRes.data || []);
        setUpcomingItems(upItemsRes.data || {});
      } catch (err) {
        console.error('Failed to load dashboard:', err);
        setError('Failed to fetch dashboard metrics. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner size="lg" message="Loading your dashboard analytics..." />;
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 text-red-700 rounded-xl">
        <p className="font-semibold">{error}</p>
      </div>
    );
  }

  const hasWarrantyData = warrantyStats.some((d) => d.value > 0);
  const hasCategoryData = categoryStats.some((d) => d.count > 0);

  return (
    <div className="space-y-8">
      {/* Top Banner / Welcome & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-950 p-6 sm:p-8 rounded-2xl text-white shadow-xl shadow-indigo-950/10">
        <div>
          <span className="text-xs uppercase tracking-wider text-indigo-300 font-bold">
            Overview Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 text-white">
            Digital Warranty & Service Hub
          </h1>
          <p className="text-sm text-indigo-200 mt-1 max-w-xl">
            Live monitoring for all your household assets, warranty lifecycles, and scheduled maintenance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/products/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-indigo-900 hover:bg-indigo-50 font-semibold text-xs rounded-xl shadow-md transition-all duration-150"
          >
            <PlusCircle className="w-4 h-4 text-indigo-600" />
            <span>Add Product</span>
          </Link>
          <Link
            to="/services/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-md border border-indigo-400/30 transition-all duration-150"
          >
            <Wrench className="w-4 h-4" />
            <span>Schedule Service</span>
          </Link>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Total Products"
          value={summary?.totalProducts || 0}
          icon={Package}
          color="indigo"
          subtitle="Registered assets"
          linkTo="/products"
        />
        <StatCard
          title="Active Warranties"
          value={summary?.activeWarranties || 0}
          icon={ShieldCheck}
          color="emerald"
          subtitle="Full coverage active"
          linkTo="/products?status=Active"
        />
        <StatCard
          title="Expiring Soon"
          value={summary?.expiringWithin30Days || 0}
          icon={ShieldAlert}
          color="amber"
          subtitle="Within 30 days"
          linkTo="/products?status=Expiring Soon"
        />
        <StatCard
          title="Expired"
          value={summary?.expiredWarranties || 0}
          icon={ShieldX}
          color="red"
          subtitle="Out of warranty"
          linkTo="/products?status=Expired"
        />
        <StatCard
          title="Upcoming Services"
          value={summary?.upcomingServices || 0}
          icon={Calendar}
          color="blue"
          subtitle="Scheduled visits"
          linkTo="/services?filter=upcoming"
        />
        <StatCard
          title="Overdue Services"
          value={summary?.overdueServices || 0}
          icon={AlertTriangle}
          color="red"
          subtitle="Action required"
          linkTo="/services?filter=overdue"
        />
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Warranty Status Distribution Pie Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Warranty Coverage Breakdown</h2>
              <p className="text-xs text-slate-500">Distribution across active, expiring, and expired statuses</p>
            </div>
            <ShieldCheck className="w-5 h-5 text-indigo-500" />
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {hasWarrantyData ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={warrantyStats}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                  >
                    {warrantyStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value} product(s)`, 'Count']}
                    contentStyle={{ borderRadius: '0.75rem', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    wrapperStyle={{ fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-slate-400">No warranty data available yet.</p>
            )}
          </div>
        </div>

        {/* Product Category Distribution Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Products by Category</h2>
              <p className="text-xs text-slate-500">Number of products registered per appliance category</p>
            </div>
            <TrendingUp className="w-5 h-5 text-indigo-500" />
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {hasCategoryData ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryStats} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    formatter={(val, name, item) => [
                      `${val} items (${formatCurrency(item.payload.totalValue)})`,
                      'Quantity',
                    ]}
                    contentStyle={{ borderRadius: '0.75rem', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {categoryStats.map((entry, index) => (
                      <Cell key={`bar-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-slate-400">No category statistics available yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Action Items: Expiring Warranties & Upcoming Services */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Warranties Nearing Expiration */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-500" />
              <h2 className="text-base font-bold text-slate-900">Expiring Warranties (Next 30 Days)</h2>
            </div>
            <Link
              to="/products?expiringWithinDays=30"
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {upcomingItems?.expiringProducts?.length > 0 ? (
              upcomingItems.expiringProducts.map((p) => (
                <div key={p._id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
                  <div className="min-w-0 flex-1 pr-4">
                    <Link
                      to={`/products/${p._id}`}
                      className="text-sm font-bold text-slate-800 hover:text-indigo-600 truncate block"
                    >
                      {p.productName}
                    </Link>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {p.brand} • {p.category}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <WarrantyBadge
                      status={p.warrantyStatus?.status}
                      daysRemaining={p.warrantyStatus?.daysRemaining}
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Expires {formatDate(p.warrantyExpiryDate)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-sm text-slate-500">
                <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                No warranties expiring within the next 30 days!
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Service Appointments */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              <h2 className="text-base font-bold text-slate-900">Upcoming Maintenance Appointments</h2>
            </div>
            <Link
              to="/services?filter=upcoming"
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {upcomingItems?.upcomingServices?.length > 0 ? (
              upcomingItems.upcomingServices.map((s) => (
                <div key={s._id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
                  <div className="min-w-0 flex-1 pr-4">
                    <p className="text-sm font-bold text-slate-800 truncate">{s.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {s.productId?.productName} • {s.serviceProvider || 'Provider not set'}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <ServiceStatusBadge status={s.status} isOverdue={s.isOverdue} />
                    <p className="text-[11px] text-slate-500 font-medium mt-1">
                      {formatDate(s.scheduledDate)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-sm text-slate-500">
                <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                No upcoming service appointments scheduled.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
