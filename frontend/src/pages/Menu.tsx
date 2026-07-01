import React, { useState } from 'react';
import { Search, SlidersHorizontal, Check, ShoppingCart, Cake, Flame, Coffee, HelpCircle } from 'lucide-react';
import { Product } from '../types';
import { resolveImageUrl } from '../utils';

interface MenuProps {
  products: Product[];
  currency: 'UGX' | 'CLP';
  onAddToCart: (product: Product) => void;
  onNavigate: (page: string) => void;
}

export default function Menu({ products, currency, onAddToCart, onNavigate }: MenuProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Categories list
  const categories = [
    { id: 'all', label: 'All Items' },
    { id: 'cakes', label: 'Cakes & Cupcakes' },
    { id: 'snacks', label: 'Chicken & Snacks' },
    { id: 'chips', label: 'Chips & Fries' },
    { id: 'drinks', label: 'Drinks & Juices' },
    { id: 'cookies', label: 'Cookies & Bakery' },
    { id: 'other', label: 'Doughnuts & Others' }
  ];

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Header Description */}
      <div className="text-center max-w-xl mx-auto space-y-3">
        <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">Our Delicious Menu</h1>
        <p className="text-slate-400 text-sm md:text-base">
          Fresh ingredients, traditional Ugandan mandazi recipe, crunchy chicken snacks, and artisan cakes custom-crafted for any celebration.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-800">
        <div className="relative flex-grow">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
          <input
            id="menu-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl pl-11 pr-4 py-2.5 text-white text-xs outline-none transition"
            placeholder="Search our delicious cakes, samosas, chips..."
          />
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <SlidersHorizontal className="w-4 h-4 text-slate-500 hidden sm:block flex-shrink-0" />
          {categories.map((cat) => (
            <button
              id={`filter-btn-${cat.id}`}
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Products Display Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/30 border border-slate-900 rounded-3xl space-y-3">
          <p className="text-slate-500 text-sm">No tasty delicacies match your search filters.</p>
          <button
            id="reset-filter-btn"
            onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
            className="text-amber-400 text-xs font-bold hover:underline"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((item) => (
            <div
              id={`menu-item-${item.id}`}
              key={item.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between group"
            >
              {/* Image Banner */}
              <div className="relative h-48 overflow-hidden bg-slate-950">
                <img
                  src={resolveImageUrl(item.imageUrl)}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/70 to-transparent h-12" />
                
                {/* Stock Indicator */}
                <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-2 py-1 rounded-lg border border-slate-800 text-[10px] text-slate-300 font-bold flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${item.stock > 10 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  {item.stock > 0 ? `${item.stock} Available` : 'Sold Out'}
                </div>

                <div className="absolute top-3 right-3 bg-amber-500 text-slate-950 font-extrabold text-[9px] px-2.5 py-1 rounded-full uppercase tracking-wider">
                  {item.category}
                </div>
              </div>

              {/* Product Info Block */}
              <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-white font-extrabold text-base leading-snug group-hover:text-amber-400 transition-colors">
                      {item.name}
                    </h3>
                    {item.subCategory && (
                      <span className="text-[10px] text-slate-500 font-mono bg-slate-950 border border-slate-800 px-2 py-0.5 rounded uppercase">
                        {item.subCategory}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">
                    {item.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-950">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Price</span>
                    <span className="text-amber-400 font-mono font-extrabold text-base">
                      {currency === 'UGX'
                        ? `UGX ${item.price.toLocaleString()}`
                        : `CLP ${Math.round(item.price * 0.25).toLocaleString()}`
                      }
                    </span>
                  </div>

                  <button
                    id={`menu-add-btn-${item.id}`}
                    onClick={() => onAddToCart(item)}
                    disabled={item.stock <= 0}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                      item.stock > 0
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow'
                        : 'bg-slate-950 text-slate-600 cursor-not-allowed border border-slate-900'
                    }`}
                  >
                    <ShoppingCart className="w-3.5 h-3.5" /> Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Specialty Custom Section Info */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center sm:text-left">
          <h4 className="text-white font-bold text-sm">Need any modifications or have allergies?</h4>
          <p className="text-slate-400 text-xs">Let us know during checkout! We accommodate custom dairy-free and eggless cake requests.</p>
        </div>
        <button
          id="custom-modify-contact-btn"
          onClick={() => onNavigate('contact')}
          className="bg-slate-950 hover:bg-slate-950/80 text-white border border-slate-800 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer"
        >
          Speak with Jinja Bakers
        </button>
      </div>
    </div>
  );
}
