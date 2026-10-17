import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Package,
  ArrowLeft,
  DollarSign,
  Upload,
  ShieldCheck,
  AlertCircle,
  FileText,
  X,
} from 'lucide-react';
import { productService } from '../services/productService';
import LoadingSpinner from '../components/LoadingSpinner';
import dayjs from 'dayjs';
import { formatDate, formatInputDate } from '../utils/dateUtils';

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    productName: '',
    category: 'Electronics',
    brand: '',
    modelNumber: '',
    serialNumber: '',
    purchaseDate: '',
    purchasePrice: '',
    seller: '',
    warrantyDurationMonths: '12',
    warrantyStartDate: '',
    description: '',
  });

  const [files, setFiles] = useState([]);
  const [previewExpiry, setPreviewExpiry] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setInitialLoading(true);
        const data = await productService.getProductById(id);
        const p = data.product;

        setFormData({
          productName: p.productName || '',
          category: p.category || 'Other',
          brand: p.brand || '',
          modelNumber: p.modelNumber || '',
          serialNumber: p.serialNumber || '',
          purchaseDate: formatInputDate(p.purchaseDate),
          purchasePrice: p.purchasePrice !== undefined ? p.purchasePrice : '',
          seller: p.seller || '',
          warrantyDurationMonths: p.warrantyDurationMonths !== undefined ? String(p.warrantyDurationMonths) : '0',
          warrantyStartDate: formatInputDate(p.warrantyStartDate),
          description: p.description || '',
        });
      } catch (err) {
        console.error('Error fetching product for edit:', err);
        setError('Failed to fetch product details.');
      } finally {
        setInitialLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Live recalculate preview
  useEffect(() => {
    const duration = parseInt(formData.warrantyDurationMonths, 10);
    if (!formData.warrantyStartDate || isNaN(duration) || duration <= 0) {
      setPreviewExpiry(null);
      return;
    }

    const start = dayjs(formData.warrantyStartDate);
    if (start.isValid()) {
      const expiry = start.add(duration, 'month').subtract(1, 'day');
      setPreviewExpiry(expiry.format('YYYY-MM-DD'));
    } else {
      setPreviewExpiry(null);
    }
  }, [formData.warrantyStartDate, formData.warrantyDurationMonths]);

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

    try {
      setLoading(true);
      const submitData = new FormData();
      Object.keys(formData).forEach((key) => {
        submitData.append(key, formData[key]);
      });

      files.forEach((file) => {
        submitData.append('documents', file);
      });

      await productService.updateProduct(id, submitData);
      navigate(`/products/${id}`);
    } catch (err) {
      console.error('Failed to update product:', err);
      setError(err.response?.data?.message || 'Failed to update product.');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <LoadingSpinner message="Loading product information..." />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to={`/products/${id}`}
          className="p-2 bg-white rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Edit Product
          </h1>
          <p className="text-sm text-slate-500">
            Update specifications, warranty coverage, or upload additional documents
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Product Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Basic Information */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Package className="w-4 h-4 text-indigo-600" />
            General Product Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Product Name *
              </label>
              <input
                type="text"
                name="productName"
                required
                value={formData.productName}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              >
                <option value="Electronics">Electronics</option>
                <option value="Home Appliances">Home Appliances</option>
                <option value="Kitchen Appliances">Kitchen Appliances</option>
                <option value="Furniture">Furniture</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Brand / Manufacturer *
              </label>
              <input
                type="text"
                name="brand"
                required
                value={formData.brand}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Model Number *
              </label>
              <input
                type="text"
                name="modelNumber"
                required
                value={formData.modelNumber}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Serial Number
              </label>
              <input
                type="text"
                name="serialNumber"
                value={formData.serialNumber}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Purchase Details */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            Purchase Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Purchase Date *
              </label>
              <input
                type="date"
                name="purchaseDate"
                required
                value={formData.purchaseDate}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Purchase Price ($ USD) *
              </label>
              <input
                type="number"
                name="purchasePrice"
                required
                min="0"
                step="0.01"
                value={formData.purchasePrice}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Seller / Store
              </label>
              <input
                type="text"
                name="seller"
                value={formData.seller}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Warranty Details */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            Warranty Coverage & Terms
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Warranty Duration (Months) *
              </label>
              <input
                type="number"
                name="warrantyDurationMonths"
                required
                min="0"
                value={formData.warrantyDurationMonths}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Warranty Start Date *
              </label>
              <input
                type="date"
                name="warrantyStartDate"
                required
                value={formData.warrantyStartDate}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
            </div>

            <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-100 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">
                  Recalculated Expiration
                </span>
                <p className="text-base font-extrabold text-indigo-950 mt-1">
                  {previewExpiry ? formatDate(previewExpiry) : 'No Warranty'}
                </p>
              </div>
              <p className="text-[11px] text-indigo-600 font-medium mt-1">
                {previewExpiry ? `Coverage valid through 23:59:59 of ${previewExpiry}.` : 'No warranty coverage.'}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Description / Notes
            </label>
            <textarea
              name="description"
              rows="3"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Section 4: Upload Additional Documents */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Upload className="w-4 h-4 text-slate-600" />
            Attach Additional Documents
          </h2>

          <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-indigo-400 transition-colors bg-slate-50/50">
            <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <label className="cursor-pointer text-sm font-semibold text-indigo-600 hover:text-indigo-700">
              <span>Choose files to upload</span>
              <input
                type="file"
                multiple
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
            <p className="text-xs text-slate-400 mt-1">
              Supports PDF, PNG, JPG, JPEG (Max 5MB per file)
            </p>
          </div>

          {files.length > 0 && (
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-slate-700">New Files to Attach:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {files.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                      <span className="truncate">{file.name}</span>
                    </div>
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
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link
            to={`/products/${id}`}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-500/20 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? 'Saving Changes...' : 'Update Product'}
          </button>
        </div>
      </form>
    </div>
  );
}
