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
  ShieldCheck,
  PhoneCall,
  ClipboardList,
  Sparkles,
} from 'lucide-react';
import { serviceService } from '../services/serviceService';
import { productService } from '../services/productService';
import { getBrandSupport } from '../utils/brandSupportData';
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
    ticketNumber: '',
    description: '',
    scheduledDate: dayjs().add(1, 'day').format('YYYY-MM-DD'),
    serviceProvider: '',
    estimatedCost: '0',
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
        const initialProdId = searchParams.get('productId') || (data.products?.length > 0 ? data.products[0]._id : '');
        if (initialProdId) {
          const selected = data.products?.find((p) => p._id === initialProdId);
          const support = selected ? getBrandSupport(selected.brand, selected) : null;
          setFormData((prev) => ({
            ...prev,
            productId: initialProdId,
            serviceProvider: support ? `${support.name} Official Customer Care (Tel: ${support.tollFree || 'Online'})` : prev.serviceProvider,
          }));
        }
      } catch (err) {
        console.error('Failed to load products for service scheduling:', err);
        setError('Failed to load products. Please ensure products are registered.');
      } finally {
        setInitialLoading(false);
      }
    };

    fetchUserProducts();
  }, [searchParams]);

  const selectedProduct = products.find((p) => p._id === formData.productId);
  const brandSupport = selectedProduct ? getBrandSupport(selectedProduct.brand, selectedProduct) : null;

  const handleProductChange = (e) => {
    const prodId = e.target.value;
    const selected = products.find((p) => p._id === prodId);
    const support = selected ? getBrandSupport(selected.brand, selected) : null;

    setFormData((prev) => ({
      ...prev,
      productId: prodId,
      serviceProvider: support ? `${support.name} Official Customer Care (Tel: ${support.tollFree || 'Online'})` : '',
    }));
  };

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

      // Combine ticketNumber into notes for clean backward-compatible storage
      let combinedNotes = formData.notes || '';
      if (formData.ticketNumber && formData.ticketNumber.trim()) {
        const ticketPrefix = `[Complaint Ticket: ${formData.ticketNumber.trim()}]`;
        combinedNotes = combinedNotes ? `${ticketPrefix} ${combinedNotes}` : ticketPrefix;
      }

      Object.keys(formData).forEach((key) => {
        if (key === 'ticketNumber') return;
        if (key === 'notes') {
          submitData.append('notes', combinedNotes);
        } else {
          submitData.append(key, formData[key]);
        }
      });

      files.forEach((file) => {
        submitData.append('documents', file);
      });

      await serviceService.createService(submitData);
      navigate('/services');
    } catch (err) {
      console.error('Error recording service ticket:', err);
      setError(err.response?.data?.message || 'Failed to record service ticket.');
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
            Record Service Request & Technician Visit
          </h1>
          <p className="text-sm text-slate-500">
            Called customer care or booked a repair? Save your complaint ticket, technician appointment date, and service details.
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
            You must register at least one household product before logging service records.
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
              <ClipboardList className="w-4 h-4 text-indigo-600" />
              Service & Claim Ticket Details
            </h2>

            {/* Product Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Associated Appliance / Product *
              </label>
              <select
                name="productId"
                required
                value={formData.productId}
                onChange={handleProductChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              >
                {products.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.productName} ({p.brand} - {p.category})
                  </option>
                ))}
              </select>
            </div>

            {/* Helpline Context Banner */}
            {brandSupport && (
              <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2 min-w-0">
                  <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span className="text-xs text-slate-700 truncate">
                    Official <strong className="text-slate-900">{brandSupport.name}</strong> Support:{' '}
                    <strong className="text-indigo-700 font-mono">
                      {brandSupport.tollFreeDisplay || 'Available Online'}
                    </strong>
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {brandSupport.callUrl && (
                    <a
                      href={brandSupport.callUrl}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 transition-colors shadow-sm shadow-emerald-600/20"
                    >
                      <PhoneCall className="w-3 h-3" />
                      <span>Call Again</span>
                    </a>
                  )}
                  {brandSupport.website && (
                    <a
                      href={brandSupport.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 bg-white hover:bg-slate-50 text-indigo-700 border border-indigo-200 text-xs font-semibold rounded-lg transition-colors"
                    >
                      Brand Portal ↗
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Quick Chips & Service Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Issue / Service Reason *
              </label>

              {/* Quick Preset Chips */}
              <div className="flex flex-wrap gap-1.5 mb-2">
                {[
                  '💥 Breakdown / Repair Request',
                  '⚙️ Routine Preventive Maintenance',
                  '🔊 Strange Noise / Vibration',
                  '🔧 Part Replacement under Warranty',
                  '🛠️ Installation & Setup Visit',
                ].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, title: chip }))}
                    className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 text-slate-700 rounded-lg border border-slate-200 transition-colors"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              <input
                type="text"
                name="title"
                required
                placeholder="e.g. Drum vibration / Drain pump inspection"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>

            {/* Complaint / Ticket Reference Number */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Complaint / Service Ticket ID (Optional)
                </label>
                <span className="text-[11px] text-slate-400">Given by customer care agent</span>
              </div>
              <input
                type="text"
                name="ticketNumber"
                placeholder="e.g. LG-SR-2026-98124 or SMS reference number"
                value={formData.ticketNumber}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>

            {/* Dates & Cost */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Promised Technician Visit Date *
                </label>
                <input
                  type="date"
                  name="scheduledDate"
                  required
                  value={formData.scheduledDate}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Date the brand confirmed the technician will arrive
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Estimated / Inspection Fee
                </label>
                <input
                  type="number"
                  name="estimatedCost"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.estimatedCost}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Enter 0 if covered under free warranty inspection
                </span>
              </div>
            </div>

            {/* Service Provider (Auto-filled!) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Service Provider / Center (Auto-filled)
                </label>
                <span className="text-[11px] text-emerald-600 font-medium">
                  ✓ Official brand center attached
                </span>
              </div>
              <input
                type="text"
                name="serviceProvider"
                value={formData.serviceProvider}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white font-medium"
              />
            </div>

            {/* Problem Details */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Problem Description / Customer Care Notes
              </label>
              <textarea
                name="description"
                rows="3"
                placeholder="What issue did you describe on the call? (e.g. error code displayed, leaking water, power tripping)..."
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>

            {/* Internal Notes / Technician contact */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Technician Contact / Special Instructions (Optional)
              </label>
              <input
                type="text"
                name="notes"
                placeholder="e.g. Technician Suresh (9876543210) visiting between 2 PM - 5 PM"
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
              Service Estimates / Job Sheet / Receipts (Optional)
            </h2>

            <div className="border-2 border-dashed border-slate-200 rounded-xl p-5 text-center bg-slate-50/50">
              <label className="cursor-pointer text-xs font-semibold text-indigo-600 hover:text-indigo-700">
                <span>Select job sheet or estimate files to attach</span>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              <p className="text-[11px] text-slate-400 mt-1">PDF, PNG, JPG up to 5MB</p>
            </div>

            {files.length > 0 && (
              <div className="space-y-2 pt-2">
                <span className="text-xs font-semibold text-slate-700 block">Selected Files:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {files.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                        <span className="truncate text-slate-800 font-medium">{file.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              to="/services"
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-500/20 disabled:opacity-50 transition-colors"
            >
              {submitting ? 'Saving Service Record...' : 'Save Service Record'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
