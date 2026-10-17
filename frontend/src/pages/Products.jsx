import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Package,
  Search,
  Filter,
  Plus,
  ArrowUpDown,
  Trash2,
  Edit,
  Eye,
  FileText,
  Calendar,
} from 'lucide-react';
import { productService } from '../services/productService';
import WarrantyBadge from '../components/WarrantyBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import { formatDate } from '../utils/dateUtils';
import { formatCurrency, getCategoryColor } from '../utils/formatters';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters state initialized from URL params if present
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [status, setStatus] = useState(searchParams.get('status') || 'All');
  const [expiringDays, setExpiringDays] = useState(searchParams.get('expiringWithinDays') || '');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Deletion modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (category !== 'All') params.category = category;
      if (status !== 'All') params.status = status;
      if (expiringDays) params.expiringWithinDays = expiringDays;
      params.sortBy = sortBy;
      params.sortOrder = sortOrder;

      const data = await productService.getProducts(params);
      setProducts(data.products || []);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products.');
    } finally {
      setLoading(false);
    }
  }, [search, category, status, expiringDays, sortBy, sortOrder]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const openDeleteModal = (product) => {
    setProductToDelete(product);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    try {
      setDeleting(true);
      await productService.deleteProduct(productToDelete._id);
      setDeleteModalOpen(false);
      setProductToDelete(null);
      await fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete product.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Registered Products
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your household assets, track warranty statuses, and invoices
          </p>
        </div>

        <Link
          to="/products/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all shadow-indigo-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </Link>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by product name, brand, or model..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 transition-colors"
          >
            Search
          </button>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          {/* Category Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Categories</option>
              <option value="Electronics">Electronics</option>
              <option value="Home Appliances">Home Appliances</option>
              <option value="Kitchen Appliances">Kitchen Appliances</option>
              <option value="Furniture">Furniture</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Warranty Status Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Warranty Status
            </label>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                if (e.target.value !== 'All') setExpiringDays('');
              }}
              className="w-full py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Expiring Soon">Expiring Soon (≤30d)</option>
              <option value="Expired">Expired</option>
              <option value="No Warranty">No Warranty</option>
            </select>
          </div>

          {/* Expiring Window Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Expiring Window
            </label>
            <select
              value={expiringDays}
              onChange={(e) => {
                setExpiringDays(e.target.value);
                if (e.target.value) setStatus('All');
              }}
              className="w-full py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Any time</option>
              <option value="7">Next 7 Days</option>
              <option value="15">Next 15 Days</option>
              <option value="30">Next 30 Days</option>
            </select>
          </div>

          {/* Sorting */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Sort By
            </label>
            <div className="flex gap-1.5">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="createdAt">Date Added</option>
                <option value="purchaseDate">Purchase Date</option>
                <option value="warrantyExpiryDate">Warranty Expiry</option>
                <option value="purchasePrice">Price</option>
              </select>
              <button
                type="button"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
                title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Products Table or Grid */}
      {loading ? (
        <LoadingSpinner message="Loading products..." />
      ) : products.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No products found"
          description={
            search || category !== 'All' || status !== 'All' || expiringDays
              ? 'No products match your search or filter criteria. Try clearing filters.'
              : 'Start protecting your household appliances by registering your first product.'
          }
          actionText={
            search || category !== 'All' || status !== 'All' || expiringDays
              ? 'Clear Filters'
              : 'Add Your First Product'
          }
          actionLink={
            search || category !== 'All' || status !== 'All' || expiringDays ? null : '/products/new'
          }
          onAction={
            search || category !== 'All' || status !== 'All' || expiringDays
              ? () => {
                  setSearch('');
                  setCategory('All');
                  setStatus('All');
                  setExpiringDays('');
                }
              : null
          }
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">Product Details</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Purchase Info</th>
                  <th className="py-3.5 px-4">Warranty Status</th>
                  <th className="py-3.5 px-4">Documents</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {products.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Name & Model */}
                    <td className="py-4 px-4 sm:px-6">
                      <Link
                        to={`/products/${p._id}`}
                        className="font-bold text-slate-900 hover:text-indigo-600 transition-colors text-sm block"
                      >
                        {p.productName}
                      </Link>
                      <p className="text-slate-500 text-[11px] mt-0.5">
                        {p.brand} • Mod: <span className="font-mono">{p.modelNumber}</span>
                        {p.serialNumber && ` • S/N: ${p.serialNumber}`}
                      </p>
                    </td>

                    {/* Category */}
                    <td className="py-4 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-md font-semibold text-[11px] border ${getCategoryColor(
                          p.category
                        )}`}
                      >
                        {p.category}
                      </span>
                    </td>

                    {/* Purchase Info */}
                    <td className="py-4 px-4">
                      <p className="font-semibold text-slate-800">
                        {formatCurrency(p.purchasePrice)}
                      </p>
                      <p className="text-slate-400 text-[11px]">
                        {formatDate(p.purchaseDate)}
                      </p>
                    </td>

                    {/* Warranty Status */}
                    <td className="py-4 px-4">
                      <WarrantyBadge
                        status={p.warrantyStatus?.status}
                        daysRemaining={p.warrantyStatus?.daysRemaining}
                      />
                      {p.warrantyExpiryDate && (
                        <p className="text-[11px] text-slate-400 mt-1">
                          Until {formatDate(p.warrantyExpiryDate)}
                        </p>
                      )}
                    </td>

                    {/* Documents */}
                    <td className="py-4 px-4">
                      {p.documents && p.documents.length > 0 ? (
                        <span className="inline-flex items-center gap-1 text-slate-600 font-medium">
                          <FileText className="w-3.5 h-3.5 text-indigo-500" />
                          <span>{p.documents.length} doc{p.documents.length > 1 ? 's' : ''}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">None</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 sm:px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/products/${p._id}`}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          to={`/products/${p._id}/edit`}
                          className="p-1.5 text-slate-500 hover:text-amber-600 rounded-lg hover:bg-amber-50 transition-colors"
                          title="Edit Product"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => openDeleteModal(p)}
                          className="p-1.5 text-slate-500 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        title={`Delete "${productToDelete?.productName}"?`}
        message="This will permanently delete this product along with all associated service records, maintenance history, and uploaded invoices/documents."
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        loading={deleting}
      />
    </div>
  );
}
