import React, { useEffect, useState } from 'react';
import { CreditCard, CheckCircle2, XCircle, Loader2, ShieldCheck } from 'lucide-react';
import { API_BASE_URL } from '../utils';

interface PesapalCallbackProps {
  queryString: string;
  onNavigate: (page: string) => void;
}

export default function PesapalCallback({ queryString, onNavigate }: PesapalCallbackProps) {
  const params = new URLSearchParams(queryString);
  const orderId = params.get('orderId') || params.get('OrderMerchantReference') || '';

  const [status, setStatus] = useState<'checking' | 'paid' | 'pending' | 'failed' | 'error'>('checking');

  useEffect(() => {
    if (!orderId) {
      setStatus('error');
      return;
    }

    let attempts = 0;
    let cancelled = false;

    // Pesapal's IPN can lag a few seconds behind the browser redirect, so we
    // poll our own /pesapal-status endpoint (which re-checks with Pesapal
    // directly) a handful of times before giving up.
    const poll = async () => {
      attempts += 1;
      try {
        const res = await fetch(`${API_BASE_URL}/api/orders/${orderId}/pesapal-status`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || 'Status check failed.');

        const paymentStatus = data.order?.paymentStatus;
        if (cancelled) return;

        if (paymentStatus === 'paid') {
          setStatus('paid');
        } else if (paymentStatus === 'failed') {
          setStatus('failed');
        } else if (attempts < 6) {
          setTimeout(poll, 3000);
        } else {
          setStatus('pending');
        }
      } catch (err) {
        if (!cancelled) setStatus('error');
      }
    };

    poll();
    return () => { cancelled = true; };
  }, [orderId]);

  return (
    <div className="max-w-xl mx-auto py-12 px-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative">
        <div className="bg-slate-950 p-5 border-b border-slate-800 text-center space-y-1">
          <div className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest">Secure Payments Gateway</div>
          <h2 className="text-lg font-black text-amber-500 tracking-tight flex items-center justify-center gap-1.5">
            <CreditCard className="w-5 h-5 text-amber-500" /> PESAPAL PAYMENT RESULT
          </h2>
        </div>

        <div className="p-6 md:p-8 space-y-6 text-center">
          {status === 'checking' && (
            <div className="py-6 space-y-4">
              <Loader2 className="w-10 h-10 text-amber-400 mx-auto animate-spin" />
              <p className="text-slate-300 text-sm font-semibold">Confirming your payment with Pesapal...</p>
              <p className="text-slate-500 text-xs">This usually takes a few seconds.</p>
            </div>
          )}

          {status === 'paid' && (
            <div className="py-6 space-y-6">
              <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-white font-extrabold text-xl">Payment Confirmed</h3>
                <p className="text-slate-400 text-xs max-w-sm mx-auto leading-relaxed">
                  Pesapal confirmed your payment and order #{orderId.slice(-8)} is now marked as paid.
                </p>
              </div>
              <button
                id="pesapal-callback-done-btn"
                onClick={() => onNavigate('home')}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs transition cursor-pointer"
              >
                Return to SK Cakes Store
              </button>
            </div>
          )}

          {status === 'pending' && (
            <div className="py-6 space-y-6">
              <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center text-amber-400 mx-auto">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-white font-extrabold text-xl">Still Processing</h3>
                <p className="text-slate-400 text-xs max-w-sm mx-auto leading-relaxed">
                  Pesapal hasn't confirmed this payment yet. If you completed payment on your phone,
                  it may take a little longer -- check your order status again shortly.
                </p>
              </div>
              <button
                id="pesapal-callback-home-btn"
                onClick={() => onNavigate('home')}
                className="bg-slate-950 hover:bg-slate-950/80 text-white border border-slate-800 font-bold px-6 py-2.5 rounded-xl text-xs transition cursor-pointer"
              >
                Return to SK Cakes Store
              </button>
            </div>
          )}

          {(status === 'failed' || status === 'error') && (
            <div className="py-6 space-y-6">
              <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 rounded-full flex items-center justify-center text-rose-400 mx-auto">
                <XCircle className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-white font-extrabold text-xl">
                  {status === 'failed' ? 'Payment Failed' : 'Could Not Confirm Payment'}
                </h3>
                <p className="text-slate-400 text-xs max-w-sm mx-auto leading-relaxed">
                  {status === 'failed'
                    ? 'Pesapal reported this transaction as failed or reversed. No charge was completed.'
                    : "We couldn't verify the payment status for this order. Please contact support if you were charged."}
                </p>
              </div>
              <button
                id="pesapal-callback-retry-btn"
                onClick={() => onNavigate('checkout')}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs transition cursor-pointer"
              >
                Back to Checkout
              </button>
            </div>
          )}
        </div>

        <div className="bg-slate-950 p-4 border-t border-slate-800 text-center text-[10px] text-slate-500 font-mono">
          🔒 256-Bit SSL Encryption Active | Powered by Pesapal v3
        </div>
      </div>
    </div>
  );
}
