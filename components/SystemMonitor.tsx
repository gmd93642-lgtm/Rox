import React from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { SystemMetrics } from '../types';
import { Cpu, MemoryStick, Thermometer, Wifi, Battery } from 'lucide-react';

interface SystemMonitorProps {
  metrics: SystemMetrics;
  history: SystemMetrics[];
}

const SystemMonitor: React.FC<SystemMonitorProps> = ({ metrics, history }) => {
  return (
    <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
      {/* CPU Panel */}
      <div className="bg-slate-900/50 border border-cyan-900/50 p-3 rounded-lg backdrop-blur-sm">
        <div className="flex items-center justify-between mb-2 text-cyan-400">
          <span className="flex items-center gap-2 text-xs font-bold"><Cpu size={14} /> CPU LOAD</span>
          <span className="text-lg font-header">{metrics.cpu}%</span>
        </div>
        <div className="h-16 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history}>
              <defs>
                <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="cpu" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorCpu)" isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* RAM Panel */}
      <div className="bg-slate-900/50 border border-cyan-900/50 p-3 rounded-lg backdrop-blur-sm">
        <div className="flex items-center justify-between mb-2 text-purple-400">
          <span className="flex items-center gap-2 text-xs font-bold"><MemoryStick size={14} /> RAM USAGE</span>
          <span className="text-lg font-header">{metrics.ram}%</span>
        </div>
        <div className="h-16 w-full">
           <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history}>
              <defs>
                <linearGradient id="colorRam" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="ram" stroke="#a855f7" strokeWidth={2} fillOpacity={1} fill="url(#colorRam)" isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

       {/* Temp & Network Panel (Text based) */}
      <div className="bg-slate-900/50 border border-cyan-900/50 p-3 rounded-lg backdrop-blur-sm flex flex-col justify-between">
         <div className="flex items-center justify-between text-red-400 mb-2">
            <span className="flex items-center gap-2 text-xs font-bold"><Thermometer size={14} /> CORE TEMP</span>
            <span className="font-header">{metrics.temp}°C</span>
         </div>
         <div className="w-full bg-slate-800 h-1 mt-1">
            <div className="bg-red-500 h-1 transition-all duration-500" style={{ width: `${(metrics.temp / 90) * 100}%` }}></div>
         </div>

         <div className="flex items-center justify-between text-emerald-400 mt-3">
            <span className="flex items-center gap-2 text-xs font-bold"><Wifi size={14} /> NET LINK</span>
            <span className="font-header">{metrics.network} MS</span>
         </div>
      </div>

      {/* Battery Panel */}
      <div className="bg-slate-900/50 border border-cyan-900/50 p-3 rounded-lg backdrop-blur-sm flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-cyan-500/5 animate-pulse"></div>
        <div className="text-center z-10">
          <div className="flex justify-center mb-1 text-cyan-300">
             <Battery size={24} />
          </div>
          <div className="text-2xl font-header font-bold text-white">{metrics.battery}%</div>
          <div className="text-[10px] text-cyan-500 uppercase tracking-widest">PWR LEVEL</div>
        </div>
      </div>

    </div>
  );
};

export default SystemMonitor;