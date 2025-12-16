import React, { useState, useEffect } from 'react';
import { Crosshair, Zap, BellOff, Activity } from 'lucide-react';

const GamingOverlay: React.FC = () => {
  const [fps, setFps] = useState(144);
  const [ping, setPing] = useState(20);

  useEffect(() => {
    const interval = setInterval(() => {
      setFps(prev => Math.random() > 0.7 ? 140 + Math.floor(Math.random() * 5) : 144);
      setPing(prev => 18 + Math.floor(Math.random() * 8));
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed top-24 right-4 z-40 flex flex-col gap-2 pointer-events-none animate-in fade-in slide-in-from-right duration-500">
      <div className="bg-gradient-to-l from-red-900/90 to-black/80 border-r-4 border-red-500 text-white p-4 rounded-l-lg shadow-[0_0_30px_rgba(220,38,38,0.4)] backdrop-blur-md w-56 clip-path-polygon">
        <div className="flex justify-between items-center border-b border-white/20 pb-2 mb-3">
           <div className="flex items-center gap-2">
             <Activity size={16} className="text-red-500" />
             <span className="font-header text-xs tracking-widest text-red-100 font-bold">GAME TURBO</span>
           </div>
           <BellOff size={16} className="text-red-400 animate-pulse" />
        </div>
        
        <div className="grid grid-cols-2 gap-y-3 font-mono text-sm">
           <div className="flex flex-col">
              <span className="text-[10px] text-white/50">FPS</span>
              <span className="font-bold text-xl text-yellow-400">{fps}</span>
           </div>
           <div className="flex flex-col text-right">
              <span className="text-[10px] text-white/50">PING</span>
              <span className="font-bold text-xl text-emerald-400">{ping}ms</span>
           </div>
           <div className="flex flex-col">
              <span className="text-[10px] text-white/50">GPU</span>
              <span className="font-bold text-xl text-red-400">99%</span>
           </div>
            <div className="flex flex-col text-right">
              <span className="text-[10px] text-white/50">TEMP</span>
              <span className="font-bold text-xl text-orange-400">42°C</span>
           </div>
        </div>
      </div>
      
      <div className="self-end mr-2 flex items-center gap-2 bg-black/60 px-2 py-1 rounded text-[10px] text-red-400 border border-red-900/50 font-mono">
         <Crosshair size={12} />
         <span>PRIORITY MODE: ACTIVE</span>
      </div>
    </div>
  );
};

export default GamingOverlay;