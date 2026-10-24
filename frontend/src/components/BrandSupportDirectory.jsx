import React, { useState, useMemo } from 'react';
import {
  Search,
  PhoneCall,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
  Copy,
  Check,
  Sparkles,
  Building2,
} from 'lucide-react';
import { BRAND_SUPPORT_DIRECTORY, getBrandSupport } from '../utils/brandSupportData';

export default function BrandSupportDirectory({ userProducts = [] }) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [copiedId, setCopiedId] = useState(null);

  // Extract unique brands from user's registered products
  const userBrandNames = useMemo(() => {
    const set = new Set();
    userProducts.forEach((p) => {
      if (p.brand) set.add(p.brand.trim());
    });
    return Array.from(set);
  }, [userProducts]);

  // Filtered brands
  const filteredBrands = useMemo(() => {
    let list = BRAND_SUPPORT_DIRECTORY;

    if (selectedCategory !== 'All') {
      list = list.filter((b) =>
        b.category.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.tollFree.toLowerCase().includes(q) ||
          b.category.toLowerCase().includes(q) ||
          b.aliases.some((a) => a.includes(q))
      );
    }

    return list;
  }, [search, selectedCategory]);

  const handleCopy = (id, text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 p-6 rounded-2xl text-white shadow-sm border border-indigo-800/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-300" />
              <span>Verified Brand Directory</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              Official Manufacturer Helplines & Claim Portals
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Connect directly with official authorized service networks for doorstep warranty repairs, free checkups, and genuine parts replacement.
            </p>
          </div>
        </div>

        {/* Quick-Pill Filter for User's Registered Brands */}
        {userBrandNames.length > 0 && (
          <div className="mt-5 pt-4 border-t border-indigo-800/50 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-indigo-200 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Your Registered Brands:
            </span>
            {userBrandNames.map((brandName) => (
              <button
                key={brandName}
                onClick={() => setSearch(brandName)}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors border border-white/10"
              >
                {brandName}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Controls: Search & Category Chips */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search brand (e.g. LG, Samsung, Sony, Apple, Whirlpool)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
          />
        </div>

        {/* Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-semibold">
          {['All', 'Electronics', 'Appliances', 'Computers', 'Kitchen'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Brand Grid */}
      {filteredBrands.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBrands.map((b) => {
            const isUserBrand = userBrandNames.some(
              (ub) => ub.toLowerCase() === b.name.toLowerCase() || b.aliases.includes(ub.toLowerCase())
            );
            const callUrl = `tel:${b.tollFree.replace(/[^0-9+]/g, '')}`;
            const whatsAppUrl = b.whatsapp
              ? `https://wa.me/${b.whatsapp}?text=${encodeURIComponent(
                  `Hi ${b.name} Support, I need assistance for my device under warranty.`
                )}`
              : null;

            return (
              <div
                key={b.id}
                className={`bg-white rounded-2xl border p-5 shadow-sm transition-all hover:shadow-md flex flex-col justify-between ${
                  isUserBrand ? 'border-indigo-400 ring-1 ring-indigo-400' : 'border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-slate-900 text-base">{b.name}</h3>
                        {isUserBrand && (
                          <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded border border-indigo-200">
                            In Your Assets
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-medium text-slate-400 block mt-0.5">
                        {b.category}
                      </span>
                    </div>

                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Official
                    </span>
                  </div>

                  {/* Toll-Free Box */}
                  <div className="mt-3.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200/70 flex items-center justify-between">
                    <div className="min-w-0">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Toll-Free Helpline
                      </span>
                      <span className="text-xs font-bold text-slate-800 font-mono block truncate">
                        {b.tollFreeDisplay}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(b.id, b.tollFree)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-white transition-colors"
                      title="Copy Number"
                    >
                      {copiedId === b.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-500 mt-2.5 leading-relaxed">
                    {b.claimNotes}
                  </p>
                </div>

                {/* 1-Click Action Buttons */}
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={callUrl}
                      className="flex items-center justify-center gap-1.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm shadow-emerald-600/10"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Call Support</span>
                    </a>

                    {whatsAppUrl ? (
                      <a
                        href={whatsAppUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1.5 py-2 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded-xl text-xs font-bold transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-green-600" />
                        <span>WhatsApp</span>
                      </a>
                    ) : (
                      <a
                        href={b.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                        <span>Portal</span>
                      </a>
                    )}
                  </div>

                  <a
                    href={b.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 w-full py-1.5 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
                  >
                    <span>Book Service On Official {b.name} Portal</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* If custom search query not in list, offer live search */
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
          <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">No direct match for "{search}"</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You can search Google for verified authorized service centers and toll-free numbers.
          </p>
          <a
            href={`https://www.google.com/search?q=${encodeURIComponent(
              search + ' customer care toll free helpline authorized service center'
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
          >
            <span>Search {search} Helpline on Google</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}
    </div>
  );
}
