import { useState, useEffect } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL;

export default function InvoiceList() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const { data } = await axios.get(`${API}/api/invoices`);
        setInvoices(data.invoices || []);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load invoices');
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  const fmt = (n) => Number(n).toFixed(2);

  const filtered = invoices.filter((inv) =>
    inv.client?.name?.toLowerCase().includes(search.toLowerCase())
  );

  // ── Loading Skeleton ───────────────────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="text-center mb-10">
          <div className="h-9 w-52 bg-slate-200 rounded-lg mx-auto animate-pulse" />
          <div className="h-5 w-72 bg-slate-100 rounded-lg mx-auto mt-3 animate-pulse" />
        </div>
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4 animate-pulse">
              <div className="h-5 w-3/4 bg-slate-200 rounded" />
              <div className="h-4 w-1/2 bg-slate-100 rounded" />
              <div className="h-4 w-2/3 bg-slate-100 rounded" />
              <div className="h-8 w-1/3 bg-indigo-100 rounded-lg" />
              <div className="h-10 bg-slate-100 rounded-xl mt-4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Page Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
          All Invoices
        </h1>
        <p className="text-slate-500 mt-2 text-base">
          View and download all generated invoices.
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl">
          <p className="font-semibold text-sm">{error}</p>
        </div>
      )}

      {/* Search Bar */}
      {invoices.length > 0 && (
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by client name..."
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all duration-200 text-slate-800 placeholder-slate-400 shadow-sm"
            />
          </div>
        </div>
      )}

      {/* Empty State */}
      {invoices.length === 0 && !error && (
        <div className="text-center py-20">
          <div className="w-24 h-24 mx-auto bg-indigo-50 rounded-full flex items-center justify-center mb-6">
            <svg className="w-12 h-12 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-slate-700 mb-2">No invoices yet</h3>
          <p className="text-slate-400 mb-6">Log your first task to generate an invoice!</p>
          <a
            href="/"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/25"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Log a Task
          </a>
        </div>
      )}

      {/* No search results */}
      {invoices.length > 0 && filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-slate-400 text-lg">No invoices match "{search}"</p>
        </div>
      )}

      {/* Invoice Cards Grid */}
      {filtered.length > 0 && (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((inv) => (
            <div
              key={inv.id}
              className="group bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-200 transition-all duration-300 overflow-hidden"
            >
              {/* Card Header */}
              <div className="px-6 pt-6 pb-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">
                      {inv.client?.name}
                    </h3>
                    <p className="text-sm text-slate-500 mt-0.5">{inv.taskName}</p>
                  </div>
                  <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
                    {new Date(inv.invoiceDate).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric',
                    })}
                  </span>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-y-2 text-sm mt-4">
                  <div className="text-slate-400">Hours × Rate</div>
                  <div className="text-right text-slate-600 font-medium">
                    {fmt(inv.hoursWorked)}h × ${fmt(inv.hourlyRate)}
                  </div>
                  <div className="text-slate-400">Currency</div>
                  <div className="text-right text-slate-600 font-medium">
                    {inv.currency} (×{fmt(inv.exchangeRate)})
                  </div>
                  <div className="text-slate-400">Base Total</div>
                  <div className="text-right text-slate-600 font-medium">
                    {inv.currency} {fmt(inv.convertedTotal)}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 pb-6 pt-3 border-t border-slate-50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {inv.gstEnabled && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        </svg>
                        GST 18%
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold">Final Total</p>
                    <p className="text-xl font-extrabold text-indigo-600">
                      {inv.currency} {fmt(inv.finalTotal)}
                    </p>
                  </div>
                </div>

                {inv.pdfPath && (
                  <a
                    href={`${API}/api/invoices/${inv.id}/pdf`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold py-2.5 rounded-xl transition-all duration-200 text-sm"
                  >
                    <span className="inline-flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download PDF
                    </span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
