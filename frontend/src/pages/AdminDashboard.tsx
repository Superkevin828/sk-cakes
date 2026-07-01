import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, ShoppingCart, MessageSquare, Image, Check, RefreshCw, 
  Settings, FolderHeart, Calendar, DollarSign, Package, Tag, Layers, CheckCircle2,
  XCircle, Info
} from 'lucide-react';
import { Product, Order, Message } from '../types';
import { API_BASE_URL, getImageUrl } from '../utils';

interface AdminDashboardProps {
  token: string;
  onLogout: () => void;
}

export default function AdminDashboard({ token, onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'messages' | 'gallery'>('products');
  
  // API State
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [gallery, setGallery] = useState<string[]>([]);
  
  // Loading & Sync States
  const [isLoading, setIsLoading] = useState(false);
  const [syncCount, setSyncCount] = useState(0);

  // Form States (Product Management)
  const [isEditing, setIsEditing] = useState<string | null>(null); // holds id if editing
  const [prodName, setProdName] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodCategory, setProdCategory] = useState<'cakes' | 'snacks' | 'chips' | 'drinks' | 'cookies' | 'other'>('cakes');
  const [prodSubCategory, setProdSubCategory] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodStock, setProdStock] = useState('50');
  const [prodImage, setProdImage] = useState(''); // existing/gallery image URL (used when NOT uploading a new file)
  const [prodImageFile, setProdImageFile] = useState<File | null>(null); // newly picked file, takes priority
  const [prodImagePreview, setProdImagePreview] = useState('');
  const [prodFeatured, setProdFeatured] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Form States (Gallery Manager)
  const [newGalleryUrl, setNewGalleryUrl] = useState('');

  // Fetch all core admin datasets
  useEffect(() => {
    const fetchAdminData = async () => {
      setIsLoading(true);
      try {
        const prodRes = await fetch(`${API_BASE_URL}/api/products`);
        const prodData = await prodRes.json();
        setProducts(prodData.products || []);

        const orderRes = await fetch(`${API_BASE_URL}/api/orders`);
        const orderData = await orderRes.json();
        setOrders(orderData.orders || []);

        const msgRes = await fetch(`${API_BASE_URL}/api/messages`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (msgRes.ok) {
          const msgData = await msgRes.json();
          setMessages(msgData.messages || []);
        }

        const galRes = await fetch(`${API_BASE_URL}/api/gallery`);
        const galData = await galRes.json();
        setGallery(galData);
      } catch (err) {
        console.error("Error loading administration logs:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminData();
  }, [token, syncCount]);

  // Handle Product Add / Edit submission
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!prodName || !prodPrice || !prodCategory) {
      setFormError('Please fill out Name, Price, and Category.');
      return;
    }

    // multipart/form-data so a real file (if picked) reaches multer -> backend/uploads/
    const formData = new FormData();
    formData.append('name', prodName);
    formData.append('description', prodDesc);
    formData.append('price', String(Number(prodPrice)));
    formData.append('category', prodCategory);
    formData.append('subCategory', prodSubCategory);
    formData.append('stock', String(Number(prodStock)));
    formData.append('isFeatured', String(prodFeatured));

    if (prodImageFile) {
      // New file picked from device -> multer saves it to backend/uploads/
      formData.append('image', prodImageFile);
    } else if (prodImage) {
      // Reusing an existing/gallery URL (no new file selected)
      formData.append('imageUrl', prodImage);
    }

    try {
      const url = isEditing ? `${API_BASE_URL}/api/products/${isEditing}` : `${API_BASE_URL}/api/products`;
      const method = isEditing ? 'PUT' : 'POST';

      // NOTE: do NOT set a 'Content-Type' header here — the browser sets the
      // correct multipart boundary itself. Setting it manually breaks the upload.
      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (res.ok) {
        setFormSuccess(isEditing ? 'Product modified successfully!' : 'New product cataloged successfully!');
        resetProductForm();
        setSyncCount(c => c + 1);
      } else {
        const errData = await res.json();
        setFormError(errData.error || 'Server rejected product configuration.');
      }
    } catch (err) {
      setFormError('Failed to synchronize with server.');
    }
  };

  const handleEditClick = (prod: Product) => {
    setIsEditing(prod.id);
    setProdName(prod.name);
    setProdDesc(prod.description);
    setProdCategory(prod.category);
    setProdSubCategory(prod.subCategory || '');
    setProdPrice(prod.price.toString());
    setProdStock(prod.stock.toString());
    setProdImage(prod.imageUrl);
    setProdImageFile(null);
    setProdImagePreview('');
    setProdFeatured(prod.isFeatured);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm("Are you sure you want to remove this product from sale?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setSyncCount(c => c + 1);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const resetProductForm = () => {
    setIsEditing(null);
    setProdName('');
    setProdDesc('');
    setProdCategory('cakes');
    setProdSubCategory('');
    setProdPrice('');
    setProdStock('50');
    setProdImage('');
    setProdImageFile(null);
    setProdImagePreview('');
    setProdFeatured(false);
  };

  // Handle picking a file from the device for the product photo
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProdImageFile(file);
    setProdImage(''); // a fresh file takes priority over any gallery/URL pick
    setProdImagePreview(URL.createObjectURL(file));
  };

  // Update order statuses
  const handleUpdateOrderStatus = async (orderId: string, orderStatus: string, paymentStatus: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ orderStatus, paymentStatus })
      });
      if (res.ok) {
        setSyncCount(c => c + 1);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Mark inquiry as Read
  const handleMarkMessageRead = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/messages/${id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setSyncCount(c => c + 1);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Add gallery image
  const handleAddGalleryImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGalleryUrl) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/gallery`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ imageUrl: newGalleryUrl })
      });
      if (res.ok) {
        setNewGalleryUrl('');
        setSyncCount(c => c + 1);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Helper values for dashboard stats
  const totalSales = orders
    .filter(o => o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const pendingOrdersCount = orders.filter(o => o.orderStatus === 'pending').length;
  const unreadMessagesCount = messages.filter(m => !m.isRead).length;

  return (
    <div className="space-y-10 pb-20">
      
      {/* Top Banner stats */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-slate-900 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Executive Management Console</h1>
          <p className="text-slate-400 text-xs mt-1">
            Real-time control over products, orders, consultation requests, and project gallery images.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            id="sync-dashboard-btn"
            onClick={() => setSyncCount(c => c + 1)}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white transition flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Sync Logs
          </button>
          
          <button
            id="admin-logout-btn"
            onClick={onLogout}
            className="px-4 py-2.5 rounded-xl bg-rose-950/40 border border-rose-900/30 text-rose-400 hover:text-rose-300 hover:bg-rose-950/60 transition text-xs font-bold cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Analytics Bento Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl relative overflow-hidden">
          <DollarSign className="absolute -bottom-2 -right-2 w-16 h-16 text-slate-950 pointer-events-none" />
          <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Total Sales Paid</div>
          <div className="text-xl md:text-2xl font-extrabold text-white mt-1 font-mono">
            UGX {totalSales.toLocaleString()}
          </div>
          <div className="text-[10px] text-emerald-400 mt-1 font-semibold">✔ Fully verified transactions</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl relative overflow-hidden">
          <Package className="absolute -bottom-2 -right-2 w-16 h-16 text-slate-950 pointer-events-none" />
          <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Active Catalog</div>
          <div className="text-xl md:text-2xl font-extrabold text-white mt-1 font-mono">
            {products.length} Products
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Cakes, fries, snacks, mandazi</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl relative overflow-hidden">
          <ShoppingCart className="absolute -bottom-2 -right-2 w-16 h-16 text-slate-950 pointer-events-none" />
          <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Pending Orders</div>
          <div className="text-xl md:text-2xl font-extrabold text-amber-500 mt-1 font-mono">
            {pendingOrdersCount} Requests
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Awaiting preparation queue</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl relative overflow-hidden">
          <MessageSquare className="absolute -bottom-2 -right-2 w-16 h-16 text-slate-950 pointer-events-none" />
          <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">New Consultations</div>
          <div className="text-xl md:text-2xl font-extrabold text-white mt-1 font-mono">
            {unreadMessagesCount} Unread
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Incoming celebration messages</div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-slate-800 space-x-1 overflow-x-auto scrollbar-none">
        <button
          id="tab-btn-products"
          onClick={() => setActiveTab('products')}
          className={`flex-1 min-w-[120px] py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition cursor-pointer ${
            activeTab === 'products' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Package className="w-4 h-4" /> Products Catalog
        </button>
        <button
          id="tab-btn-orders"
          onClick={() => setActiveTab('orders')}
          className={`flex-1 min-w-[120px] py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition cursor-pointer ${
            activeTab === 'orders' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShoppingCart className="w-4 h-4" /> Orders CRM ({orders.length})
        </button>
        <button
          id="tab-btn-messages"
          onClick={() => setActiveTab('messages')}
          className={`flex-1 min-w-[120px] py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition cursor-pointer ${
            activeTab === 'messages' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <MessageSquare className="w-4 h-4" /> Inquiries Inbox ({messages.length})
        </button>
        <button
          id="tab-btn-gallery"
          onClick={() => setActiveTab('gallery')}
          className={`flex-1 min-w-[120px] py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition cursor-pointer ${
            activeTab === 'gallery' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Image className="w-4 h-4" /> Project Gallery ({gallery.length})
        </button>
      </div>

      {/* Primary Dashboard Screens */}
      <div className="bg-slate-950 text-slate-100">
        
        {/* TAB 1: PRODUCTS MANAGER */}
        {activeTab === 'products' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left: Add/Edit Product Form */}
            <form onSubmit={handleProductSubmit} className="lg:col-span-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <Tag className="w-4.5 h-4.5 text-amber-500" />
                {isEditing ? 'Edit Product Details' : 'Catalog New Delicacy'}
              </h3>

              {formError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs font-semibold">
                  {formError}
                </div>
              )}

              {formSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-semibold">
                  {formSuccess}
                </div>
              )}

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-400 font-bold mb-1 uppercase tracking-wider">Product Title *</label>
                  <input
                    id="prod-name"
                    type="text"
                    required
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2 text-white outline-none"
                    placeholder="e.g. Masala Chips Large"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1 uppercase tracking-wider">Description</label>
                  <textarea
                    id="prod-desc"
                    rows={2}
                    value={prodDesc}
                    onChange={(e) => setProdDesc(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2 text-white outline-none"
                    placeholder="Describe ingredients, allergen warnings, or platter sizes..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1 uppercase tracking-wider">Category *</label>
                    <select
                      id="prod-cat"
                      value={prodCategory}
                      onChange={(e: any) => setProdCategory(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-2 text-white outline-none"
                    >
                      <option value="cakes">Cakes</option>
                      <option value="snacks">Snacks</option>
                      <option value="chips">Chips</option>
                      <option value="drinks">Drinks</option>
                      <option value="cookies">Cookies</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1 uppercase tracking-wider">Subcategory</label>
                    <input
                      id="prod-subcat"
                      type="text"
                      value={prodSubCategory}
                      onChange={(e) => setProdSubCategory(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2 text-white outline-none"
                      placeholder="e.g. Cupcakes"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1 uppercase tracking-wider">Price (UGX) *</label>
                    <input
                      id="prod-price"
                      type="number"
                      required
                      value={prodPrice}
                      onChange={(e) => setProdPrice(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2 text-white outline-none font-mono"
                      placeholder="8000"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1 uppercase tracking-wider">Stock Level</label>
                    <input
                      id="prod-stock"
                      type="number"
                      value={prodStock}
                      onChange={(e) => setProdStock(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2 text-white outline-none font-mono"
                      placeholder="100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1 uppercase tracking-wider">Product Photo</label>

                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-xl border border-slate-800 bg-slate-950 overflow-hidden flex-shrink-0">
                      {(prodImagePreview || prodImage) && (
                        <img
                          src={prodImagePreview || getImageUrl(prodImage)}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      )}
                    </div>
                    <input
                      id="prod-image-file"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                      onChange={handleImageFileChange}
                      className="flex-1 text-slate-400 text-[11px] file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-amber-500 file:text-slate-950 file:font-bold file:text-[11px] file:cursor-pointer cursor-pointer"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">JPEG, PNG, WEBP or GIF, up to 5MB. Uploads are saved on the server in backend/uploads/.</p>

                  {/* Select from gallery quick-picker */}
                  {gallery.length > 0 && (
                    <div className="mt-2">
                      <span className="text-[10px] text-slate-500 font-semibold uppercase block mb-1">Or Quick Pick From Project Gallery:</span>
                      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                        {gallery.map((img, i) => (
                          <button
                            id={`picker-img-${i}`}
                            key={i}
                            type="button"
                            onClick={() => { setProdImage(img); setProdImageFile(null); setProdImagePreview(''); }}
                            className={`w-10 h-10 rounded border flex-shrink-0 overflow-hidden relative ${prodImage === img ? 'border-amber-500 scale-95 ring-1 ring-amber-500' : 'border-slate-800'}`}
                          >
                            <img src={getImageUrl(img)} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    id="prod-featured"
                    type="checkbox"
                    checked={prodFeatured}
                    onChange={(e) => setProdFeatured(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 bg-slate-950 border-slate-800 accent-amber-500 focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="prod-featured" className="text-slate-300 font-semibold cursor-pointer">
                    Promote to Featured / Today's Specials
                  </label>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  id="prod-submit-btn"
                  type="submit"
                  className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition cursor-pointer"
                >
                  {isEditing ? 'Update Item' : 'Publish Product'}
                </button>
                {isEditing && (
                  <button
                    id="prod-cancel-edit-btn"
                    type="button"
                    onClick={resetProductForm}
                    className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white text-xs transition cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>

            {/* Right: Existing Products List Table */}
            <div className="lg:col-span-8 bg-slate-900 border border-slate-800 p-6 rounded-2xl overflow-hidden">
              <h3 className="text-base font-bold text-white mb-4">Active Jinja Store Inventory ({products.length})</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                      <th className="pb-3 pl-2">Product Info</th>
                      <th className="pb-3">Category</th>
                      <th className="pb-3">Price</th>
                      <th className="pb-3">Stock</th>
                      <th className="pb-3 pr-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-950/40 group">
                        <td className="py-3 pl-2 flex items-center gap-3">
                          <img src={getImageUrl(p.imageUrl)} alt={p.name} className="w-10 h-10 rounded-lg object-cover border border-slate-800" referrerPolicy="no-referrer" />
                          <div>
                            <div className="font-bold text-slate-200 group-hover:text-amber-400 transition">{p.name}</div>
                            {p.isFeatured && (
                              <span className="inline-block bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider mt-0.5">
                                Featured
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 text-slate-300 capitalize">{p.category}</td>
                        <td className="py-3 text-amber-400 font-mono font-bold">UGX {p.price.toLocaleString()}</td>
                        <td className="py-3 text-slate-300 font-mono">{p.stock} pcs</td>
                        <td className="py-3 pr-2 text-right space-x-2">
                          <button
                            id={`edit-prod-btn-${p.id}`}
                            onClick={() => handleEditClick(p)}
                            className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-amber-400 border border-slate-800 transition cursor-pointer"
                            title="Edit"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            id={`delete-prod-btn-${p.id}`}
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-1.5 rounded-lg bg-slate-950 hover:bg-rose-950/40 text-rose-400 border border-slate-800 transition cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: ORDERS MANAGEMENT CRM */}
        {activeTab === 'orders' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <h2 className="text-base font-bold text-white">Live Client Sales Orders ({orders.length})</h2>
            
            {orders.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                Awaiting incoming purchases. No order records currently saved in backend memory.
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
                    {/* Order header row */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-900 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold text-amber-400">{order.id}</span>
                          <span className="text-[10px] text-slate-500 font-medium">
                            {new Date(order.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <div className="text-xs text-slate-300 mt-1">
                          Customer: <strong className="text-white">{order.customerName}</strong> | Phone: {order.customerPhone}
                        </div>
                        {order.customerEmail && <div className="text-[10px] text-slate-400">Email: {order.customerEmail}</div>}
                        <div className="text-[10px] text-slate-400">Delivery Address: {order.deliveryAddress}</div>
                      </div>

                      {/* Status selectors */}
                      <div className="flex flex-wrap gap-2.5 items-center">
                        {/* Order status */}
                        <div className="flex flex-col">
                          <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider mb-1">Prep Status</span>
                          <select
                            id={`status-select-${order.id}`}
                            value={order.orderStatus}
                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value, order.paymentStatus)}
                            className="bg-slate-900 border border-slate-800 text-xs rounded-lg px-2 py-1 text-slate-300 outline-none"
                          >
                            <option value="pending">Pending</option>
                            <option value="preparing">Preparing</option>
                            <option value="delivering">Delivering</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>

                        {/* Payment status */}
                        <div className="flex flex-col">
                          <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider mb-1">Payment Status</span>
                          <select
                            id={`payment-status-select-${order.id}`}
                            value={order.paymentStatus}
                            onChange={(e) => handleUpdateOrderStatus(order.id, order.orderStatus, e.target.value)}
                            className="bg-slate-900 border border-slate-800 text-xs rounded-lg px-2 py-1 text-slate-300 outline-none"
                          >
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                            <option value="failed">Failed</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Order items and total */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                      <div className="md:col-span-8 space-y-1.5">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Ordered Items:</span>
                        <div className="flex flex-wrap gap-2">
                          {order.items.map((item: any, idx: number) => (
                            <span key={idx} className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs text-slate-300">
                              {item.name} <strong className="text-amber-400">x{item.quantity}</strong>
                            </span>
                          ))}
                        </div>
                        {order.notes && (
                          <div className="text-[11px] text-slate-400 mt-2 italic bg-slate-900/40 px-3 py-1 rounded border border-dashed border-slate-800">
                            Notes: "{order.notes}"
                          </div>
                        )}
                      </div>

                      {/* Summary box */}
                      <div className="md:col-span-4 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 text-right space-y-1">
                        <div className="text-[10px] text-slate-500 uppercase font-bold">Method: <span className="text-white capitalize">{order.paymentMethod}</span></div>
                        {order.pesapalTrackingId && (
                          <div className="text-[9px] text-slate-500">Pesapal Tracking ID: <code className="text-amber-400 font-mono bg-slate-950 px-1 py-0.5 rounded">{order.pesapalTrackingId}</code></div>
                        )}
                        <div className="text-xs text-slate-400 mt-1">Total Sum:</div>
                        <div className="text-base font-extrabold text-amber-400 font-mono">
                          UGX {order.totalAmount.toLocaleString()}
                        </div>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CONTACT MESSAGES INBOX */}
        {activeTab === 'messages' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-white">Incoming Customer Inquiries & Custom Quotes ({messages.length})</h2>
            
            {messages.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                No custom inquiries or general queries in inbox currently.
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((m) => (
                  <div key={m.id} className={`p-4 rounded-xl border transition ${m.isRead ? 'bg-slate-950 border-slate-800/50 opacity-70' : 'bg-slate-950 border-amber-500/20'}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{m.name}</span>
                        <span className="text-slate-400 text-xs">({m.email})</span>
                        {m.phone && <span className="text-slate-500 text-xs">| {m.phone}</span>}
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-slate-500">
                          {new Date(m.createdAt).toLocaleString()}
                        </span>
                        {!m.isRead && (
                          <button
                            id={`mark-read-btn-${m.id}`}
                            onClick={() => handleMarkMessageRead(m.id)}
                            className="bg-amber-500 text-slate-950 font-bold px-2.5 py-1 rounded-lg text-[10px] transition cursor-pointer hover:bg-amber-400"
                          >
                            Mark Read
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-xs text-amber-400 font-bold mb-1 uppercase tracking-wide">
                      Subject: {m.subject}
                    </div>
                    <p className="text-slate-300 text-xs leading-relaxed font-sans whitespace-pre-wrap">
                      {m.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: PROJECT IMAGES GALLERY MANAGER */}
        {activeTab === 'gallery' && (
          <div className="space-y-6">
            
            {/* Gallery Addition Form */}
            <form onSubmit={handleAddGalleryImage} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Image className="w-5 h-5 text-amber-500" />
                Upload New Celebration Image of Project
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Add beautiful high-quality photos of freshly baked cakes, sizzling French fries, crisp samosas, or chicken snacks to inspire clients and use across the catalog!
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  id="new-gallery-url"
                  type="text"
                  required
                  value={newGalleryUrl}
                  onChange={(e) => setNewGalleryUrl(e.target.value)}
                  className="flex-grow bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-2.5 text-white text-xs outline-none outline-none"
                  placeholder="Paste image url (e.g., https://images.unsplash.com/photo-1578985545062-69928b1d9587...)"
                />
                <button
                  id="gallery-add-btn"
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 justify-center"
                >
                  <Plus className="w-4 h-4" /> Save Project Image
                </button>
              </div>
            </form>

            {/* Gallery list cards */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-base font-bold text-white mb-4">Current Display Gallery Cards</h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {gallery.map((imgUrl, idx) => (
                  <div key={idx} className="group bg-slate-950 rounded-xl overflow-hidden border border-slate-800 relative shadow">
                    <img src={imgUrl} className="w-full h-28 object-cover group-hover:scale-105 transition-transform duration-300" referrerPolicy="no-referrer" />
                    <div className="absolute inset-x-0 bottom-0 bg-slate-900/90 backdrop-blur-sm p-1.5 text-center text-[10px] text-slate-400 font-mono border-t border-slate-800">
                      Card #{idx + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
