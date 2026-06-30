import React, { useState } from 'react';
import { CreditCard, CheckCircle2, ShieldCheck, XCircle, RefreshCw, Smartphone } from 'lucide-react';
import { API_BASE_URL } from '../utils';

interface PesapalSimulationProps {
  onNavigate: (page: string) => void;
}

export default function PesapalSimulation({ onNavigate }: PesapalSimulationProps) {
  // Parse query parameters
  const queryParams = new URLSearchParams(window.location.search);
  const orderId = queryParams.get('orderId') || 'unknown';
  const trackingId = queryParams.get('trackingId') || 'sim-id';
  const amount = Number(queryParams.get('amount') || 0);

  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<'pending' | 'success' | 'failed'>('pending');

  const handleSimulatePayment = async (success: boolean) => {
    setIsProcessing(true);
    try {
      if (success) {
        // Post complete payment to express backend to update state
        const res = await fetch(`${API_BASE_URL}/api/orders/${orderId}/complete-simulated-payment`, {
          method: 'POST'
        });
        if (res.ok) {
          setStatus('success');
        } else {
          setStatus('failed');
        }
      } else {
        setStatus('failed');
      }
    } catch (err) {
      console.error(err);
      setStatus('failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-12 px-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.08),transparent_50%)] pointer-events-none" />
        
        {/* Head brand */}
        <div className="bg-slate-950 p-5 border-b border-slate-800 text-center space-y-1">
          <div className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest">Secure Payments Gateway</div>
          <h2 className="text-lg font-black text-amber-500 tracking-tight flex items-center justify-center gap-1.5">
            <CreditCard className="w-5 h-5 text-amber-500" /> PESAPAL V3 SIMULATOR
          </h2>
        </div>

        <div className="p-6 md:p-8 space-y-6">
          {status === 'pending' && (
            <div className="space-y-6">
              <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl text-xs text-amber-300 leading-relaxed flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <div>
                  <strong className="font-bold text-white">Interactive Sandbox Simulation Mode:</strong> <br />
                  You are viewing the simulated Pesapal merchant flow. Real keys are missing in <code>.env</code>. This sandbox allows you to test the checkout loop, update order logs, and verify receipts!
                </div>
              </div>

              {/* Order summary card */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3 font-medium">
                <h3 className="text-white text-xs font-bold uppercase tracking-wider border-b border-slate-900 pb-2">Order Specifics</h3>
                <div className="grid grid-cols-2 text-xs gap-y-2">
                  <span className="text-slate-500">Order Reference ID:</span>
                  <span className="text-slate-200 font-mono text-right font-bold">{orderId}</span>

                  <span className="text-slate-500">Pesapal Tracking ID:</span>
                  <span className="text-slate-200 font-mono text-right">{trackingId}</span>

                  <span className="text-slate-500">Transaction Currency:</span>
                  <span className="text-white text-right font-bold">UGX</span>

                  <span className="text-slate-500">Grand Total Amount:</span>
                  <span className="text-amber-400 font-bold font-mono text-right text-sm">
                    UGX {amount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Action Simulation Box */}
              <div className="space-y-3">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block text-center">Choose Simulated Payment Method</span>
                
                <button
                  id="sim-pay-mtn-btn"
                  onClick={() => handleSimulatePayment(true)}
                  disabled={isProcessing}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow shadow-amber-500/10"
                >
                  <Smartphone className="w-4 h-4 text-slate-950" />
                  {isProcessing ? 'Processing Transaction...' : 'Pay with Mobile Money (MTN / Airtel)'}
                </button>

                <button
                  id="sim-pay-card-btn"
                  onClick={() => handleSimulatePayment(true)}
                  disabled={isProcessing}
                  className="w-full bg-slate-950 hover:bg-slate-950/80 text-white border border-slate-800 font-bold py-3 rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-4 h-4 text-slate-400" />
                  {isProcessing ? 'Processing Transaction...' : 'Pay with VISA / MasterCard'}
                </button>

                <button
                  id="sim-fail-btn"
                  onClick={() => handleSimulatePayment(false)}
                  disabled={isProcessing}
                  className="w-full bg-rose-950/20 hover:bg-rose-950/40 text-rose-400 font-semibold py-2 rounded-xl text-[11px] transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <XCircle className="w-3.5 h-3.5" /> Simulate Transaction Failure
                </button>
              </div>
            </div>
          )}

          {/* SUCCESS State screen */}
          {status === 'success' && (
            <div className="text-center py-6 space-y-6">
              <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-white font-extrabold text-xl">Payment Successfully Authenticated</h3>
                <p className="text-slate-400 text-xs max-w-sm mx-auto leading-relaxed">
                  Pesapal has fully synchronized the transfer. A success webhook callback (IPN) has been sent to our Express backend, updating your order status to <strong className="text-white">'paid'</strong>!
                </p>
              </div>

              <button
                id="sim-success-done-btn"
                onClick={() => onNavigate('home')}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs transition cursor-pointer inline-block"
              >
                Return to SK Cakes Store
              </button>
            </div>
          )}

          {/* FAILED State screen */}
          {status === 'failed' && (
            <div className="text-center py-6 space-y-6">
              <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 rounded-full flex items-center justify-center text-rose-400 mx-auto">
                <XCircle className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-white font-extrabold text-xl">Transaction Failed</h3>
                <p className="text-slate-400 text-xs max-w-sm mx-auto leading-relaxed">
                  The payment request was denied by the card issuer or mobile network operator.
                </p>
              </div>

              <div className="flex gap-3 justify-center">
                <button
                  id="sim-failed-retry-btn"
                  onClick={() => setStatus('pending')}
                  className="bg-slate-950 hover:bg-slate-950/85 text-white border border-slate-800 font-bold px-5 py-2.5 rounded-xl text-xs transition cursor-pointer"
                >
                  Retry Payment
                </button>
                <button
                  id="sim-failed-abort-btn"
                  onClick={() => onNavigate('home')}
                  className="bg-rose-950/40 text-rose-400 border border-rose-900/30 font-bold px-5 py-2.5 rounded-xl text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer info lock */}
        <div className="bg-slate-950 p-4 border-t border-slate-800 text-center text-[10px] text-slate-500 font-mono">
          🔒 256-Bit SSL Encryption Active | Powered by Pesapal v3
        </div>
      </div>
    </div>
  );
}
