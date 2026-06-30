import React, { useState } from 'react';
import { Cake, Sparkles, MapPin, Phone, Star, ChevronRight, Clock, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { Product } from '../types';
import ThreeDCake from '../components/ThreeDCake';
import { API_BASE_URL } from '../utils';

interface HomeProps {
  products: Product[];
  currency: 'UGX' | 'CLP';
  setCurrency: (curr: 'UGX' | 'CLP') => void;
  onAddToCart: (product: Product) => void;
  onNavigate: (page: string) => void;
}

export default function Home({ products, currency, setCurrency, onAddToCart, onNavigate }: HomeProps) {
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryEmail, setInquiryEmail] = useState('');
  const [inquiryMsg, setInquiryMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState(false);
  const [visualMode, setVisualMode] = useState<'photo' | '3d'>('3d');

  const featured = products.filter(p => p.isFeatured).slice(0, 4);

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryName || !inquiryEmail || !inquiryMsg) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: inquiryName,
          email: inquiryEmail,
          subject: 'Custom Celebration Cake Request',
          message: inquiryMsg,
          phone: ''
        })
      });
      if (response.ok) {
        setSuccessMsg(true);
        setInquiryName('');
        setInquiryEmail('');
        setInquiryMsg('');
        setTimeout(() => setSuccessMsg(false), 5000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 text-white p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-12">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(245,158,11,0.15),transparent_60%)] pointer-events-none" />
        
        <div className="space-y-6 max-w-xl z-10">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Jinja's Premium Baker
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
            Premium Cakes & <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
              Sizzling Fast-Foods
            </span>
          </h1>
          <p className="text-slate-300 text-base md:text-lg leading-relaxed">
            Welcome to <strong className="text-white font-semibold">SK Cakes</strong>, Bugembe's premium bakery & fast-food destination along the Jinja-Iganga Highway. From handcrafted birthday and wedding cakes to hot crispy chicken, golden samosas, mandazi, and fresh fries!
          </p>
          
          {/* Branch & Currency Selector */}
          <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-amber-500 flex-shrink-0" />
              <div>
                <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Select Active Branch</div>
                <div className="text-sm font-semibold text-white">
                  {currency === 'UGX' ? 'Bugembe, Jinja (Uganda)' : 'Jinja-Iganga Highway, Jinja'}
                </div>
              </div>
            </div>
            
            <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                id="currency-ugx-btn"
                onClick={() => setCurrency('UGX')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  currency === 'UGX' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                UGX ( Jinja )
              </button>
              <button
                id="currency-clp-btn"
                onClick={() => setCurrency('CLP')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  currency === 'CLP' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                CLP ( Bugembe )
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <button
              id="order-now-hero-btn"
              onClick={() => onNavigate('menu')}
              className="px-6 py-3.5 rounded-xl bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/10"
            >
              Order Online Now <ChevronRight className="w-4 h-4" />
            </button>
            <a
              id="contact-call-btn"
              href="tel:+256760593042"
              className="px-6 py-3.5 rounded-xl border border-slate-700 bg-slate-900/60 text-white font-semibold hover:bg-slate-900 transition flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4 text-amber-400" /> Jinja: +256 760 593 042 / +256 700 235 315
            </a>
          </div>
        </div>

        {/* Hero Image / Badge Showcase */}
        <div className="relative w-full md:w-1/2 flex flex-col items-center justify-center z-10 gap-4">
          
          {/* Visual Mode Selector Tabs */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-850 w-full max-w-sm">
            <button
              id="hero-mode-3d"
              onClick={() => setVisualMode('3d')}
              className={`flex-1 py-1.5 rounded-lg text-[11px] font-extrabold transition-all text-center cursor-pointer ${
                visualMode === '3d' ? 'bg-amber-500 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              🎂 Interactive 3D Cake
            </button>
            <button
              id="hero-mode-photo"
              onClick={() => setVisualMode('photo')}
              className={`flex-1 py-1.5 rounded-lg text-[11px] font-extrabold transition-all text-center cursor-pointer ${
                visualMode === 'photo' ? 'bg-amber-500 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              🖼️ Photo Showcase
            </button>
          </div>

          <div className="w-full flex justify-center relative">
            {visualMode === '3d' ? (
              <div className="w-full max-w-sm animate-fade-in py-2">
                <ThreeDCake />
              </div>
            ) : (
              <div className="relative group max-w-sm rounded-2xl overflow-hidden border border-slate-800 shadow-2xl animate-fade-in">
                <img
                  src="https://images.unsplash.com/photo-1535254973040-607b474cb50d?auto=format&fit=crop&w=700&q=80"
                  alt="SK Special Wedding Cake"
                  className="w-full h-[320px] object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-90" />
                
                <div className="absolute bottom-4 left-4 right-4 bg-slate-900/90 backdrop-blur-md p-4 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-1.5 text-amber-400 text-xs font-semibold mb-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400" /> 5.0 Rated Custom Cakes
                  </div>
                  <h4 className="text-white font-bold text-sm">SK Premium Tier Wedding Cakes</h4>
                  <p className="text-slate-400 text-xs mt-0.5">Custom sizes & flavors crafted to perfection.</p>
                </div>
              </div>
            )}

            {/* Floating Micro Highlights */}
            <div className="absolute -top-4 -left-4 bg-slate-900/95 border border-slate-800 px-4 py-2.5 rounded-xl text-center hidden sm:block z-20 shadow-lg">
              <Clock className="w-4 h-4 text-amber-400 mx-auto mb-1" />
              <div className="text-[10px] text-slate-400 font-bold uppercase">Fast Delivery</div>
              <div className="text-xs font-semibold text-white">Today or in 2 Days</div>
            </div>
            
            <div className="absolute -bottom-4 -right-4 bg-slate-900/95 border border-slate-800 px-4 py-2.5 rounded-xl text-center hidden sm:block z-20 shadow-lg">
              <ShieldCheck className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
              <div className="text-[10px] text-slate-400 font-bold uppercase">Freshly Prepared</div>
              <div className="text-xs font-semibold text-white">100% Quality</div>
            </div>
          </div>
        </div>

      </section>

      {/* Featured Categories Quick Navigation */}
      <section className="space-y-6">
        <div className="text-center md:text-left">
          <h2 className="text-2xl font-bold text-white tracking-tight">Our Signature Categories</h2>
          <p className="text-slate-400 text-sm mt-1">Order Jinja's best local delicacies and snacks.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {[
            { id: 'cakes', label: 'Cakes & Cupcakes', count: 'Custom Orders', img: 'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?auto=format&fit=crop&w=150&q=80' },
            { id: 'snacks', label: 'Chicken & Snacks', count: 'Hot & Crispy', img: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=150&q=80' },
            { id: 'chips', label: 'Chips & Fries', count: 'Masala Options', img: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=150&q=80' },
            { id: 'drinks', label: 'Fresh Juices', count: 'Natural Passion', img: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=150&q=80' },
            { id: 'cookies', label: 'Giant Cookies', count: 'Belgian Chocolate', img: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=150&q=80' },
            { id: 'other', label: 'Doughnuts & More', count: 'Soft & Sweet', img: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=150&q=80' }
          ].map((cat) => (
            <button
              id={`cat-card-${cat.id}`}
              key={cat.id}
              onClick={() => onNavigate('menu')}
              className="group bg-slate-900 hover:bg-slate-900/80 border border-slate-800 p-4 rounded-2xl text-center transition cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full overflow-hidden mx-auto mb-3 border border-slate-700">
                <img src={cat.img} alt={cat.label} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" referrerPolicy="no-referrer" />
              </div>
              <h4 className="text-slate-100 font-bold text-xs group-hover:text-amber-400 transition-colors">{cat.label}</h4>
              <p className="text-[10px] text-slate-500 mt-1">{cat.count}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Featured Items Banner Grid */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-bold text-white tracking-tight">Today's Featured Specialties</h2>
            <p className="text-slate-400 text-sm mt-1">Our customer-favorite selections prepared daily.</p>
          </div>
          <button
            id="view-all-menu-btn"
            onClick={() => onNavigate('menu')}
            className="text-amber-400 text-sm font-semibold hover:text-amber-300 transition inline-flex items-center gap-1 self-center"
          >
            Explore Complete Menu <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((item) => (
            <div
              id={`prod-card-${item.id}`}
              key={item.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between group"
            >
              <div className="relative">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 right-3 bg-amber-500 text-slate-950 font-bold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider shadow">
                  {item.category}
                </div>
              </div>
              
              <div className="p-4 flex-grow flex flex-col justify-between space-y-3">
                <div>
                  <h4 className="text-white font-bold text-base line-clamp-1 group-hover:text-amber-400 transition-colors">
                    {item.name}
                  </h4>
                  <p className="text-slate-400 text-xs line-clamp-2 mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>
                
                <div className="flex items-center justify-between pt-2">
                  <div className="font-mono font-bold text-amber-400 text-sm">
                    {currency === 'UGX' 
                      ? `UGX ${item.price.toLocaleString()}` 
                      : `CLP ${Math.round(item.price * 0.25).toLocaleString()}`
                    }
                  </div>
                  <button
                    id={`add-to-cart-featured-${item.id}`}
                    onClick={() => onAddToCart(item)}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer"
                  >
                    Add +
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Custom Cake Inquiry & Celebration Booking Banner */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-8 md:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Cake className="w-4 h-4" /> Customized celebration cakes
          </div>
          <h2 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight">
            Order Your Custom Celebration Masterpiece
          </h2>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Need a bespoke wedding cake, graduation highlight, or corporate landmark cake? Our master pastry chefs collaborate with you in Jinja and Bugembe to curate exact colors, flavors, layers, and decor themes.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-2 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <span className="text-amber-500 font-bold">✔</span> Custom Text & Toppers Included
            </div>
            <div className="flex items-center gap-2 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <span className="text-amber-500 font-bold">✔</span> Tasting Sessions Available
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 bg-slate-950/80 border border-slate-800 p-6 rounded-2xl relative">
          <h3 className="text-base font-bold text-white mb-4">Request Cake Consultation</h3>
          <form onSubmit={handleInquirySubmit} className="space-y-4">
            <div>
              <label className="block text-slate-400 text-xs font-bold uppercase mb-1.5">Your Name</label>
              <input
                id="inquiry-name-input"
                type="text"
                required
                value={inquiryName}
                onChange={(e) => setInquiryName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white text-xs outline-none transition"
                placeholder="Enter full name"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-xs font-bold uppercase mb-1.5">Email Address</label>
              <input
                id="inquiry-email-input"
                type="email"
                required
                value={inquiryEmail}
                onChange={(e) => setInquiryEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white text-xs outline-none transition"
                placeholder="customer@email.com"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-xs font-bold uppercase mb-1.5">Celebration Details</label>
              <textarea
                id="inquiry-details-input"
                required
                rows={3}
                value={inquiryMsg}
                onChange={(e) => setInquiryMsg(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white text-xs outline-none transition"
                placeholder="e.g. 3-tier chocolate cake for graduation on July 15th..."
              />
            </div>
            <button
              id="submit-inquiry-btn"
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition cursor-pointer"
            >
              Submit Consultation Request
            </button>
            {successMsg && (
              <div className="text-emerald-400 text-xs text-center mt-2 font-semibold">
                Inquiry saved successfully! Our Jinja team will contact you shortly.
              </div>
            )}
          </form>
        </div>
      </section>
    </div>
  );
}
