import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PhoneCall,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
  Clock,
  Copy,
  Check,
  HelpCircle,
  MapPin,
  FileCheck,
  ClipboardList,
} from 'lucide-react';
import { getBrandSupport } from '../utils/brandSupportData';

export default function BrandSupportCard({ brand, product = {} }) {
  const [copied, setCopied] = useState(false);
  const support = getBrandSupport(brand, product);

  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-md">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 px-5 py-4 text-white flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4 text-indigo-300" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
              {support.name} Official Support
              {support.isVerified && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Verified
                </span>
              )}
            </h3>
            <p className="text-[11px] text-slate-300 flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>{support.operatingHours}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Contact Info Row */}
        {support.tollFree ? (
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Official Toll-Free Helpline
              </span>
              <span className="text-sm font-bold text-slate-900 tracking-wide font-mono block truncate">
                {support.tollFreeDisplay}
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleCopy(support.tollFree)}
              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all text-xs font-medium flex items-center gap-1 shrink-0"
              title="Copy Phone Number"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-[11px] text-emerald-600 font-semibold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="text-[11px]">Copy</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Official directory listing for "{support.name}". Click below to find authorized centers.</span>
          </div>
        )}

        {/* 1-Click Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Call Helpline Button */}
          {support.callUrl ? (
            <a
              href={support.callUrl}
              className="flex items-center justify-center gap-2 px-3 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm shadow-emerald-600/20"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Call Helpline</span>
            </a>
          ) : (
            <a
              href={support.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-3 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
            >
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>Nearby Centers</span>
            </a>
          )}

          {/* WhatsApp Support Button */}
          {support.whatsAppUrl ? (
            <a
              href={support.whatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-3 py-2.5 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded-xl text-xs font-bold transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5 text-green-600" />
              <span>WhatsApp Support</span>
            </a>
          ) : (
            <a
              href={support.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-3 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-indigo-600" />
              <span>Brand Support Page</span>
            </a>
          )}
        </div>

        {/* Official Portal Full Link */}
        {support.isVerified && (
          <a
            href={support.website}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-slate-700 hover:text-indigo-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors"
          >
            <span>Book Official Doorstep Repair / Claim</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}

        {/* Claim Tip Box */}
        <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100 text-[11px] text-slate-600 flex items-start gap-2">
          <FileCheck className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-slate-800">Warranty Claim Tip: </strong>
            {support.claimNotes}
          </p>
        </div>

        {/* Step 2: Log Complaint / Visit */}
        {product._id && (
          <div className="pt-3 border-t border-slate-100 space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-700 block">
              Already contacted {support.name}?
            </span>
            <Link
              to={`/services/new?productId=${product._id}`}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition-colors shadow-sm"
            >
              <ClipboardList className="w-4 h-4 text-indigo-600" />
              <span>Record Complaint Ticket & Visit Date</span>
            </Link>
            <span className="text-[10px] text-slate-400 block text-center">
              Save your ticket ID and promised technician visit date
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
