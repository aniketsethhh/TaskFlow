export default function SuccessCard({ invoice, pdfUrl, onReset }) {
  const fmt = (n) => Number(n).toFixed(2);

  return (
    <div className="animate-fade-in max-w-lg mx-auto">
      <div className="bg-white rounded-2xl shadow-xl shadow-emerald-500/10 border border-emerald-100 overflow-hidden">
        {/* Success Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-8 text-center">
          <div className="w-16 h-16 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-4">
            <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white">Invoice Created!</h2>
          <p className="text-emerald-100 mt-1 text-sm">Your invoice has been generated and saved.</p>
        </div>

        {/* Invoice Details */}
        <div className="px-8 py-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Client</p>
              <p className="text-slate-800 font-semibold mt-1">{invoice.client?.name}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Task</p>
              <p className="text-slate-800 font-semibold mt-1">{invoice.taskName}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Currency</p>
              <p className="text-slate-800 font-semibold mt-1">{invoice.currency}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Date</p>
              <p className="text-slate-800 font-semibold mt-1">
                {new Date(invoice.invoiceDate).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'short', day: 'numeric',
                })}
              </p>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Totals */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Base Total</span>
              <span className="text-slate-700 font-medium">
                {invoice.currency} {fmt(invoice.convertedTotal)}
              </span>
            </div>
            {invoice.gstEnabled && (
              <div className="flex justify-between text-sm">
                <span className="text-amber-600">GST (18%)</span>
                <span className="text-amber-600 font-medium">
                  + {invoice.currency} {fmt(invoice.gstAmount)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-slate-100">
              <span className="text-slate-800">Final Total</span>
              <span className="text-indigo-600">
                {invoice.currency} {fmt(invoice.finalTotal)}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-8 pb-8 flex gap-3">
          <a
            href={`${import.meta.env.VITE_API_URL}${pdfUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download PDF
          </a>
          <button
            onClick={onReset}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 px-4 rounded-xl transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Another
          </button>
        </div>
      </div>
    </div>
  );
}
