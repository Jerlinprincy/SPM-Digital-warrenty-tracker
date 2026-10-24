import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Wrench,
  Plus,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Trash2,
  Edit,
  DollarSign,
  FileText,
  Filter,
} from 'lucide-react';
import { serviceService } from '../services/serviceService';
import { productService } from '../services/productService';
import ServiceStatusBadge from '../components/ServiceStatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import DocumentViewerModal from '../components/DocumentViewerModal';
import BrandSupportDirectory from '../components/BrandSupportDirectory';
import { formatDate } from '../utils/dateUtils';
import { formatCurrency } from '../utils/formatters';

export default function Services() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Status & filter tabs
  const [activeTab, setActiveTab] = useState(searchParams.get('filter') || 'all');
  const [userProducts, setUserProducts] = useState([]);

  // Fetch user products for brand badges
  useEffect(() => {
    productService
      .getProducts()
      .then((data) => setUserProducts(data.products || []))
      .catch((err) => console.error('Error fetching products in services:', err));
  }, []);

  // Mark Completed Modal
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [serviceToComplete, setServiceToComplete] = useState(null);
  const [actualCostInput, setActualCostInput] = useState('');
  const [completing, setCompleting] = useState(false);

  // Delete Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Document Viewer Modal
  const [selectedDoc, setSelectedDoc] = useState(null);

  const fetchServices = useCallback(async () => {
    if (activeTab === 'directory') {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const params = {};
      if (activeTab === 'upcoming') params.filter = 'upcoming';
      else if (activeTab === 'overdue') params.filter = 'overdue';
      else if (activeTab === 'completed') params.filter = 'completed';
      else if (activeTab === 'cancelled') params.status = 'Cancelled';

      const data = await serviceService.getServices(params);
      setServices(data.services || []);
    } catch (err) {
      console.error('Error fetching services:', err);
      setError('Failed to load services.');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const openCompleteModal = (service) => {
    setServiceToComplete(service);
    setActualCostInput(service.estimatedCost ? String(service.estimatedCost) : '0');
    setCompleteModalOpen(true);
  };

  const handleCompleteSubmit = async (e) => {
    e.preventDefault();
    if (!serviceToComplete) return;

    try {
      setCompleting(true);
      await serviceService.updateService(serviceToComplete._id, {
        status: 'Completed',
        actualCost: Number(actualCostInput) || 0,
        completedAt: new Date(),
      });
      setCompleteModalOpen(false);
      setServiceToComplete(null);
      await fetchServices();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to complete service.');
    } finally {
      setCompleting(false);
    }
  };

  const handleCancelService = async (serviceId) => {
    if (!window.confirm('Cancel this scheduled service appointment?')) return;
    try {
      await serviceService.updateService(serviceId, { status: 'Cancelled' });
      await fetchServices();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel service.');
    }
  };

  const confirmDelete = async () => {
    if (!serviceToDelete) return;
    try {
      setDeleting(true);
      await serviceService.deleteService(serviceToDelete._id);
      setDeleteModalOpen(false);
      setServiceToDelete(null);
      await fetchServices();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete service record.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Service & Maintenance Hub
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track repairs, preventive inspections, and service center history
          </p>
        </div>

        <Link
          to="/services/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all shadow-indigo-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Service</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200 text-xs font-semibold">
        {[
          { key: 'all', label: 'All Records' },
          { key: 'upcoming', label: 'Upcoming Scheduled' },
          { key: 'overdue', label: 'Overdue Attention' },
          { key: 'completed', label: 'Completed History' },
          { key: 'cancelled', label: 'Cancelled' },
          { key: 'directory', label: '📞 Official Brand Helplines' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key);
              setSearchParams(tab.key === 'all' ? {} : { filter: tab.key });
            }}
            className={`py-2 px-3.5 rounded-xl transition-all whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Services List / Table OR Brand Directory */}
      {activeTab === 'directory' ? (
        <BrandSupportDirectory userProducts={userProducts} />
      ) : loading ? (
        <LoadingSpinner message="Loading service records..." />
      ) : services.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title="No service records found"
          description={
            activeTab !== 'all'
              ? 'No service records match this filter.'
              : 'Schedule regular maintenance and keep accurate repair history for your appliances.'
          }
          actionText="Schedule a Service"
          actionLink="/services/new"
        />
      ) : (
        <div className="space-y-4">
          {services.map((svc) => (
            <div
              key={svc._id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-200 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">{svc.title}</h3>
                  <ServiceStatusBadge status={svc.status} isOverdue={svc.isOverdue} />
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500">
                  {svc.productId && (
                    <Link
                      to={`/products/${svc.productId._id}`}
                      className="font-semibold text-indigo-600 hover:underline"
                    >
                      {svc.productId.productName} ({svc.productId.brand})
                    </Link>
                  )}
                  <span>
                    Provider: <strong className="text-slate-700">{svc.serviceProvider || 'Unspecified'}</strong>
                  </span>
                  <span>
                    Date: <strong className="text-slate-700">{formatDate(svc.scheduledDate)}</strong>
                  </span>
                </div>

                {svc.description && (
                  <p className="mt-2 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {svc.description}
                  </p>
                )}

                {svc.notes && (
                  <p className="mt-1 text-[11px] text-slate-400 italic">
                    Note: {svc.notes}
                  </p>
                )}

                {/* Receipts list */}
                {svc.documents?.length > 0 && (
                  <div className="mt-2.5 flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-slate-500">Receipts:</span>
                    {svc.documents.map((doc) => (
                      <button
                        key={doc._id}
                        onClick={() => setSelectedDoc(doc)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-[11px] font-medium text-slate-700 transition-colors"
                      >
                        <FileText className="w-3 h-3 text-indigo-500" />
                        <span className="truncate max-w-[120px]">{doc.originalName}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Side: Cost & Actions */}
              <div className="flex md:flex-col items-center md:items-end justify-between gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0">
                <div className="text-left md:text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    {svc.status === 'Completed' ? 'Actual Cost' : 'Estimated Cost'}
                  </span>
                  <span className="text-base font-extrabold text-slate-900 block">
                    {formatCurrency(svc.status === 'Completed' ? svc.actualCost : svc.estimatedCost)}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {svc.status === 'Scheduled' && (
                    <>
                      <button
                        onClick={() => openCompleteModal(svc)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Complete</span>
                      </button>
                      <button
                        onClick={() => handleCancelService(svc._id)}
                        className="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg hover:bg-amber-50 transition-colors"
                        title="Cancel Service"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => {
                      setServiceToDelete(svc);
                      setDeleteModalOpen(true);
                    }}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    title="Delete Record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Complete Service Modal */}
      {completeModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <form onSubmit={handleCompleteSubmit} className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-emerald-600">
                <CheckCircle2 className="w-6 h-6" />
                <h3 className="text-lg font-bold text-slate-900">Mark Service Completed</h3>
              </div>
              <p className="text-xs text-slate-600">
                Update the record for <strong>{serviceToComplete?.title}</strong> with the actual repair or service cost.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Actual Cost ($ USD)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={actualCostInput}
                  onChange={(e) => setActualCostInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCompleteModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={completing}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-2 disabled:opacity-50"
                >
                  {completing ? 'Saving...' : 'Confirm Completed'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        title={`Delete Service "${serviceToDelete?.title}"?`}
        message="Are you sure you want to delete this service record? Any attached receipts will also be removed."
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
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
