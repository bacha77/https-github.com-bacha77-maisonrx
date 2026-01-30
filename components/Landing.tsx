
import React, { useState, useEffect } from 'react';
import { ShieldCheck, Truck, Zap, Lock, ArrowRight, Building2, ChevronRight, Fingerprint, Cpu, Globe } from 'lucide-react';

interface LandingProps {
  onStart: () => void;
}

const Landing: React.FC<LandingProps> = ({ onStart }) => {
  const [terminalData, setTerminalData] = useState<string[]>([]);

  // Simulate scrolling encrypted data for the terminal
  useEffect(() => {
    const dataChunks = [
      "AUTH_REQ: 0x82A1...",
      "CIPHER: AES-256-GCM",
      "NODE: PHARM_SECURE_7",
      "SSL: TLS_1.3_ACTIVE",
      "HANDSHAKE: SUCCESS",
      "AUDIT: LOGGING_ENABLED",
      "PHI_SHIELD: NOMINAL"
    ];
    
    const interval = setInterval(() => {
      setTerminalData(prev => {
        const next = [...prev, dataChunks[Math.floor(Math.random() * dataChunks.length)]];
        if (next.length > 5) return next.slice(1);
        return next;
      });
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-100">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-[120px] opacity-60" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-50 rounded-full blur-[120px] opacity-60" />
      </div>

      {/* Navigation */}
      <nav className="relative flex items-center justify-between px-8 py-8 max-w-7xl mx-auto z-20">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-600 rounded-2xl shadow-xl shadow-blue-500/30">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black tracking-tight text-slate-900 leading-none">MaisonRX</span>
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1">Health Logistics</span>
          </div>
        </div>
        <div className="hidden lg:flex items-center gap-10 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
          <a href="#" className="hover:text-blue-600 transition-colors">Network</a>
          <a href="#" className="hover:text-blue-600 transition-colors">Compliance</a>
          <a href="#" className="hover:text-blue-600 transition-colors">Safety</a>
        </div>
        <button 
          onClick={onStart}
          className="px-7 py-3 bg-slate-950 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-slate-900/10 flex items-center gap-2"
        >
          Access Portal <ChevronRight className="w-4 h-4" />
        </button>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-12 pb-32 px-8 z-10">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-10 animate-in slide-in-from-left duration-700">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-blue-50 text-blue-700 rounded-full border border-blue-100 text-[10px] font-black uppercase tracking-[0.2em]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
              </span>
              Next-Gen Pharmacy Logistics
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-slate-900 leading-[0.9] lg:max-w-xl">
              Secure Rx <span className="text-blue-600">Delivery</span> Redefined.
            </h1>
            
            <p className="text-xl text-slate-500 max-w-lg leading-relaxed font-medium">
              A military-grade delivery infrastructure for pharmacies. Seamless HIPAA compliance, AI-auditing, and real-time chain of custody.
            </p>
            
            <div className="flex flex-wrap gap-5">
              <button 
                onClick={onStart}
                className="px-10 py-5 bg-blue-600 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-blue-700 shadow-2xl shadow-blue-600/30 transition-all flex items-center gap-4 group active:scale-95"
              >
                Launch Terminal 
                <div className="bg-white/20 p-1 rounded-full group-hover:translate-x-1 transition-transform">
                  <ArrowRight className="w-5 h-5" />
                </div>
              </button>
              <button className="px-10 py-5 bg-white border-2 border-slate-100 text-slate-900 rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-slate-50 hover:border-slate-200 transition-all">
                Registry Specs
              </button>
            </div>

            <div className="flex items-center gap-12 pt-10 border-t border-slate-100">
               <div className="flex flex-col">
                  <span className="text-2xl font-black text-slate-900">100%</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Audit Accuracy</span>
               </div>
               <div className="flex flex-col">
                  <span className="text-2xl font-black text-slate-900">256-bit</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">AES Encryption</span>
               </div>
               <div className="flex flex-col">
                  <span className="text-2xl font-black text-slate-900">0.8s</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sync Latency</span>
               </div>
            </div>
          </div>

          <div className="relative group animate-in zoom-in duration-1000">
            {/* The interactive "Terminal Secure" container */}
            <div 
              onClick={onStart}
              className="relative bg-slate-950 rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] p-2 overflow-hidden border-[12px] border-slate-900 aspect-square flex flex-col items-center justify-center cursor-pointer transform hover:scale-[1.02] transition-all duration-500"
            >
               {/* Terminal Interior Decor */}
               <div className="absolute inset-0 opacity-10">
                 <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
               </div>
               
               {/* Pulse Scanner Effect */}
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full border border-blue-500/20 rounded-full animate-ping pointer-events-none" />
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 border border-blue-500/10 rounded-full animate-pulse pointer-events-none" />
               
               <div className="z-10 text-center space-y-6">
                  <div className="relative w-24 h-24 mx-auto">
                    <div className="absolute inset-0 bg-blue-600 blur-2xl opacity-40 animate-pulse" />
                    <div className="relative w-24 h-24 bg-blue-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-blue-500/50">
                      <ShieldCheck className="w-12 h-12 text-white" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-white font-black text-2xl uppercase tracking-[0.2em]">Secure Node</p>
                    <div className="flex items-center justify-center gap-3">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                      <p className="text-blue-400 text-xs font-mono font-bold tracking-widest uppercase">System Online</p>
                    </div>
                  </div>

                  {/* Encrypted Data Feed */}
                  <div className="w-48 bg-black/40 border border-white/5 rounded-xl p-4 font-mono text-[9px] text-left space-y-1">
                    {terminalData.map((line, idx) => (
                      <p key={idx} className="text-green-500/80 overflow-hidden whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-300">
                        {line}
                      </p>
                    ))}
                    <p className="text-green-400 animate-pulse">_</p>
                  </div>
               </div>

               {/* Bottom Interaction Hint */}
               <div className="absolute bottom-8 text-slate-500 text-[9px] font-black uppercase tracking-[0.3em] flex items-center gap-3">
                  <Fingerprint className="w-4 h-4 text-blue-600" />
                  Tap to Authorize
               </div>

               {/* Floating Peripheral Icons */}
               <div className="absolute top-10 left-10 p-3 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
                 <Cpu className="w-5 h-5 text-blue-500" />
               </div>
               <div className="absolute bottom-10 right-10 p-3 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
                 <Globe className="w-5 h-5 text-indigo-400" />
               </div>
            </div>

            {/* Floating Live Stat Card */}
            <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-[2.5rem] shadow-2xl border border-slate-100 max-w-xs animate-in slide-in-from-bottom-10 duration-1000 delay-300">
               <div className="flex items-center gap-4 mb-4">
                 <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                   <Truck className="w-6 h-6" />
                 </div>
                 <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Fleet</p>
                   <p className="text-sm font-black text-slate-900">Real-time Handoff</p>
                 </div>
               </div>
               <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-500">Node Sync</p>
                    <p className="text-xs font-black text-green-600">ENCRYPTED</p>
                  </div>
                  <div className="h-8 w-px bg-slate-100 mx-4" />
                  <div className="flex -space-x-3">
                    {[1,2,3].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400">
                        {String.fromCharCode(64 + i)}
                      </div>
                    ))}
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Proof Section */}
      <section className="py-24 bg-white border-y border-slate-100 px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 text-center items-center opacity-40">
            <div className="text-2xl font-black italic text-slate-400">PharmaGuard</div>
            <div className="text-2xl font-black italic text-slate-400">HealthNet</div>
            <div className="text-2xl font-black italic text-slate-400">SafeScript</div>
            <div className="text-2xl font-black italic text-slate-400">DirectCare</div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 bg-slate-50/50 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-20 space-y-6">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-none">Security by Design.</h2>
            <p className="text-lg text-slate-500 font-medium">MaisonRX provides a holistic security framework for clinical-grade logistics.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'Validated Registry', desc: 'Secure terminal IDs and dynamic passcodes ensure only authorized pharmacists can manifest tickets.', icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50' },
              { title: 'POD Capture', desc: 'Proof of Delivery with biometric-style verification and precise coordinate timestamping.', icon: ShieldCheck, color: 'text-green-600', bg: 'bg-green-50' },
              { title: 'Smart Routing', desc: 'Encrypted telemetry stream allows real-time regional fleet monitoring and cold-chain oversight.', icon: Truck, color: 'text-indigo-600', bg: 'bg-indigo-50' }
            ].map((f, i) => (
              <div key={i} className="bg-white p-10 rounded-[3rem] border border-slate-200/50 hover:shadow-2xl hover:scale-[1.02] transition-all group cursor-default">
                <div className={`w-16 h-16 ${f.bg} ${f.color} rounded-[1.5rem] flex items-center justify-center mb-8 group-hover:bg-slate-900 group-hover:text-white transition-colors`}>
                  <f.icon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-4">{f.title}</h3>
                <p className="text-slate-500 leading-relaxed font-medium">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-8 bg-white text-center border-t border-slate-50 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">
            MaisonRX Hub © 2024 • HIPAA Certified Environment • ISO 27001 Compliant
          </p>
          <div className="flex gap-8 text-[10px] text-slate-400 font-black uppercase tracking-widest">
            <a href="#" className="hover:text-blue-600">Privacy</a>
            <a href="#" className="hover:text-blue-600">Terms</a>
            <a href="#" className="hover:text-blue-600">Security</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
