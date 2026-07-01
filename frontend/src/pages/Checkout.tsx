import React, { useState, useEffect } from 'react';
import { ShoppingCart, MapPin, Phone, CreditCard, Send, ShieldCheck, Lock, Mail, User, Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';
import { CartItem, User as UserType } from '../types';
import { API_BASE_URL, resolveImageUrl } from '../utils';

interface CheckoutProps {
  cart: CartItem[];
  currency: 'UGX' | 'CLP';
  onClearCart: () => void;
  onNavigate: (page: string) => void;
  user: UserType | null;
  onLoginSuccess: (user: UserType, token: string) => void;
}

export default function Checkout({ cart, currency, onClearCart, onNavigate, user, onLoginSuccess }: CheckoutProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'pesapal'>('pesapal');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Auto-fill user details once authenticated
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!user) {
      setErrorMsg('Please sign up or sign in to complete your order.');
      return;
    }

    if (cart.length === 0) {
      setErrorMsg('Your shopping cart is currently empty.');
      return;
    }

    if (!name || !phone || !address) {
      setErrorMsg('Please provide your name, phone number, and delivery/pickup address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderPayload = {
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        deliveryAddress: address,
        items: cart.map(i => ({
          product: i.product.id,
          name: i.product.name,
          quantity: i.quantity,
          price: i.product.price
        })),
        totalAmount: cartTotal,
        notes,
        paymentMethod
      };

      const orderRes = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(orderData.error || 'Failed to file purchase order.');
      }

      onClearCart();

      if (paymentMethod === 'pesapal') {
        const payRes = await fetch(`${API_BASE_URL}/api/orders/${orderData.id}/pay-pesapal`, {
          method: 'POST'
        });
        const payData = await payRes.json();

        if (payRes.ok && payData.redirect_url) {
          if (payData.simulation) {
            onNavigate(`pesapal-simulation?orderId=${orderData.id}&trackingId=${payData.order_tracking_id || 'sim-id'}&amount=${cartTotal}`);
          } else {
            window.location.href = payData.redirect_url;
          }
        } else {
          onNavigate(`pesapal-simulation?orderId=${orderData.id}&trackingId=fallback-sim-123&amount=${cartTotal}`);
        }
      } else {
        alert("Delicious Order Placed Successfully! Our Jinja kitchen has received your ticket and is starting preparation.");
        onNavigate('home');
      }

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Payment system error. Please retry checkout.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="text-center py-16 bg-slate-900/30 border border-slate-900 rounded-3xl space-y-4 max-w-md mx-auto">
        <ShoppingCart className="w-12 h-12 text-slate-600 mx-auto" />
        <h2 className="text-white font-bold text-lg">Your Cart is Empty</h2>
        <p className="text-slate-400 text-xs">Add some delicious mandazi, french fries, or cookies to proceed.</p>
        <button
          id="go-to-menu-btn"
          onClick={() => onNavigate('menu')}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer"
        >
          Explore Delicious Menu
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-16">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Order Checkout Details</h1>
        <p className="text-slate-400 text-xs">Fill out delivery coordinates and choose payment options.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Form: Gate with login if not authenticated, otherwise show shipping details */}
        {!user ? (
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-5">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Lock className="w-4.5 h-4.5 text-amber-500" /> Member Account Required
              </h2>
              <p className="text-slate-400 text-[11px] mt-1">
                Please Sign In or Create an Account below to unlock secure delivery options and place your SK Cakes order.
              </p>
            </div>
            
            <CheckoutAuthGate onLoginSuccess={onLoginSuccess} />
          </div>
        ) : (
          <form onSubmit={handlePlaceOrder} className="lg:col-span-7 bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-5">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <MapPin className="w-4.5 h-4.5 text-amber-500" /> Shipping & Delivery Information
              </h2>
              <span className="text-[11px] bg-amber-500/10 border border-amber-500/20 text-amber-400 font-semibold px-2.5 py-1 rounded-lg">
                Ordering as {user.name}
              </span>
            </div>

            {/* Premium Autofill Notification Banner */}
            <div className="p-3.5 bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/20 rounded-xl text-xs text-amber-300 flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <span className="text-base leading-none">✨</span>
                <div>
                  <span className="font-extrabold text-white block mb-0.5">Profile Info Auto-Filled</span>
                  We've filled out your name and email from your account profile. You can edit them below or leave them as is to continue.
                </div>
              </div>
              {(name !== (user?.name || '') || email !== (user?.email || '')) && (
                <button
                  id="reset-autofill-btn"
                  type="button"
                  onClick={() => {
                    setName(user?.name || '');
                    setEmail(user?.email || '');
                  }}
                  className="text-[11px] text-amber-400 hover:text-amber-300 underline font-extrabold flex-shrink-0 cursor-pointer self-center"
                >
                  Reset Info
                </button>
              )}
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            <div className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-slate-400 font-bold uppercase tracking-wider">Full Name *</label>
                  {name === (user?.name || '') && (
                    <span className="text-[9px] text-amber-400 bg-amber-500/10 border border-amber-500/25 px-2 py-0.5 rounded-md font-mono font-bold">Auto-filled</span>
                  )}
                </div>
                <input
                  id="checkout-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-white outline-none"
                  placeholder="John Doe"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold mb-1.5 uppercase tracking-wider">Phone Number *</label>
                  <input
                    id="checkout-phone"
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-white outline-none"
                    placeholder="e.g. +256 760 593 042 / +256 700 235 315"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-slate-400 font-bold uppercase tracking-wider">Email (Optional)</label>
                    {email === (user?.email || '') && (
                      <span className="text-[9px] text-amber-400 bg-amber-500/10 border border-amber-500/25 px-2 py-0.5 rounded-md font-mono font-bold">Auto-filled</span>
                    )}
                  </div>
                  <input
                    id="checkout-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-white outline-none"
                    placeholder="customer@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1.5 uppercase tracking-wider">Delivery Address / Pickup Branch *</label>
                <input
                  id="checkout-address"
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-white outline-none"
                  placeholder="e.g. Bugembe / Jinja-Iganga Highway delivery address..."
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1.5 uppercase tracking-wider">Special Chef Notes / Custom instructions</label>
                <textarea
                  id="checkout-notes"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-white outline-none"
                  placeholder="e.g. Eggless cake, please write 'Happy Birthday Bob' with golden frosting..."
                />
              </div>
            </div>

            <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3 pt-4 flex items-center gap-2">
              <CreditCard className="w-4.5 h-4.5 text-amber-500" /> Select Payment Method
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Pesapal Option */}
              <button
                id="pay-method-pesapal"
                type="button"
                onClick={() => setPaymentMethod('pesapal')}
                className={`p-4 rounded-xl border text-left transition ${
                  paymentMethod === 'pesapal'
                    ? 'bg-gradient-to-r from-amber-500/10 to-amber-500/5 text-amber-400 border-amber-500/30'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="font-bold text-xs flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-amber-500" /> Pesapal Payment Gateway
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Pay instantly using Mobile Money (Airtel/MTN), Visa, MasterCard, or Bank transfer.
                </p>
              </button>

              {/* Cash option */}
              <button
                id="pay-method-cash"
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`p-4 rounded-xl border text-left transition ${
                  paymentMethod === 'cash'
                    ? 'bg-gradient-to-r from-amber-500/10 to-amber-500/5 text-amber-400 border-amber-500/30'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="font-bold text-xs flex items-center gap-2">
                  💵 Cash on Delivery / Store Pickup
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Pay cash at our Jinja counter or on delivery when you receive your fresh products.
                </p>
              </button>
            </div>

            {paymentMethod === 'pesapal' && (
              <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl text-[11px] text-amber-300 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold text-white">Pesapal Sandbox Active:</strong> If real credentials are empty in <code>.env</code>, we run a secure simulator that demonstrates full IPN notifications and receipt processing flawlessly.
                </div>
              </div>
            )}

            <button
              id="place-order-submit-btn"
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3.5 rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? 'Configuring Order...' : paymentMethod === 'pesapal' ? 'Proceed to Secure Pesapal Checkout' : 'Place Order with Cash'}
            </button>
          </form>
        )}

        {/* Right Cart Summary Sidebar */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
          <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center justify-between">
            <span>Purchase Summary</span>
            <span className="text-xs bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-lg text-slate-400 font-mono">
              {cart.length} Items
            </span>
          </h2>

          <div className="divide-y divide-slate-800/60 max-h-[300px] overflow-y-auto pr-1">
            {cart.map((item) => (
              <div key={item.product.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <img src={resolveImageUrl(item.product.imageUrl)} alt={item.product.name} className="w-9 h-9 rounded-lg object-cover border border-slate-800" loading="lazy" referrerPolicy="no-referrer" />
                  <div>
                    <h4 className="text-slate-200 font-bold line-clamp-1">{item.product.name}</h4>
                    <div className="text-slate-500 font-semibold text-[10px] mt-0.5">Quantity: x{item.quantity}</div>
                  </div>
                </div>
                
                <div className="text-amber-400 font-mono font-bold">
                  {currency === 'UGX'
                    ? `UGX ${(item.product.price * item.quantity).toLocaleString()}`
                    : `CLP ${Math.round(item.product.price * 0.25 * item.quantity).toLocaleString()}`
                  }
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-800 pt-4 space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-medium">Subtotal</span>
              <span className="text-slate-200 font-bold font-mono">
                {currency === 'UGX'
                  ? `UGX ${cartTotal.toLocaleString()}`
                  : `CLP ${Math.round(cartTotal * 0.25).toLocaleString()}`
                }
              </span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-medium">Delivery Fee</span>
              <span className="text-emerald-400 font-bold">FREE Delivery</span>
            </div>

            <div className="flex justify-between items-center border-t border-slate-800 pt-3">
              <span className="text-white font-bold text-sm">Grand Total</span>
              <span className="text-amber-400 font-extrabold text-base font-mono">
                {currency === 'UGX'
                  ? `UGX ${cartTotal.toLocaleString()}`
                  : `CLP ${Math.round(cartTotal * 0.25).toLocaleString()}`
                }
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Embedded Auth Gate inside checkout */
interface CheckoutAuthGateProps {
  onLoginSuccess: (user: UserType, token: string) => void;
}

function CheckoutAuthGate({ onLoginSuccess }: CheckoutAuthGateProps) {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signup'); // Default to Signup as requested: "ordeering the signup pages shows"
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (activeTab === 'signup' && !name) {
      setError('Please provide your full name.');
      return;
    }

    setIsLoading(true);
    try {
      const endpoint = activeTab === 'signin' ? `${API_BASE_URL}/api/auth/login` : `${API_BASE_URL}/api/auth/signup`;
      const payload = activeTab === 'signin' 
        ? { email, password }
        : { name, email, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (res.ok) {
        onLoginSuccess(data.user, data.token);
      } else {
        setError(data.error || 'Authentication error. Please double check credentials.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection to auth service failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 text-xs font-semibold">
      <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
        <button
          id="checkout-tab-signup"
          type="button"
          onClick={() => {
            setActiveTab('signup');
            setError('');
          }}
          className={`flex-1 py-2 rounded-lg transition-all text-center ${
            activeTab === 'signup' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 font-semibold'
          }`}
        >
          Sign Up (New Account)
        </button>
        <button
          id="checkout-tab-signin"
          type="button"
          onClick={() => {
            setActiveTab('signin');
            setError('');
          }}
          className={`flex-1 py-2 rounded-lg transition-all text-center ${
            activeTab === 'signin' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 font-semibold'
          }`}
        >
          Sign In (Existing)
        </button>
      </div>

      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs font-semibold">
          {error}
        </div>
      )}

      <form onSubmit={handleAuthSubmit} className="space-y-4">
        {activeTab === 'signup' && (
          <div>
            <label className="block text-slate-400 font-bold mb-1.5 uppercase tracking-wider">Your Full Name *</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                id="gate-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl pl-11 pr-4 py-2.5 text-white outline-none"
                placeholder="John Doe"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-slate-400 font-bold mb-1.5 uppercase tracking-wider">Email Address *</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              id="gate-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl pl-11 pr-4 py-2.5 text-white outline-none"
              placeholder="customer@email.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-slate-400 font-bold mb-1.5 uppercase tracking-wider">Password *</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              id="gate-password"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl pl-11 pr-11 py-2.5 text-white outline-none"
              placeholder="••••••••"
            />
            <button
              id="gate-toggle-pass"
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          id="gate-submit-btn"
          type="submit"
          disabled={isLoading}
          className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-2"
        >
          {activeTab === 'signup' ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
          <span>
            {isLoading ? 'Processing...' : activeTab === 'signup' ? 'Create Account & Continue to Delivery' : 'Sign In & Continue to Delivery'}
          </span>
        </button>
      </form>
    </div>
  );
}
