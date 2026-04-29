import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import SuccessCard from '../components/SuccessCard';

const API = import.meta.env.VITE_API_URL;

const CURRENCIES = ['USD', 'INR', 'EUR', 'GBP', 'AED', 'SGD', 'CAD', 'AUD'];

const initialForm = {
  taskName: '',
  clientName: '',
  hoursWorked: '',
  hourlyRate: '',
  currency: 'USD',
  gstEnabled: false,
};

export default function TaskForm() {
  const [form, setForm] = useState(initialForm);
  const [exchangeRate, setExchangeRate] = useState(1);
  const [rateLoading, setRateLoading] = useState(false);
  const [rateCache, setRateCache] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  // ── Fetch exchange rate when currency changes ──────────────────────
  const fetchRate = useCallback(async (currency) => {
    if (rateCache[currency]) {
      setExchangeRate(rateCache[currency]);
      return;
    }
    setRateLoading(true);
    try {
      const { data } = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');
      const rate = data.rates?.[currency];
      if (rate) {
        setExchangeRate(rate);
        setRateCache((prev) => ({ ...prev, [currency]: rate }));
      }
    } catch {
      setExchangeRate(1);
    } finally {
      setRateLoading(false);
    }
  }, [rateCache]);

  useEffect(() => {
    fetchRate(form.currency);
  }, [form.currency, fetchRate]);

  // ── Live preview calculations ──────────────────────────────────────
  const hours = parseFloat(form.hoursWorked) || 0;
  const rate = parseFloat(form.hourlyRate) || 0;
  const convertedTotal = hours * rate * exchangeRate;
  const gstAmount = form.gstEnabled ? convertedTotal * 0.18 : 0;
  const finalTotal = convertedTotal + gstAmount;
  const showPreview = hours > 0 && rate > 0;

  // ── Handle input ───────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setError('');
  };

  // ── Submit ─────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const { data } = await axios.post(`${API}/api/tasks`, {
        ...form,
        hoursWorked: parseFloat(form.hoursWorked),
        hourlyRate: parseFloat(form.hourlyRate),
      });

      if (data.success) {
        setResult({ invoice: data.invoice, pdfUrl: data.pdfUrl });
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Something went wrong';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Reset ──────────────────────────────────────────────────────────
  const handleReset = () => {
    setResult(null);
    setForm(initialForm);
    setError('');
  };

  // ── Success view ───────────────────────────────────────────────────
  if (result) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <SuccessCard
          invoice={result.invoice}
          pdfUrl={result.pdfUrl}
          onReset={handleReset}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Page Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
          Log a Task
        </h1>
        <p className="text-slate-500 mt-2 text-base">
          Create a professional invoice in seconds.
        </p>
      </div>

      {/* Loading Bar */}
      {submitting && (
        <div className="fixed top-16 left-0 right-0 z-40 h-1 bg-indigo-100 overflow-hidden">
          <div className="h-full bg-indigo-600 animate-loading-bar rounded-r-full" />
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl flex items-start gap-3 animate-slide-down">
          <svg className="w-5 h-5 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="font-semibold text-sm">Error</p>
            <p className="text-sm mt-0.5">{error}</p>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-5 gap-8">
        {/* ── Form Card ────────────────────────────────────────────── */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-3 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 space-y-6"
        >
          {/* Task Name */}
          <div>
            <label htmlFor="taskName" className="block text-sm font-semibold text-slate-700 mb-2">
              Task Name
            </label>
            <input
              id="taskName"
              name="taskName"
              type="text"
              required
              value={form.taskName}
              onChange={handleChange}
              placeholder="e.g. Landing page redesign"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all duration-200 text-slate-800 placeholder-slate-400"
            />
          </div>

          {/* Client Name */}
          <div>
            <label htmlFor="clientName" className="block text-sm font-semibold text-slate-700 mb-2">
              Client Name
            </label>
            <input
              id="clientName"
              name="clientName"
              type="text"
              required
              value={form.clientName}
              onChange={handleChange}
              placeholder="e.g. Acme Corp"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all duration-200 text-slate-800 placeholder-slate-400"
            />
          </div>

          {/* Hours + Rate Row */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="hoursWorked" className="block text-sm font-semibold text-slate-700 mb-2">
                Hours Worked
              </label>
              <input
                id="hoursWorked"
                name="hoursWorked"
                type="number"
                required
                min="0.5"
                step="0.5"
                value={form.hoursWorked}
                onChange={handleChange}
                placeholder="0.0"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all duration-200 text-slate-800 placeholder-slate-400"
              />
            </div>
            <div>
              <label htmlFor="hourlyRate" className="block text-sm font-semibold text-slate-700 mb-2">
                Hourly Rate (USD)
              </label>
              <input
                id="hourlyRate"
                name="hourlyRate"
                type="number"
                required
                min="1"
                value={form.hourlyRate}
                onChange={handleChange}
                placeholder="0.00"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all duration-200 text-slate-800 placeholder-slate-400"
              />
            </div>
          </div>

          {/* Currency Selector */}
          <div>
            <label htmlFor="currency" className="block text-sm font-semibold text-slate-700 mb-2">
              Currency
            </label>
            <select
              id="currency"
              name="currency"
              value={form.currency}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all duration-200 text-slate-800 appearance-none cursor-pointer"
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* GST Toggle */}
          <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 border border-amber-100">
            <input
              id="gstEnabled"
              name="gstEnabled"
              type="checkbox"
              checked={form.gstEnabled}
              onChange={handleChange}
              className="w-5 h-5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
            />
            <label htmlFor="gstEnabled" className="text-sm font-semibold text-amber-800 cursor-pointer select-none">
              Apply 18% GST
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Generating Invoice…
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Create Invoice
              </>
            )}
          </button>
        </form>

        {/* ── Live Preview Sidebar ─────────────────────────────────── */}
        <div className="lg:col-span-2">
          <div className="sticky top-24 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 px-6 py-4">
              <h3 className="text-white font-bold text-sm flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Live Preview
              </h3>
            </div>
            <div className="p-6">
              {!showPreview ? (
                <div className="text-center py-8">
                  <div className="w-14 h-14 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-3">
                    <svg className="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-slate-400 text-sm">
                    Enter hours and rate to see a live estimate
                  </p>
                </div>
              ) : (
                <div className="space-y-4 animate-fade-in">
                  {/* Exchange rate info */}
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Exchange Rate</span>
                    <span className="flex items-center gap-1">
                      {rateLoading ? (
                        <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      ) : null}
                      1 USD = {exchangeRate.toFixed(4)} {form.currency}
                    </span>
                  </div>

                  <hr className="border-slate-100" />

                  {/* Calculation breakdown */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">{hours}h × ${rate}/h × {exchangeRate.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span className="text-slate-600">Estimated Total</span>
                      <span className="text-slate-800">{form.currency} {convertedTotal.toFixed(2)}</span>
                    </div>
                    {form.gstEnabled && (
                      <div className="flex justify-between text-amber-600">
                        <span>+ GST (18%)</span>
                        <span>{form.currency} {gstAmount.toFixed(2)}</span>
                      </div>
                    )}
                  </div>

                  <hr className="border-slate-100" />

                  {/* Final total */}
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-slate-700">Final</span>
                    <span className="text-2xl font-extrabold text-indigo-600">
                      {form.currency} {finalTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CSS animations via style tag */}
      <style>{`
        @keyframes loading-bar {
          0%   { width: 0%; margin-left: 0; }
          50%  { width: 70%; margin-left: 0; }
          100% { width: 0%; margin-left: 100%; }
        }
        .animate-loading-bar { animation: loading-bar 1.5s ease-in-out infinite; }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-down { animation: slide-down 0.3s ease-out; }
      `}</style>
    </div>
  );
}
