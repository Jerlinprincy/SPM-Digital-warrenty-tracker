import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Wrench,
  ArrowLeft,
  Calendar,
  DollarSign,
  Package,
  Upload,
  AlertCircle,
  FileText,
  X,
} from 'lucide-react';
import { serviceService } from '../services/serviceService';
import { productService } from '../services/productService';
import LoadingSpinner from '../components/LoadingSpinner';
import dayjs from 'dayjs';

export default function ScheduleService() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    productId: searchParams.get('productId') || '',
    title: '',
    description: '',
    scheduledDate: dayjs().add(1, 'day').format('YYYY-MM-DD'),
    serviceProvider: '',
    estimatedCost: '',
    notes: '',
  });

  const [files, setFiles] = useState([]);

  useEffect(() => {
    const fetchUserProducts = async () => {
      try {
        setInitialLoading(true);
        const data = await productService.getProducts();
        setProducts(data.products || []);

        // Auto-select first product if none preselected and products exist
        if (!formData.productId && data.products?.length > 0) {
          setFormData((prev) => ({ ...prev, productId: data.products[0]._id }));
        }
      } catch (err) {
        console.error('Failed to load products for service scheduling:', err);
        setError('Failed to load products. Please ensure products are registered.');
      } finally {
        setInitialLoading(false);
      }
    };

    fetchUserProducts();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const invalidFiles = selectedFiles.filter((f) => f.size > 5 * 1024 * 1024);
    if (invalidFiles.length > 0) {
      setError('Some files exceed the 5MB limit.');
      return;
    }
    setFiles((prev) => [...prev, ...selectedFiles]);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.productId || !formData.title.trim() || !formData.scheduledDate) {
      setError('Please select a product and enter the service title and scheduled date.');
      return;
    }

    try {
      setSubmitting(true);
      const submitData = new FormData();
      Object.keys(formData).forEach((key) => {
        submitData.append(key, formData[key]);
      });

      files.forEach((file) => {
        submitData.append('documents', file);
      });

      await serviceService.createService(submitData);
      navigate('/services');
    } catch (err) {
      console.error('Error scheduling service:', err);
      setError(err.response?.data?.message || 'Failed to schedule service.');
    } finally {
      setSubmitting(false);
    }
  };

  if (initialLoading) {
    return <LoadingSpinner message="Loading products for service assignment..." />;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/services"
          className="p-2 bg-white rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Schedule Maintenance Service
          </h1>
          <p className="text-sm text-slate-500">
            Book a preventive checkup, repair, or service center appointment
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {products.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-4">
          <Package className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Registered Products Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You must register at least one household product before scheduling maintenance.
          </p>
          <Link
            to="/products/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
          >
            Register a Product First
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-indigo-600" />
              Service Details
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Associated Product *
              </label>
              <select
                name="productId"
                required
                value={formData.productId}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              >
                {products.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.productName} ({p.brand} - {p.category})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Service Title *
              </label>
              <input
                type="text"
                name="title"
                required
                placeholder="e.g. Annual AC Filter Cleaning & Compressor Check"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Scheduled Service Date *
                </label>
                <input
                  type="date"
                  name="scheduledDate"
                  required
                  value={formData.scheduledDate}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Estimated Cost ($ USD)
                </label>
                <input
                  type="number"
                  name="estimatedCost"
                  min="0"
                  step="0.01"
                  placeholder="e.g. 50.00"
                  value={formData.estimatedCost}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Service Provider / Service Center
              </label>
              <input
                type="text"
                name="serviceProvider"
                placeholder="e.g. Authorized Sony Service Center, Local Technician"
                value={formData.serviceProvider}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Description / Problem Details
              </label>
              <textarea
                name="description"
                rows="3"
                placeholder="Describe any issues, unusual sounds, error codes, or routine maintenance requirements..."
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Internal Notes (Optional)
              </label>
              <input
                type="text"
                name="notes"
                placeholder="e.g. Booking ref #ABC-123, contact technician at 555-0192"
                value={formData.notes}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Section: Upload Estimates/Receipts */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Upload className="w-4 h-4 text-slate-600" />
              Service Estimates / Receipts (Optional)
            </h2>

            <div className="border-2 border-dashed border-slate-200 rounded-xl p-5 text-center bg-slate-50/50">
              <label className="cursor-pointer text-xs font-semibold text-indigo-600 hover:text-indigo-700">
                <span>Select files to attach</span>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              <p className="text-[11px] text-slate-400 mt-1">PDF, JPG, PNG up to 5MB</p>
            </div>

            {files.length > 0 && (
              <div className="space-y-2 pt-2">
                {files.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700"
                  >
                    <span className="truncate">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="text-slate-400 hover:text-red-500 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              to="/services"
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-500/20 disabled:opacity-50"
            >
              {submitting ? 'Scheduling...' : 'Confirm Appointment'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
