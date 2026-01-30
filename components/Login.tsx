
import React, { useState } from 'react';
import { Lock, ShieldCheck, AlertCircle, Building2, UserCog, Truck, Info } from 'lucide-react';
import { APP_NAME } from '../constants';
import { Pharmacy, Driver, UserRole } from '../types';

interface LoginProps {
  onLogin: (payload: { pharmacy?: Pharmacy | null, driver?: Driver | null }, role: UserRole) => void;
  pharmacies: (Pharmacy & { passcode: string })[];
  drivers: Driver[];
}

const Login: React.FC<LoginProps> = ({ onLogin, pharmacies, drivers }) => {
  const [role, setRole] = useState<UserRole>('PHARMACY_USER');
  const [identifier, setIdentifier] = useState('');
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Short delay to simulate secure handshake
    setTimeout(() => {
      const cleanId = identifier.trim();
      const cleanPass = passcode.trim();

      if (role === 'SUPER_ADMIN') {
        if (cleanId.toUpperCase() === 'ADMIN' && cleanPass === 'maison_secure_2024') {
          onLogin({ pharmacy: null }, 'SUPER_ADMIN');
        } else {
          setError('Invalid Admin Credentials.');
          setIsLoading(false);
        }
      } else if (role === 'PHARMACY_USER') {
        // Find pharmacy with case-insensitive ID matching
        const pharmacy = pharmacies.find(p => 
          p.id.toUpperCase() === cleanId.toUpperCase() && 
          p.passcode === cleanPass
        );
        if (pharmacy) {
          onLogin({ pharmacy }, 'PHARMACY_USER');
        } else {
          setError('Invalid Pharmacy ID or Secure Passcode.');
          setIsLoading(false);
        }
      } else if (role === 'DRIVER') {
        // Find driver with case-insensitive ID or Name matching
        const driver = drivers.find(d => 
          (d.id.toUpperCase() === cleanId.toUpperCase() || d.name.toLowerCase() === cleanId.toLowerCase()) && 
          d.passcode === cleanPass
        );
        if (driver) {
          onLogin({ driver }, 'DRIVER');
        } else {
          setError('Invalid Driver ID or Passcode.');
          setIsLoading(false);
        }
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-500/30">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{APP_NAME}</h1>
          <p className="text-slate-500 mt-2">Secure Logistics Portal</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden relative">
          {/* Demo Helper Toggle */}
          <button 
            type="button"
            onClick={() => setShowHint(!showHint)}
            className="absolute top-4 right-4 p-2 text-slate-300 hover:text-blue-500 transition-colors"
            title="View Demo Credentials"
          >
            <Info className="w-5 h-5" />
          </button>

          <div className="flex bg-slate-50 p-1 m-4 rounded-xl border border-slate-200">
             <button 
               onClick={() => setRole('PHARMACY_USER')}
               className={`flex-1 py-2.5 rounded-lg text-[10px] font-bold uppercase transition-all ${role === 'PHARMACY_USER' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
             >
               Pharmacy
             </button>
             <button 
               onClick={() => setRole('DRIVER')}
               className={`flex-1 py-2.5 rounded-lg text-[10px] font-bold uppercase transition-all ${role === 'DRIVER' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
             >
               Driver
             </button>
             <button 
               onClick={() => setRole('SUPER_ADMIN')}
               className={`flex-1 py-2.5 rounded-lg text-[10px] font-bold uppercase transition-all ${role === 'SUPER_ADMIN' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
             >
               Global Admin
             </button>
          </div>

          <div className="p-8 pt-2">
            {showHint && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-2xl animate-in fade-in slide-in-from-top-2">
                <p className="text-[10px] font-bold text-blue-600 uppercase mb-2 tracking-widest">Demo Credentials</p>
                <div className="space-y-1 text-xs text-blue-800">
                  {role === 'SUPER_ADMIN' ? (
                    <p>User: <code className="font-bold">ADMIN</code> / Pass: <code className="font-bold">maison_secure_2024</code></p>
                  ) : role === 'DRIVER' ? (
                    <p>ID: <code className="font-bold">D-101</code> / Pass: <code className="font-bold">driver101</code></p>
                  ) : (
                    <p>ID: <code className="font-bold">PH-771</code> / Pass: <code className="font-bold">admin123</code></p>
                  )}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                  {role === 'SUPER_ADMIN' ? 'Admin Username' : role === 'DRIVER' ? 'Driver ID or Name' : 'Pharmacy Terminal ID'}
                </label>
                <div className="relative">
                  {role === 'SUPER_ADMIN' ? <UserCog className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" /> : 
                   role === 'DRIVER' ? <Truck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" /> :
                   <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />}
                  <input 
                    required
                    type="text" 
                    autoComplete="username"
                    placeholder={role === 'SUPER_ADMIN' ? "Admin Account" : role === 'DRIVER' ? "e.g. D-101" : "e.g. PH-771"}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Secure Passcode</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    required
                    type="password" 
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-xl border border-red-100 text-xs font-medium animate-in slide-in-from-top-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {isLoading ? 'Verifying Identity...' : 'Access Secured Area'}
              </button>
            </form>
          </div>
        </div>
        
        <p className="mt-8 text-center text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
          Certified HIPAA Compliant Environment
        </p>
      </div>
    </div>
  );
};

export default Login;
