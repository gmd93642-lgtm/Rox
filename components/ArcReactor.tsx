import React from 'react';
import { AppMode } from '../types';

interface ArcReactorProps {
  mode: AppMode;
}

const ArcReactor: React.FC<ArcReactorProps> = ({ mode }) => {
  const getColor = () => {
    switch (mode) {
      case AppMode.LISTENING: return 'border-red-500 shadow-red-500/50';
      case AppMode.PROCESSING: return 'border-yellow-400 shadow-yellow-400/50';
      case AppMode.SPEAKING: return 'border-cyan-400 shadow-cyan-400/80';
      case AppMode.VISION: return 'border-purple-500 shadow-purple-500/50';
      default: return 'border-cyan-800 shadow-cyan-900/20';
    }
  };

  const getInnerColor = () => {
    switch (mode) {
      case AppMode.LISTENING: return 'bg-red-500';
      case AppMode.PROCESSING: return 'bg-yellow-400';
      case AppMode.SPEAKING: return 'bg-cyan-400';
      case AppMode.VISION: return 'bg-purple-500';
      default: return 'bg-cyan-900';
    }
  };

  return (
    <div className="relative flex items-center justify-center w-64 h-64 mb-8">
      {/* Outer Ring - Static */}
      <div className={`absolute w-full h-full rounded-full border-2 border-dashed opacity-30 animate-[spin_10s_linear_infinite] ${getColor().split(' ')[0]}`}></div>
      
      {/* Middle Ring - Faster Spin */}
      <div className={`absolute w-48 h-48 rounded-full border-4 border-t-transparent border-l-transparent animate-[spin_3s_linear_infinite] ${getColor()}`}></div>
      
      {/* Inner Ring - Reverse Spin */}
      <div className={`absolute w-32 h-32 rounded-full border-2 border-b-transparent border-r-transparent animate-[spin_5s_linear_infinite_reverse] opacity-70 ${getColor().split(' ')[0]}`}></div>

      {/* Core */}
      <div className={`relative w-16 h-16 rounded-full shadow-[0_0_50px_10px_currentColor] transition-all duration-300 ${getInnerColor()} ${mode === AppMode.SPEAKING ? 'animate-pulse scale-110' : ''}`}>
        <div className="absolute inset-0 bg-white/30 rounded-full blur-sm"></div>
      </div>
      
      {/* Status Text Overlay */}
      <div className="absolute -bottom-12 font-header text-sm tracking-[0.3em] uppercase opacity-80 text-cyan-500">
        {mode === AppMode.IDLE ? 'System Online' : mode}
      </div>
    </div>
  );
};

export default ArcReactor;