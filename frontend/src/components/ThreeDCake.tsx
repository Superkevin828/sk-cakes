import React, { useState } from 'react';
import { Sparkles, Flame, RefreshCw, Star } from 'lucide-react';

export default function ThreeDCake() {
  const [flavorTheme, setFlavorTheme] = useState<'chocolate' | 'strawberry' | 'rainbow'>('chocolate');
  const [speed, setSpeed] = useState<'normal' | 'fast' | 'paused'>('normal');
  const [candleLit, setCandleLit] = useState(true);
  const [sprinklesCount, setSprinklesCount] = useState<number>(0);
  const [wishStatus, setWishStatus] = useState<string>('');

  const sides = Array.from({ length: 12 }, (_, i) => i);

  const handleBlowCandle = () => {
    if (candleLit) {
      setCandleLit(false);
      setWishStatus('✨ Make a wish! Your sweet cake dream is set to come true in Jinja & Bugembe!');
    } else {
      setCandleLit(true);
      setWishStatus('');
    }
  };

  const addSprinkles = () => {
    setSprinklesCount(prev => prev + 15);
    setTimeout(() => {
      setWishStatus('🎉 Delicious sprinkles showered onto the tiers in real-time!');
    }, 100);
  };

  const resetCake = () => {
    setCandleLit(true);
    setSprinklesCount(0);
    setWishStatus('');
  };

  return (
    <div className="flex flex-col items-center space-y-6 w-full max-w-sm mx-auto">
      {/* 3D Stage Container */}
      <div className="relative w-full h-[280px] bg-slate-950/40 border border-slate-900 rounded-2xl flex items-center justify-center overflow-hidden shadow-inner group">
        
        {/* Stage background grid/glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.06),transparent_70%)]" />
        
        {/* Floating instruction badge */}
        <div className="absolute top-3 left-3 bg-slate-900/90 border border-slate-800 px-2 py-1 rounded-md text-[9px] text-slate-400 font-mono flex items-center gap-1">
          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
          <span>Interactive 3D Render</span>
        </div>

        {/* 3D Scene Wrapper */}
        <div className="cake-scene w-full h-full flex items-center justify-center">
          <div className={`cake-carousel ${speed === 'fast' ? 'fast' : ''} ${speed === 'paused' ? 'paused' : ''} theme-${flavorTheme}`}>
            
            {/* 3D Sprinkles Overlay */}
            {sprinklesCount > 0 && Array.from({ length: Math.min(sprinklesCount, 60) }).map((_, idx) => {
              // Generate pseudo-random coordinates based on index to keep it deterministic
              const tierIndex = idx % 3; // bottom, middle, top
              const radius = tierIndex === 0 ? 70 : tierIndex === 1 ? 50 : 30;
              const angle = (idx * 43) % 360;
              const xPos = radius * Math.cos((angle * Math.PI) / 180);
              const zPos = radius * Math.sin((angle * Math.PI) / 180);
              const yOffset = tierIndex === 0 ? 45 : tierIndex === 1 ? 0 : -42;
              
              const colors = ['#f59e0b', '#ec4899', '#3b82f6', '#10b981', '#f43f5e', '#a855f7'];
              const color = colors[idx % colors.length];

              return (
                <div
                  key={idx}
                  className="absolute w-1.5 h-1.5 rounded-full z-30"
                  style={{
                    backgroundColor: color,
                    transform: `translateX(${xPos}px) translateY(${yOffset}px) translateZ(${zPos}px)`,
                    boxShadow: '0 1px 2px rgba(0,0,0,0.4)',
                  }}
                />
              );
            })}

            {/* Cake Base Stand */}
            <div className="cake-tier tier-base tier-base-pos">
              <div className="cake-cap cap-top bg-gradient-to-r from-slate-800 to-slate-700" />
              {sides.map((i) => (
                <div key={i} className={`side-panel side-${i} bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 border-x border-slate-900`} />
              ))}
              <div className="cake-cap cap-bottom bg-slate-900" />
            </div>

            {/* Tier 1: Bottom Tier */}
            <div className="cake-tier tier-bottom tier-bottom-pos">
              <div className="cake-cap cap-top" />
              {sides.map((i) => (
                <div key={i} className={`side-panel side-${i}`} />
              ))}
              <div className="cake-cap cap-bottom" />
            </div>

            {/* Tier 2: Middle Tier */}
            <div className="cake-tier tier-middle tier-middle-pos">
              <div className="cake-cap cap-top" />
              {sides.map((i) => (
                <div key={i} className={`side-panel side-${i}`} />
              ))}
              <div className="cake-cap cap-bottom" />
            </div>

            {/* Tier 3: Top Tier */}
            <div className="cake-tier tier-top tier-top-pos">
              <div className="cake-cap cap-top" />
              {sides.map((i) => (
                <div key={i} className={`side-panel side-${i}`} />
              ))}
              <div className="cake-cap cap-bottom" />
            </div>

            {/* Candle Assembly on Top Center */}
            <div className="cake-tier candle-pos flex flex-col items-center">
              {/* Wick & Flame */}
              {candleLit ? (
                <div 
                  id="candle-flame-element"
                  onClick={handleBlowCandle}
                  className="cursor-pointer group/flame"
                  title="Click to blow out!"
                >
                  <div className="candle-flame" />
                  <div className="candle-wick" />
                </div>
              ) : (
                <div 
                  id="candle-extinguished-element"
                  onClick={handleBlowCandle}
                  className="cursor-pointer pt-4 h-6 flex items-center justify-center text-slate-500 font-bold hover:text-amber-500 transition-colors text-[10px]"
                  title="Click to relight!"
                >
                  💨 Puff
                </div>
              )}
              {/* Candle Body */}
              <div className="w-2.5 h-8 bg-gradient-to-r from-amber-200 via-white to-amber-200 border-x border-amber-300 rounded-sm shadow-md" />
            </div>

          </div>
        </div>

        {/* Hover Hint */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-slate-900/90 border border-slate-800 px-3 py-1 rounded-full text-[10px] text-slate-400 font-medium">
          {candleLit ? '🎂 Click the Flame to blow out!' : '🔥 Click Puff to relight!'}
        </div>
      </div>

      {/* Wish banner */}
      {wishStatus && (
        <div className="w-full text-center p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl text-[11px] font-bold leading-relaxed animate-fade-in">
          {wishStatus}
        </div>
      )}

      {/* Control Dashboard */}
      <div className="w-full bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-4">
        {/* Flavors Select */}
        <div className="space-y-1.5">
          <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Cake Frosting Flavor</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'chocolate', label: '🍫 Chocolate' },
              { id: 'strawberry', label: '🍓 Strawberry' },
              { id: 'rainbow', label: '🌈 Rainbow' }
            ].map((flavor) => (
              <button
                key={flavor.id}
                id={`flavor-${flavor.id}`}
                onClick={() => setFlavorTheme(flavor.id as any)}
                className={`py-1.5 rounded-lg text-[10px] font-extrabold transition-all border ${
                  flavorTheme === flavor.id
                    ? 'bg-amber-500 border-amber-500 text-slate-950 font-black shadow'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {flavor.label}
              </button>
            ))}
          </div>
        </div>

        {/* Speed / Interactions Select */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Rotation Speed</label>
            <div className="flex bg-slate-950 p-0.5 rounded-xl border border-slate-850">
              {[
                { id: 'normal', label: 'Normal' },
                { id: 'fast', label: 'Fast' },
                { id: 'paused', label: 'Pause' }
              ].map((sp) => (
                <button
                  key={sp.id}
                  id={`speed-${sp.id}`}
                  onClick={() => setSpeed(sp.id as any)}
                  className={`flex-1 py-1 rounded-lg text-[9px] font-extrabold transition-all ${
                    speed === sp.id
                      ? 'bg-amber-500 text-slate-950 font-black shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {sp.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Custom Actions</label>
            <div className="flex gap-2">
              <button
                id="add-sprinkles-btn"
                onClick={addSprinkles}
                className="flex-1 py-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 rounded-lg text-[9px] font-extrabold flex items-center justify-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-amber-500 animate-pulse" /> + Sprinkles
              </button>
              <button
                id="reset-cake-btn"
                onClick={resetCake}
                className="p-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-500 hover:text-white rounded-lg cursor-pointer"
                title="Reset Cake"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
