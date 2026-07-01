import React, { useState, useEffect } from 'react';
import { 
  Cake, ShoppingCart, Lock, Phone, MapPin, Menu as MenuIcon, X, 
  Trash2, Plus, Minus, ArrowRight, UserCheck, Sparkles, LogOut, CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, CartItem, User } from './types';
import Home from './pages/Home';
import Menu from './pages/Menu';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Checkout from './pages/Checkout';
import AdminDashboard from './pages/AdminDashboard';
import PesapalSimulation from './pages/PesapalSimulation';
import PesapalCallback from './pages/PesapalCallback';
import WhatsAppButton from './components/WhatsAppButton';
import { formatCurrency, API_BASE_URL, getImageUrl } from './utils';

export default function App() {
  // Navigation Routing State
  // currentPage holds just the page name (e.g. "pesapal-simulation").
  // pageQuery holds anything after "?" that was passed to handleNavigate,
  // e.g. "orderId=...&trackingId=...&amount=...". Keeping these separate
  // means `currentPage === 'pesapal-simulation'` checks actually match.
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [pageQuery, setPageQuery] = useState<string>('');

  // On first load, detect a REAL redirect back from Pesapal's hosted checkout
  // (Pesapal navigates the browser to callback_url?OrderTrackingId=...&OrderMerchantReference=...).
  // This is a genuine browser URL, unlike our in-app handleNavigate() transitions.
  useEffect(() => {
    const initialParams = new URLSearchParams(window.location.search);
    if (initialParams.get('page') === 'pesapal-callback') {
      setCurrentPage('pesapal-callback');
      setPageQuery(window.location.search.replace(/^\?/, ''));
    }
  }, []);

  // Currency / Branch settings
  const [currency, setCurrency] = useState<'UGX' | 'CLP'>('UGX');

  // Shopping Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Authentication State
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string>('');

  // Products State loaded from server
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  // Fetch products from server on mount & refresh when returning to page
  const fetchProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/products`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error("Error connecting to Express product API:", err);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [currentPage]);

  // Handle addition to Cart
  const handleAddToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  // Modify item quantities inside Cart
  const updateQuantity = (productId: string, delta: number) => {
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.product.id === productId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : item;
        }
        return item;
      }).filter(item => item.quantity > 0);
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const handleLoginSuccess = (loggedInUser: User, sessionToken: string) => {
    setUser(loggedInUser);
    setToken(sessionToken);
    
    // Redirect based on role and cart state
    if (loggedInUser.role === 'admin') {
      handleNavigate('admin');
    } else {
      if (cart.length > 0) {
        handleNavigate('checkout');
      } else {
        handleNavigate('home');
      }
    }
  };

  // Route Guarding for Admin Console
  useEffect(() => {
    if (currentPage === 'admin' && (!user || user.role !== 'admin')) {
      setCurrentPage('home');
    }
  }, [currentPage, user]);

  const handleLogout = () => {
    setUser(null);
    setToken('');
    setCurrentPage('home');
  };

  const handleNavigate = (pageWithQuery: string) => {
    const [page, query] = pageWithQuery.split('?');
    setCurrentPage(page);
    setPageQuery(query || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);
  const cartTotalAmount = cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative selection:bg-amber-500 selection:text-slate-900">
      
      {/* Background Ambience Layout */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(245,158,11,0.06),transparent_50%)] pointer-events-none" />

      {/* HEADER / NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <button
              id="logo-nav-btn"
              onClick={() => handleNavigate('home')}
              className="flex items-center gap-2.5 group text-left cursor-pointer"
            >
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 group-hover:scale-105 transition-transform">
                <Cake className="w-5.5 h-5.5" />
              </div>
              <div>
                <span className="text-xl font-black text-white tracking-tight group-hover:text-amber-400 transition-colors">
                  SK Cakes
                </span>
                <span className="block text-[9px] text-slate-500 uppercase tracking-widest font-extrabold">
                  Jinja, Uganda
                </span>
              </div>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8 text-xs font-bold uppercase tracking-wider">
              <button
                id="nav-home"
                onClick={() => handleNavigate('home')}
                className={`transition cursor-pointer ${currentPage === 'home' ? 'text-amber-500' : 'text-slate-300 hover:text-white'}`}
              >
                Home
              </button>
              <button
                id="nav-menu"
                onClick={() => handleNavigate('menu')}
                className={`transition cursor-pointer ${currentPage === 'menu' ? 'text-amber-500' : 'text-slate-300 hover:text-white'}`}
              >
                Our Menu
              </button>
              <button
                id="nav-contact"
                onClick={() => handleNavigate('contact')}
                className={`transition cursor-pointer ${currentPage === 'contact' ? 'text-amber-500' : 'text-slate-300 hover:text-white'}`}
              >
                Contact Us
              </button>
              
              {user ? (
                <div className="flex items-center gap-4">
                  {user.role === 'admin' ? (
                    <button
                      id="nav-admin"
                      onClick={() => handleNavigate('admin')}
                      className={`flex items-center gap-1.5 transition cursor-pointer text-emerald-400 hover:text-emerald-300`}
                    >
                      <UserCheck className="w-4 h-4" /> Admin Console
                    </button>
                  ) : (
                    <span className="text-slate-300 flex items-center gap-1.5 font-bold">
                      <UserCheck className="w-4 h-4 text-amber-500" />
                      <span>{user.name}</span>
                    </span>
                  )}
                  <button
                    id="nav-logout"
                    onClick={handleLogout}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white hover:border-slate-700 transition cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Logout
                  </button>
                </div>
              ) : (
                <button
                  id="nav-login"
                  onClick={() => handleNavigate('login')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/60 transition cursor-pointer text-slate-400 hover:text-white hover:border-slate-700`}
                >
                  <Lock className="w-3.5 h-3.5" /> Sign In / Sign Up
                </button>
              )}
            </nav>

            {/* Right Buttons Actions */}
            <div className="flex items-center gap-4">
              {/* Branch Quick indicator */}
              <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
                <MapPin className="w-3.5 h-3.5 text-amber-500" />
                <span>{currency === 'UGX' ? 'Jinja, UG' : 'Bugembe, UG'}</span>
              </div>

              {/* Shopping Cart Button Toggle */}
              <button
                id="cart-toggle-btn"
                onClick={() => setIsCartOpen(true)}
                className="relative h-11 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-lg shadow-amber-500/10"
              >
                <ShoppingCart className="w-4.5 h-4.5" />
                <span className="hidden sm:inline">Shopping Cart</span>
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 h-5 min-w-5 bg-rose-500 text-white rounded-full text-[10px] font-black px-1.5 flex items-center justify-center shadow">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Mobile Menu Toggle */}
              <button
                id="mobile-menu-toggle"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-slate-400 hover:text-white transition"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-slate-900 bg-slate-950 px-4 py-4 space-y-3 font-semibold text-sm"
            >
              <button
                id="mobile-nav-home"
                onClick={() => handleNavigate('home')}
                className="block w-full text-left py-2 text-slate-300 hover:text-white"
              >
                Home
              </button>
              <button
                id="mobile-nav-menu"
                onClick={() => handleNavigate('menu')}
                className="block w-full text-left py-2 text-slate-300 hover:text-white"
              >
                Our Menu
              </button>
              <button
                id="mobile-nav-contact"
                onClick={() => handleNavigate('contact')}
                className="block w-full text-left py-2 text-slate-300 hover:text-white"
              >
                Contact Us
              </button>
              <div className="border-t border-slate-900/60 pt-3 flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs text-slate-400 px-1">
                  <span>Branch Currency:</span>
                  <div className="flex bg-slate-900 p-0.5 rounded border border-slate-800">
                    <button id="mob-ugx" onClick={() => setCurrency('UGX')} className={`px-2 py-1 rounded text-[10px] font-bold ${currency === 'UGX' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'}`}>UGX</button>
                    <button id="mob-clp" onClick={() => setCurrency('CLP')} className={`px-2 py-1 rounded text-[10px] font-bold ${currency === 'CLP' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'}`}>CLP</button>
                  </div>
                </div>

                {user ? (
                  <div className="space-y-2">
                    {user.role === 'admin' ? (
                      <button
                        id="mobile-nav-admin"
                        onClick={() => handleNavigate('admin')}
                        className="w-full bg-emerald-950/40 border border-emerald-900/30 text-emerald-400 font-bold py-2.5 rounded-xl text-center text-xs"
                      >
                        Admin Console Dashboard
                      </button>
                    ) : (
                      <div className="text-center py-1.5 text-xs text-slate-400 font-bold">
                        Signed in as <span className="text-amber-500 font-extrabold">{user.name}</span>
                      </div>
                    )}
                    <button
                      id="mobile-nav-logout"
                      onClick={handleLogout}
                      className="w-full bg-rose-950/20 border border-rose-900/30 text-rose-400 font-bold py-2.5 rounded-xl text-center text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Logout
                    </button>
                  </div>
                ) : (
                  <button
                    id="mobile-nav-login"
                    onClick={() => handleNavigate('login')}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-300 font-bold py-2.5 rounded-xl text-center text-xs cursor-pointer"
                  >
                    Sign In / Sign Up
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* CORE VIEWPORT CANVAS */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.18 }}
          >
            {currentPage === 'home' && (
              <Home
                products={products}
                currency={currency}
                setCurrency={setCurrency}
                onAddToCart={handleAddToCart}
                onNavigate={handleNavigate}
              />
            )}
            
            {currentPage === 'menu' && (
              <Menu
                products={products}
                currency={currency}
                onAddToCart={handleAddToCart}
                onNavigate={handleNavigate}
              />
            )}

            {currentPage === 'contact' && <Contact />}

            {currentPage === 'login' && (
              <Login
                onLoginSuccess={handleLoginSuccess}
                onNavigate={handleNavigate}
              />
            )}

            {currentPage === 'checkout' && (
              <Checkout
                cart={cart}
                currency={currency}
                onClearCart={clearCart}
                onNavigate={handleNavigate}
                user={user}
                onLoginSuccess={handleLoginSuccess}
              />
            )}

            {currentPage === 'admin' && (
              <AdminDashboard
                token={token}
                onLogout={handleLogout}
              />
            )}

            {currentPage === 'pesapal-simulation' && (
              <PesapalSimulation
                queryString={pageQuery}
                onNavigate={handleNavigate}
              />
            )}

            {currentPage === 'pesapal-callback' && (
              <PesapalCallback
                queryString={pageQuery}
                onNavigate={handleNavigate}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* SHOPPING CART SLIDE-OUT DRAWER */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-slate-950 z-50 cursor-pointer"
            />

            {/* Slider container */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed inset-y-0 right-0 max-w-md w-full bg-slate-900 border-l border-slate-800 z-50 flex flex-col justify-between shadow-2xl"
            >
              {/* Header */}
              <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-amber-500" />
                  <h3 className="text-base font-bold text-white">Your Shopping Cart</h3>
                </div>
                <button
                  id="close-cart-btn"
                  onClick={() => setIsCartOpen(false)}
                  className="p-1 rounded-lg text-slate-500 hover:text-white hover:bg-slate-900 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-grow overflow-y-auto p-5 divide-y divide-slate-800/60">
                {cart.length === 0 ? (
                  <div className="text-center py-20 space-y-4">
                    <ShoppingCart className="w-12 h-12 text-slate-600 mx-auto" />
                    <h4 className="text-white font-bold text-sm">Shopping Cart is Empty</h4>
                    <p className="text-slate-400 text-xs max-w-xs mx-auto leading-relaxed">
                      Explore our delicious cakes, samosas, crispy chicken and chips menu categories to load items!
                    </p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.product.id} className="py-4 flex gap-4 text-xs font-semibold">
                      <img
                        src={getImageUrl(item.product.imageUrl)}
                        alt={item.product.name}
                        className="w-14 h-14 rounded-xl object-cover border border-slate-800 flex-shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      
                      <div className="flex-grow space-y-2">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="text-slate-100 font-bold line-clamp-1">{item.product.name}</h4>
                          <button
                            id={`remove-cart-item-${item.product.id}`}
                            onClick={() => handleRemoveFromCart(item.product.id)}
                            className="text-slate-500 hover:text-rose-400 transition"
                          >
                            <Trash2 className="w-4.5 h-4.5" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5">
                            <button
                              id={`dec-qty-${item.product.id}`}
                              onClick={() => updateQuantity(item.product.id, -1)}
                              className="p-1 text-slate-400 hover:text-white"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2 text-white font-mono text-xs">{item.quantity}</span>
                            <button
                              id={`inc-qty-${item.product.id}`}
                              onClick={() => updateQuantity(item.product.id, 1)}
                              className="p-1 text-slate-400 hover:text-white"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <div className="text-amber-400 font-mono font-bold">
                            {currency === 'UGX'
                              ? `UGX ${(item.product.price * item.quantity).toLocaleString()}`
                              : `CLP ${Math.round(item.product.price * 0.25 * item.quantity).toLocaleString()}`
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Checkout Footer Block */}
              {cart.length > 0 && (
                <div className="p-5 border-t border-slate-800 bg-slate-950 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400 font-semibold">Order Subtotal:</span>
                    <span className="text-lg font-black text-amber-500 font-mono">
                      {currency === 'UGX'
                        ? `UGX ${cartTotalAmount.toLocaleString()}`
                        : `CLP ${Math.round(cartTotalAmount * 0.25).toLocaleString()}`
                      }
                    </span>
                  </div>

                  <button
                    id="cart-checkout-btn"
                    onClick={() => {
                      setIsCartOpen(false);
                      handleNavigate('checkout');
                    }}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-amber-500/10"
                  >
                    Proceed to Delivery Checkout <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* FOOTER AREA */}
      <footer className="bg-slate-950 border-t border-slate-900 mt-20 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                <Cake className="w-5 h-5" />
              </div>
              <span className="text-lg font-extrabold text-white">SK Cakes</span>
            </div>
            <p className="leading-relaxed">
              Serving the finest multi-layer birthday cakes, custom celebration toppers, hot sizzling fast foods, and sweet Ugandan mandazi snacks.
            </p>
          </div>

          {/* Jinja Contact */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">Jinja Headquarters</h4>
            <ul className="space-y-2 text-slate-400">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <span>Bugembe, Jinja-Iganga Highway, Jinja, Uganda</span>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <a href="tel:+256760593042" className="hover:text-amber-400 transition">+256 760 593 042</a>
              </li>
            </ul>
          </div>

          {/* Bugembe & Delivery Contact */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">Bugembe Outlet & Support</h4>
            <ul className="space-y-2 text-slate-400">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <span>Jinja-Iganga Highway, Jinja, Uganda</span>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <a href="tel:+256700235315" className="hover:text-amber-400 transition">+256 700 235 315</a>
              </li>
              <li className="text-[11px] text-amber-400/80 font-bold">
                🚚 Delivery Time: Today or in 2 days
              </li>
            </ul>
          </div>

          {/* Quick links & permissions */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">Secure Portal</h4>
            <p className="leading-relaxed">
              Order checkout processes are encrypted and completely governed by Pesapal v3 gateway security measures.
            </p>
            <button
              id="footer-admin-sign-btn"
              onClick={() => handleNavigate('login')}
              className="text-amber-400 hover:underline font-bold text-xs"
            >
              🔑 Staff Sign In Console
            </button>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-900/60 py-6 text-center text-[11px] text-slate-500">
          © {new Date().getFullYear()} SK Cakes & Snacks Business. All rights reserved. Registered Business in Jinja, Uganda.
        </div>
      </footer>

      <WhatsAppButton />
    </div>
  );
}
