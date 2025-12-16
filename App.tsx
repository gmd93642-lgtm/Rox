import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Mic, Lock, ShieldAlert, Zap, Terminal, Eye, Volume2, Gamepad2, Settings, X, Key, Save } from 'lucide-react';
import { Message, MessageSender, AppMode, SystemMetrics } from './types';
import { MOCK_LOGS } from './constants';
import { generateRoxResponse } from './services/geminiService';
import ArcReactor from './components/ArcReactor';
import SystemMonitor from './components/SystemMonitor';
import TerminalLog from './components/TerminalLog';
import CameraView from './components/CameraView';
import GamingOverlay from './components/GamingOverlay';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [mode, setMode] = useState<AppMode>(AppMode.LOCKED);
  const [inputVal, setInputVal] = useState('');
  const [metrics, setMetrics] = useState<SystemMetrics>({ cpu: 12, ram: 34, temp: 42, network: 24, battery: 88 });
  const [history, setHistory] = useState<SystemMetrics[]>([]);
  const [captureTrigger, setCaptureTrigger] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [isGaming, setIsGaming] = useState(false);
  
  // API Key State
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [tempKey, setTempKey] = useState('');

  // Audio Refs
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis>(window.speechSynthesis);

  // Initial Load (Boot + API Key)
  useEffect(() => {
    // Load stored key
    const storedKey = localStorage.getItem('rox_api_key');
    if (storedKey) {
        setApiKey(storedKey);
        setTempKey(storedKey);
    }

    if (permissionGranted) {
        let delay = 0;
        MOCK_LOGS.forEach((log, index) => {
            setTimeout(() => {
                addLog(log, MessageSender.SYSTEM);
                if (index === MOCK_LOGS.length - 1) {
                    setMode(AppMode.IDLE);
                    speak("System initialized. Hi there, I'm ROX. Ready when you are.");
                }
            }, delay);
            delay += 800;
        });
    }
  }, [permissionGranted]);

  // System Metrics Simulation Loop
  useEffect(() => {
    if (mode === AppMode.LOCKED) return;

    const interval = setInterval(() => {
      setMetrics(prev => {
        if (isGaming) {
            return {
                cpu: Math.min(100, Math.max(80, prev.cpu + (Math.random() * 10 - 5))),
                ram: Math.min(95, Math.max(70, prev.ram + (Math.random() * 5 - 2))),
                temp: Math.min(95, Math.max(60, prev.temp + (Math.random() * 3 - 1))),
                network: Math.max(5, 20 + (Math.random() * 10 - 5)),
                battery: Math.max(0, prev.battery - 0.05)
            };
        }
        return {
          cpu: Math.min(100, Math.max(5, prev.cpu + (Math.random() * 20 - 10))),
          ram: Math.min(100, Math.max(10, prev.ram + (Math.random() * 10 - 5))),
          temp: Math.min(90, Math.max(30, prev.temp + (Math.random() * 4 - 2))),
          network: Math.floor(Math.random() * 100),
          battery: Math.max(0, prev.battery - 0.01)
        };
      });
      setHistory(h => [...h, metrics].slice(-20));
    }, 2000);
    return () => clearInterval(interval);
  }, [mode, isGaming]); 

  const addLog = (text: string, sender: MessageSender) => {
    setMessages(prev => [...prev, {
      id: Date.now().toString() + Math.random(),
      text,
      sender,
      timestamp: Date.now()
    }]);
  };

  const speak = (text: string) => {
    if (synthRef.current) {
      synthRef.current.cancel();

      let spokenText = text;
      if (text.includes("`")) {
          spokenText = text.split("`")[0] + " I've printed the code to your console.";
      }

      const utterance = new SpeechSynthesisUtterance(spokenText);
      utterance.rate = 1.0; 
      utterance.pitch = 1.0; 
      utterance.volume = 1;
      
      const voices = synthRef.current.getVoices();
      const preferredVoice = voices.find(v => 
        v.name.includes("Google US English") || 
        v.name.includes("Microsoft Zira") ||
        v.name.includes("Samantha")
      );
      if (preferredVoice) utterance.voice = preferredVoice;

      utterance.onstart = () => {
         if (mode !== AppMode.VISION) setMode(AppMode.SPEAKING);
      };
      utterance.onend = () => {
         if (mode === AppMode.SPEAKING) setMode(AppMode.IDLE);
      };
      
      synthRef.current.speak(utterance);
    }
  };

  const saveApiKey = () => {
      localStorage.setItem('rox_api_key', tempKey);
      setApiKey(tempKey);
      setShowSettings(false);
      addLog("NEURAL LINK ESTABLISHED. API KEY SAVED.", MessageSender.SYSTEM);
      speak("Key saved. Connected to cloud intelligence.");
  };

  const clearApiKey = () => {
      localStorage.removeItem('rox_api_key');
      setApiKey('');
      setTempKey('');
      setShowSettings(false);
      addLog("NEURAL LINK SEVERED. REVERTING TO LOCAL.", MessageSender.SYSTEM);
      speak("Key removed. Running on local core.");
  };

  const toggleGamingMode = () => {
      const newState = !isGaming;
      setIsGaming(newState);
      if (newState) {
          speak("Gaming mode is on. I've blocked notifications and boosted your framerates. Have fun!");
          addLog("Gaming Mode: ACTIVE", MessageSender.SYSTEM);
      } else {
          speak("Gaming mode off. Saving battery now.");
          addLog("Gaming Mode: DISABLED", MessageSender.SYSTEM);
      }
  };

  const handleCommand = async (text: string, imageBase64?: string) => {
    if (!text.trim() && !imageBase64) return;

    setMode(AppMode.PROCESSING);
    
    const lower = text.toLowerCase();
    
    if (lower.includes('vision') || lower.includes('camera') || lower.includes('see')) {
       setMode(AppMode.VISION);
       speak("Vision activated. Show me what you're looking at.");
       addLog(text, MessageSender.USER);
       return; 
    }
    if (lower.includes('gaming') || lower.includes('game mode')) {
        toggleGamingMode();
        setMode(AppMode.IDLE);
        return;
    }
    if (lower.includes('stop') || lower.includes('cancel')) {
       setMode(AppMode.IDLE);
       speak("Okay, stopping.");
       return;
    }

    addLog(text, MessageSender.USER);

    // AI Call - Passing the apiKey if it exists
    const response = await generateRoxResponse(text, imageBase64, apiKey);
    
    addLog(response, MessageSender.SYSTEM);
    speak(response);
    
    if (mode !== AppMode.VISION) {
      setMode(AppMode.IDLE);
    }
  };

  const startListening = () => {
    if (mode === AppMode.VISION) {
      setCaptureTrigger(true);
      return;
    }

    if (!('webkitSpeechRecognition' in window)) {
      alert("Browser does not support speech recognition. Use Text input.");
      return;
    }

    const Recognition = (window as any).webkitSpeechRecognition;
    const recognition = new Recognition();
    recognition.continuous = false;
    recognition.lang = 'en-US'; 
    recognition.interimResults = false;

    recognition.onstart = () => setMode(AppMode.LISTENING);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      handleCommand(transcript);
    };

    recognition.onerror = () => {
        setMode(AppMode.IDLE);
        speak("I didn't quite catch that.");
    };

    recognition.onend = () => {
        if (mode === AppMode.LISTENING) setMode(AppMode.IDLE);
    };

    recognition.start();
  };

  const handleImageCaptured = (base64: string) => {
    setCaptureTrigger(false);
    handleCommand("Analyze this image", base64);
  };

  const handleGrantPermissions = () => {
    setPermissionGranted(true);
    setMode(AppMode.IDLE);
  };

  if (!permissionGranted) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-900/20 via-black to-black"></div>
         <ShieldAlert size={80} className="text-red-500 mb-6 animate-pulse" />
         <h1 className="text-4xl md:text-6xl font-header font-bold text-white mb-4 tracking-tighter">ROX <span className="text-cyan-500">SYSTEM</span></h1>
         <p className="text-cyan-200/60 max-w-md font-mono mb-12 border-l-2 border-red-500 pl-4 text-left">
            SYSTEM ACCESS REQUIRED.<br/><br/>
            I need permission to use your microphone and camera to help you.
         </p>
         <button 
           onClick={handleGrantPermissions}
           className="px-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-black font-bold tracking-widest uppercase rounded-sm transition-all shadow-[0_0_20px_rgba(6,182,212,0.5)] flex items-center gap-3"
         >
           <Lock size={18} /> Grant Access
         </button>
      </div>
    );
  }

  return (
    <div className={`relative min-h-screen w-full text-cyan-50 flex flex-col items-center overflow-hidden transition-colors duration-1000 ${isGaming ? 'bg-red-950/20' : ''}`}>
      
      {/* Background Grid */}
      <div className={`absolute inset-0 bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)] -z-20 transition-all duration-1000 ${isGaming ? 'bg-[linear-gradient(rgba(220,38,38,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(220,38,38,0.1)_1px,transparent_1px)]' : 'bg-[linear-gradient(rgba(6,182,212,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.05)_1px,transparent_1px)]'}`}></div>

      {/* Camera Layer */}
      <CameraView 
        active={mode === AppMode.VISION} 
        triggerCapture={captureTrigger}
        onCapture={handleImageCaptured}
      />

      {/* Gaming Overlay */}
      {isGaming && <GamingOverlay />}

      {/* API Key Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
           <div className="w-full max-w-md bg-slate-900 border border-cyan-500/50 rounded-lg p-6 shadow-[0_0_50px_rgba(6,182,212,0.3)]">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2 text-cyan-400">
                    <Key size={20} />
                    <span className="font-header font-bold tracking-wider">NEURAL LINK CONFIG</span>
                </div>
                <button onClick={() => setShowSettings(false)} className="text-cyan-700 hover:text-cyan-400">
                    <X size={24} />
                </button>
              </div>
              
              <div className="mb-6">
                 <label className="block text-cyan-200/50 text-xs font-mono mb-2 uppercase tracking-widest">Enter Gemini API Key</label>
                 <input 
                   type="password" 
                   value={tempKey}
                   onChange={(e) => setTempKey(e.target.value)}
                   className="w-full bg-black/50 border border-cyan-800 rounded p-3 text-cyan-100 font-mono outline-none focus:border-cyan-400 transition-colors"
                   placeholder="AIzaSy..."
                 />
                 <p className="text-[10px] text-cyan-200/30 mt-2">
                    Add a key to enable advanced cloud intelligence. Leave empty to use local core.
                 </p>
              </div>

              <div className="flex gap-3">
                 <button 
                   onClick={saveApiKey}
                   className="flex-1 bg-cyan-700 hover:bg-cyan-600 text-white font-bold py-3 px-4 rounded flex items-center justify-center gap-2 transition-colors"
                 >
                    <Save size={16} /> SAVE LINK
                 </button>
                 {apiKey && (
                     <button 
                        onClick={clearApiKey}
                        className="px-4 py-3 bg-red-900/30 border border-red-800 text-red-400 rounded hover:bg-red-900/50 transition-colors"
                     >
                        CLEAR
                     </button>
                 )}
              </div>
           </div>
        </div>
      )}

      {/* Top Header */}
      <header className={`w-full p-4 flex justify-between items-center border-b backdrop-blur-md z-10 transition-colors duration-500 ${isGaming ? 'bg-red-900/10 border-red-900/30' : 'bg-black/40 border-cyan-900/30'}`}>
        <div className="flex items-center gap-2">
          <Terminal size={20} className={isGaming ? "text-red-500" : "text-cyan-400"} />
          <span className={`font-header font-bold tracking-widest text-lg ${isGaming ? "text-red-100" : ""}`}>ROX.APK</span>
        </div>
        
        {/* Header Controls */}
        <div className="flex items-center gap-2 md:gap-4">
             <button 
                onClick={toggleGamingMode}
                className={`flex items-center gap-2 px-3 py-1 rounded border text-xs font-bold font-mono transition-all ${isGaming ? 'bg-red-600 border-red-500 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]' : 'bg-transparent border-cyan-800 text-cyan-500 hover:bg-cyan-900/20'}`}
             >
                <Gamepad2 size={14} />
                <span className="hidden md:inline">{isGaming ? 'GAME MODE' : 'GAME MODE'}</span>
             </button>

             <button 
                onClick={() => setShowSettings(true)}
                className={`p-2 rounded border transition-all ${isGaming ? 'border-red-800 text-red-400 hover:bg-red-900/20' : 'border-cyan-800 text-cyan-500 hover:bg-cyan-900/20'}`}
             >
                 <Settings size={16} />
             </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-5xl flex flex-col items-center justify-between p-4 relative z-10">
        
        {/* System Charts */}
        <div className={isGaming ? "grayscale-[0.2] sepia-[0.5] hue-rotate-[320deg] transition-all duration-1000" : "transition-all duration-1000"}>
           <SystemMonitor metrics={metrics} history={history} />
        </div>

        {/* The Core */}
        <div className="flex-1 flex flex-col items-center justify-center min-h-[300px]">
           <ArcReactor mode={mode} />
        </div>

        {/* Logs */}
        <TerminalLog messages={messages} />

        {/* Controls */}
        <div className={`w-full max-w-2xl border rounded-lg p-2 flex items-center gap-2 backdrop-blur-md shadow-[0_0_30px_rgba(0,0,0,0.5)] transition-colors duration-500 ${isGaming ? 'bg-red-950/40 border-red-700/50' : 'bg-slate-900/80 border-cyan-700/50'}`}>
           <button 
             onClick={startListening}
             className={`p-4 rounded-full transition-all duration-300 ${
               mode === AppMode.LISTENING || mode === AppMode.VISION 
               ? 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.6)]' 
               : isGaming ? 'bg-red-900/50 text-red-200 hover:bg-red-800' : 'bg-cyan-900/50 text-cyan-400 hover:bg-cyan-800'
             }`}
           >
             {mode === AppMode.VISION ? <Eye size={24} /> : <Mic size={24} />}
           </button>
           
           <input 
             type="text" 
             value={inputVal}
             onChange={(e) => setInputVal(e.target.value)}
             onKeyDown={(e) => {
               if(e.key === 'Enter') {
                 handleCommand(inputVal);
                 setInputVal('');
               }
             }}
             placeholder="ENTER COMMAND..."
             className={`flex-1 bg-transparent border-none outline-none font-mono uppercase placeholder-opacity-50 ${isGaming ? 'text-red-100 placeholder-red-800/50' : 'text-cyan-100 placeholder-cyan-800/50'}`}
           />
           
           <button 
             onClick={() => { handleCommand(inputVal); setInputVal(''); }}
             className={`px-4 py-2 text-xs font-bold border rounded transition-colors ${isGaming ? 'bg-red-900/30 text-red-400 border-red-700/50 hover:bg-red-800/50' : 'bg-cyan-900/30 text-cyan-400 border-cyan-700/50 hover:bg-cyan-800/50'}`}
           >
             EXECUTE
           </button>
        </div>
      </main>

      {/* Decorative Corners */}
      <div className={`fixed top-20 left-4 w-16 h-16 border-l-2 border-t-2 rounded-tl-lg pointer-events-none transition-colors duration-500 ${isGaming ? 'border-red-800/50' : 'border-cyan-800/50'}`}></div>
      <div className={`fixed top-20 right-4 w-16 h-16 border-r-2 border-t-2 rounded-tr-lg pointer-events-none transition-colors duration-500 ${isGaming ? 'border-red-800/50' : 'border-cyan-800/50'}`}></div>
      <div className={`fixed bottom-4 left-4 w-16 h-16 border-l-2 border-b-2 rounded-bl-lg pointer-events-none transition-colors duration-500 ${isGaming ? 'border-red-800/50' : 'border-cyan-800/50'}`}></div>
      <div className={`fixed bottom-4 right-4 w-16 h-16 border-r-2 border-b-2 rounded-br-lg pointer-events-none transition-colors duration-500 ${isGaming ? 'border-red-800/50' : 'border-cyan-800/50'}`}></div>

    </div>
  );
};

export default App;