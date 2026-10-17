import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Package,
  ArrowLeft,
  Calendar,
  DollarSign,
  ShieldCheck,
  Wrench,
  FileText,
  Trash2,
  Edit,
  Plus,
  Eye,
  Download,
  Upload,
  Clock,
  CheckCircle2,
  Store,
  Hash,
} from 'lucide-react';
import { productService } from '../services/productService';
import { documentService } from '../services/documentService';
import WarrantyBadge from '../components/WarrantyBadge';
import ServiceStatusBadge from '../components/ServiceStatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import DocumentViewerModal from '../components/DocumentViewerModal';
import { formatDate } from '../utils/dateUtils';
import { formatCurrency, formatFileSize, getCategoryColor } from '../utils/formatters';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Document modal & upload state
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [docType, setDocType] = useState('invoice');

  const fetchProductData = async () => {
    try {
      setLoading(true);
      const data = await productService.getProductById(id);
      setProduct(data.product);
      setServices(data.services || []);
    } catch (err) {
      console.error('Error fetching product details:', err);
      setError('Product not found or access unauthorized.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductData();
  }, [id]);

  const handleDeleteProduct = async () => {
    try {
      setDeleting(true);
      await productService.deleteProduct(id);
      navigate('/products');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete product.');
    } finally {
      setDeleting(false);
    }
  };

  const handleDocumentUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File exceeds 5MB limit.');
      return;
    }

    try {
      setUploadingDoc(true);
      await documentService.uploadDocument({
        file,
        productId: id,
        documentType: docType,
      });
      await fetchProductData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to upload document.');
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (!window.confirm('Delete this document?')) return;
    try {
      await documentService.deleteDocument(docId);
      await fetchProductData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete document.');
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" message="Loading product specifications..." />;
  }

  if (error || !product) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <p className="text-red-600 font-semibold mb-4">{error || 'Product not found.'}</p>
        <Link
          to="/products"
          className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/products"
            className="p-2 bg-white rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {product.productName}
              </h1>
              <span
                className={`px-2.5 py-0.5 rounded-md font-semibold text-xs border ${getCategoryColor(
                  product.category
                )}`}
              >
                {product.category}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">
              {product.brand} • Model {product.modelNumber}
              {product.serialNumber && ` • Serial #${product.serialNumber}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/products/${product._id}/edit`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl transition-colors shadow-sm"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Edit</span>
          </Link>
          <button
            onClick={() => setDeleteModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 text-xs font-semibold rounded-xl transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Overview & Right Warranty Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Purchase Details Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              Purchase & Retail Specifications
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Purchase Price
                </span>
                <span className="text-lg font-bold text-slate-900 mt-1 block">
                  {formatCurrency(product.purchasePrice)}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Purchase Date
                </span>
                <span className="text-sm font-bold text-slate-800 mt-1 block">
                  {formatDate(product.purchaseDate)}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Retailer / Seller
                </span>
                <span className="text-sm font-bold text-slate-800 mt-1 block truncate">
                  {product.seller || 'Not specified'}
                </span>
              </div>
            </div>

            {product.description && (
              <div className="pt-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Notes / Description:
                </span>
                <p className="text-xs text-slate-700 mt-1 bg-slate-50 p-3 rounded-xl leading-relaxed whitespace-pre-wrap">
                  {product.description}
                </p>
              </div>
            )}
          </div>

          {/* Attached Documents */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                Attached Documents ({product.documents?.length || 0})
              </h2>

              {/* Upload Dropdown Trigger */}
              <div className="flex items-center gap-2">
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="py-1 px-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-600"
                >
                  <option value="invoice">Invoice</option>
                  <option value="warranty_card">Warranty Card</option>
                  <option value="receipt">Receipt</option>
                  <option value="other">Other</option>
                </select>
                <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg transition-colors border border-indigo-200">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingDoc ? 'Uploading...' : 'Attach File'}</span>
                  <input
                    type="file"
                    disabled={uploadingDoc}
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleDocumentUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {product.documents?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {product.documents.map((doc) => (
                  <div
                    key={doc._id}
                    className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3 group hover:border-indigo-300 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                        <span className="text-xs font-bold text-slate-800 truncate block">
                          {doc.originalName}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 capitalize">
                        {doc.documentType?.replace('_', ' ')} • {formatFileSize(doc.fileSize)} •{' '}
                        {formatDate(doc.uploadedAt)}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => setSelectedDoc(doc)}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 rounded hover:bg-indigo-100/50 transition-colors"
                        title="Preview Document"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <a
                        href={doc.fileUrl}
                        download={doc.originalName}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 text-slate-500 hover:text-emerald-600 rounded hover:bg-emerald-100/50 transition-colors"
                        title="Download Document"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => handleDeleteDocument(doc._id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-red-100/50 transition-colors"
                        title="Delete Document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic py-2">
                No invoices or warranty documents attached yet.
              </p>
            )}
          </div>
        </div>

        {/* Right Col: Warranty Status Card */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                Warranty Lifecycle
              </span>
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
            </div>

            <div className="mb-4">
              <WarrantyBadge
                status={product.warrantyStatus?.status}
                daysRemaining={product.warrantyStatus?.daysRemaining}
              />
            </div>

            <div className="space-y-3 pt-3 border-t border-indigo-800/60 text-xs">
              <div className="flex justify-between">
                <span className="text-indigo-300">Duration:</span>
                <span className="font-semibold text-white">
                  {product.warrantyDurationMonths} Months
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-indigo-300">Start Date:</span>
                <span className="font-semibold text-white">
                  {formatDate(product.warrantyStartDate)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-indigo-300">Expiration Date:</span>
                <span className="font-semibold text-amber-300">
                  {product.warrantyExpiryDate
                    ? formatDate(product.warrantyExpiryDate)
                    : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-indigo-300">Inclusive Policy:</span>
                <span className="font-medium text-emerald-400">
                  Through 23:59:59
                </span>
              </div>
            </div>
          </div>

          {/* Quick Service Scheduler Button */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Need Maintenance or Repair?
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Schedule preventive service, repairs, or inspections for this product.
            </p>
            <Link
              to={`/services/new?productId=${product._id}`}
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule Service for this Product</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Service Maintenance History Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">
              Service & Maintenance History ({services.length})
            </h2>
          </div>
          <Link
            to={`/services/new?productId=${product._id}`}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Schedule New Service</span>
          </Link>
        </div>

        {services.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {services.map((svc) => (
              <div
                key={svc._id}
                className="p-5 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{svc.title}</span>
                    <ServiceStatusBadge status={svc.status} isOverdue={svc.isOverdue} />
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    {svc.description || 'No description provided.'}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-3">
                    <span>Provider: <strong className="text-slate-600">{svc.serviceProvider || 'Self/Not set'}</strong></span>
                    <span>Cost: <strong className="text-slate-800">{formatCurrency(svc.actualCost || svc.estimatedCost)}</strong></span>
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-xs font-bold text-slate-800">
                    {formatDate(svc.scheduledDate)}
                  </p>
                  {svc.completedAt && (
                    <p className="text-[11px] text-emerald-600 font-medium mt-0.5">
                      Completed {formatDate(svc.completedAt)}
                    </p>
                  )}
                  <Link
                    to="/services"
                    className="inline-block mt-2 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                  >
                    Manage in Services →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-500">
            <Wrench className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            No service appointments or maintenance history logged for this product.
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        title={`Delete "${product.productName}"?`}
        message="This will delete this product, all attached warranty/invoice documents, and all associated service maintenance records."
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteProduct}
        loading={deleting}
      />

      {/* Document Viewer Modal */}
      <DocumentViewerModal
        document={selectedDoc}
        isOpen={!!selectedDoc}
        onClose={() => setSelectedDoc(null)}
      />
    </div>
  );
}
