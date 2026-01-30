
import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Truck, 
  ShieldCheck, 
  CreditCard, 
  Settings, 
  LogOut,
  Bell,
  Search,
  Lock,
  Building2,
  Users,
  Navigation
} from 'lucide-react';
import { APP_NAME, HIPAA_DISCLAIMER } from '../constants';
import { Pharmacy, UserRole, Driver } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activePharmacy: Pharmacy | null;
  activeDriver: Driver | null;
  onLogout: () => void;
  role: UserRole;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, activePharmacy, activeDriver, onLogout, role }) => {
  // Pharmacy users only get the Command Center (Dashboard)
  const pharmacyNav = [
    { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard },
  ];

  const adminNav = [
    { id: 'dashboard', label: 'Global Monitor', icon: LayoutDashboard },
    { id: 'registry', label: 'Network Registry', icon: Users },
    { id: 'drivers', label: 'Fleet Telemetry', icon: Truck },
    { id: 'audit', label: 'System Audits', icon: ShieldCheck },
    { id: 'settings', label: 'Global Config', icon: Settings },
  ];

  const driverNav = [
    { id: 'my-tasks', label: 'My Deliveries', icon: Navigation },
    { id: 'comms', label: 'Messages', icon: Bell },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const currentNav = role === 'SUPER_ADMIN' ? adminNav : role === 'DRIVER' ? driverNav : pharmacyNav;

  const getUserDisplayName = () => {
    if (role === 'SUPER_ADMIN') return 'Maison Admin';
    if (role === 'DRIVER') return activeDriver?.name || 'Driver';
    return activePharmacy?.name || 'Pharmacy';
  };

  const displayName = getUserDisplayName();

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <aside className="w-72 bg-slate-950 text-white flex flex-col transition-all duration-300">
        <div className="p-8 flex items-center gap-3">
          <div className="p-2.5 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/30">
            <Lock className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight">{APP_NAME}</span>
        </div>
        
        <div className="px-6 mb-8">
           <div className="p-4 bg-slate-900/50 rounded-3xl border border-slate-800/50">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  {role === 'SUPER_ADMIN' ? 'Admin Authority' : role === 'DRIVER' ? 'Driver Terminal' : 'Encrypted Terminal'}
                </span>
              </div>
              <p className="text-sm font-bold text-white truncate">
                {role === 'SUPER_ADMIN' ? 'MaisonRX Central' : role === 'DRIVER' ? activeDriver?.name : activePharmacy?.name}
              </p>
              <p className="text-[10px] text-slate-500 mt-1 font-mono uppercase">
                {role === 'SUPER_ADMIN' ? 'Root Node V4' : role === 'DRIVER' ? activeDriver?.id : activePharmacy?.id}
              </p>
           </div>
        </div>

        <nav className="flex-1 px-4 space-y-1.5">
          {currentNav.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-bold transition-all ${
                activeTab === item.id 
                  ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' 
                  : 'text-slate-500 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-900">
          <button 
            onClick={onLogout}
            className="flex items-center gap-3 w-full px-5 py-4 text-slate-500 hover:text-white transition-all hover:bg-red-500/10 rounded-2xl group"
          >
            <LogOut className="w-5 h-5 group-hover:text-red-400" />
            <span className="text-sm font-bold">Log Out</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative overflow-hidden">
        <header className="h-20 border-b border-slate-200 bg-white/80 backdrop-blur-md flex items-center justify-between px-10 z-20">
          <div className="flex items-center gap-6 flex-1">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Secure PHI Search..." 
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-[10px] font-bold border border-green-100 uppercase tracking-widest">
               <ShieldCheck className="w-3 h-3" />
               HIPAA Certified Area
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button 
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all font-bold text-xs z-30"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
            <div className="h-8 w-px bg-slate-200" />
            <button className="relative p-2.5 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
            <div className="h-10 w-px bg-slate-200" />
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-bold text-slate-900 truncate max-w-[120px]">
                  {displayName}
                </p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  {role === 'SUPER_ADMIN' ? 'Global Admin' : role === 'DRIVER' ? 'Fleet Pro' : 'Pharmacist'}
                </p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-blue-600 shadow-lg shadow-blue-500/30 flex items-center justify-center text-white font-bold text-sm">
                {displayName.split(' ').map(n => n[0]).join('')}
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10">
          {children}
        </div>

        <footer className="px-10 py-3 bg-white border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
            <span>{HIPAA_DISCLAIMER}</span>
            <div className="flex items-center gap-6">
               <span>TLS 1.3 Active</span>
               <span>Audit v4.22</span>
            </div>
        </footer>
      </main>
    </div>
  );
};

export default Layout;
