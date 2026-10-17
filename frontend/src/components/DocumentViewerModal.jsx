import React from 'react';
import { X, Download, FileText } from 'lucide-react';
import { formatFileSize } from '../utils/formatters';
import { formatDate } from '../utils/dateUtils';

export default function DocumentViewerModal({ document, isOpen, onClose }) {
  if (!isOpen || !document) return null;

  const isImage = document.fileType?.startsWith('image') || /\.(jpg|jpeg|png)$/i.test(document.fileUrl);
  const isPdf = document.fileType === 'application/pdf' || /\.pdf$/i.test(document.fileUrl);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <div className="truncate">
              <h3 className="text-sm font-bold text-slate-900 truncate">
                {document.originalName}
              </h3>
              <p className="text-xs text-slate-500 capitalize">
                {document.documentType?.replace('_', ' ')} • {formatFileSize(document.fileSize)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={document.fileUrl}
              download={document.originalName}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              Download
            </a>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body Viewport */}
        <div className="flex-1 overflow-auto p-4 bg-slate-100 flex items-center justify-center min-h-[400px]">
          {isImage ? (
            <img
              src={document.fileUrl}
              alt={document.originalName}
              className="max-h-[70vh] max-w-full object-contain rounded-lg shadow-sm"
            />
          ) : isPdf ? (
            <iframe
              src={document.fileUrl}
              title={document.originalName}
              className="w-full h-[70vh] rounded-lg border border-slate-300 bg-white"
            />
          ) : (
            <div className="text-center p-8 bg-white rounded-xl shadow-sm">
              <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-700">Preview not available for this file type</p>
              <a
                href={document.fileUrl}
                download
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Download className="w-4 h-4" /> Download File
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
