
import React, { useState, useEffect, useMemo } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Orders from './components/Orders';
import AuditLogs from './components/AuditLogs';
import Drivers from './components/Drivers';
import Management from './components/Admin/Management';
import Login from './components/Login';
import Landing from './components/Landing';
import { Lock, Truck, Package, CheckCircle2, Navigation, Power, Clock, CheckCircle } from 'lucide-react';
import { MOCK_DRIVERS, MOCK_ORDERS, MOCK_PHARMACIES, STATUS_COLORS } from './constants';
import { Driver, Order, OrderStatus, Pharmacy, UserRole } from './types';

// STABLE STORAGE KEYS - Do not change these to prevent data loss across updates
const STORAGE_KEYS = {
  PHARMACIES: 'maison_rx_registry_pharmacies_v3',
  DRIVERS: 'maison_rx_registry_drivers_v3',
  ORDERS: 'maison_rx_registry_orders_v3',
  AUTH: 'maison_rx_registry_auth_v3'
};

const App: React.FC = () => {
  const [view, setView] = useState<'LANDING' | 'LOGIN' | 'PORTAL'>('LANDING');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userRole, setUserRole] = useState<UserRole>('PHARMACY_USER');
  const [activePharmacy, setActivePharmacy] = useState<Pharmacy | null>(null);
  const [activeDriver, setActiveDriver] = useState<Driver | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize state from local storage or defaults
  const [pharmacies, setPharmacies] = useState<(Pharmacy & { passcode: string })[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PHARMACIES);
      return saved ? JSON.parse(saved) : MOCK_PHARMACIES;
    } catch (e) {
      return MOCK_PHARMACIES;
    }
  });

  const [drivers, setDrivers] = useState<Driver[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DRIVERS);
      return saved ? JSON.parse(saved) : MOCK_DRIVERS;
    } catch (e) {
      return MOCK_DRIVERS;
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
      return saved ? JSON.parse(saved) : MOCK_ORDERS;
    } catch (e) {
      return MOCK_ORDERS;
    }
  });

  // Effect to load auth session on mount
  useEffect(() => {
    const savedAuth = localStorage.getItem(STORAGE_KEYS.AUTH);
    if (savedAuth) {
      try {
        const auth = JSON.parse(savedAuth);
        setActivePharmacy(auth.pharmacy);
        setActiveDriver(auth.driver);
        setUserRole(auth.role);
        setView(auth.view);
        setActiveTab(auth.tab || (auth.role === 'DRIVER' ? 'my-tasks' : 'dashboard'));
      } catch (e) {
        localStorage.removeItem(STORAGE_KEYS.AUTH);
      }
    }
    setIsInitialized(true);
  }, []);

  // Sync state to local storage whenever it changes
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(STORAGE_KEYS.PHARMACIES, JSON.stringify(pharmacies));
    }
  }, [pharmacies, isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(STORAGE_KEYS.DRIVERS, JSON.stringify(drivers));
    }
  }, [drivers, isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    }
  }, [orders, isInitialized]);

  useEffect(() => {
    if (isInitialized && view === 'PORTAL') {
      localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify({
        pharmacy: activePharmacy,
        driver: activeDriver,
        role: userRole,
        view,
        tab: activeTab
      }));
    } else if (isInitialized && (view === 'LANDING' || view === 'LOGIN')) {
      localStorage.removeItem(STORAGE_KEYS.AUTH);
    }
  }, [view, activePharmacy, activeDriver, userRole, activeTab, isInitialized]);

  // Global simulation for moving drivers
  useEffect(() => {
    const interval = setInterval(() => {
      setDrivers(prevDrivers => 
        prevDrivers.map(d => {
          if (d.status === 'ACTIVE' || d.status === 'BUSY') {
            const latJitter = (Math.random() - 0.5) * 0.001;
            const lngJitter = (Math.random() - 0.5) * 0.001;
            return {
              ...d,
              lastSeen: new Date().toISOString(),
              currentLocation: d.currentLocation ? {
                ...d.currentLocation,
                lat: d.currentLocation.lat + latJitter,
                lng: d.currentLocation.lng + lngJitter
              } : d.currentLocation
            };
          }
          return d;
        })
      );
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = (payload: { pharmacy?: Pharmacy | null, driver?: Driver | null }, role: UserRole) => {
    setActivePharmacy(payload.pharmacy || null);
    setActiveDriver(payload.driver || null);
    setUserRole(role);
    setView('PORTAL');
    setActiveTab(role === 'DRIVER' ? 'my-tasks' : 'dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEYS.AUTH);
    setView('LANDING');
    setActivePharmacy(null);
    setActiveDriver(null);
    setUserRole('PHARMACY_USER');
    setActiveTab('dashboard');
  };

  const handleAssignOrder = (orderId: string, driverId: string) => {
    const timestamp = new Date().toISOString();
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status: OrderStatus.ASSIGNED, driverId } : order
    ));
    setDrivers(prev => prev.map(d => d.id === driverId ? { ...d, status: 'BUSY', lastSeen: timestamp } : d));
  };

  const handleUpdateOrderStatus = (orderId: string, status: OrderStatus) => {
    const timestamp = new Date().toISOString();
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status } : order
    ));
    if (status === OrderStatus.DELIVERED && activeDriver) {
      const remaining = orders.filter(o => o.driverId === activeDriver.id && o.id !== orderId && o.status !== OrderStatus.DELIVERED);
      if (remaining.length === 0) {
        handleUpdateDriverStatus('ACTIVE');
      }
    }
    // Update driver's last seen on order update too
    if (activeDriver) {
       setDrivers(prev => prev.map(d => d.id === activeDriver.id ? { ...d, lastSeen: timestamp } : d));
    }
  };

  const handleUpdateDriverStatus = (status: 'ACTIVE' | 'BUSY' | 'OFFLINE') => {
    if (!activeDriver) return;
    const timestamp = new Date().toISOString();
    setDrivers(prev => prev.map(d => d.id === activeDriver.id ? { ...d, status, lastSeen: timestamp } : d));
    setActiveDriver(prev => prev ? { ...prev, status, lastSeen: timestamp } : null);
  };

  // PHI DATA ISOLATION FILTERING
  const visibleOrders = useMemo(() => {
    if (userRole === 'SUPER_ADMIN') return orders;
    if (userRole === 'DRIVER') return orders.filter(o => o.driverId === activeDriver?.id);
    return orders.filter(o => o.pharmacyId === activePharmacy?.id);
  }, [orders, userRole, activeDriver, activePharmacy]);

  const visibleDrivers = drivers; // In this model, the fleet is shared but regional tracking is role-limited

  const renderContent = () => {
    if (userRole === 'DRIVER') {
      return (
        <div className="space-y-8 animate-in fade-in duration-500">
           <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6">
             <div>
               <h1 className="text-3xl font-bold text-slate-900">My Delivery Route</h1>
               <p className="text-slate-500 font-medium">Manage active tickets and update chain-of-custody status</p>
             </div>
             <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  {[
                    { id: 'ACTIVE', label: 'Available', icon: CheckCircle, color: 'text-green-600', activeBg: 'bg-white shadow-sm' },
                    { id: 'BUSY', label: 'On Break', icon: Clock, color: 'text-orange-500', activeBg: 'bg-white shadow-sm' },
                    { id: 'OFFLINE', label: 'Offline', icon: Power, color: 'text-slate-400', activeBg: 'bg-white shadow-sm' }
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => handleUpdateDriverStatus(s.id as any)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                        activeDriver?.status === s.id ? `${s.activeBg} ${s.color}` : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      <s.icon className="w-3.5 h-3.5" />
                      {s.label}
                    </button>
                  ))}
                </div>
                <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl border border-blue-100 flex items-center gap-2">
                  <Navigation className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">GPS Live</span>
                </div>
             </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {visibleOrders.length > 0 ? (
               visibleOrders.map(order => (
                 <div key={order.id} className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm hover:shadow-md transition-all">
                   <div className="flex justify-between items-start mb-6">
                      <div className="flex gap-4">
                        <div className={`p-4 rounded-2xl ${STATUS_COLORS[order.status].split(' ')[0]}`}>
                          <Package className={`w-6 h-6 ${STATUS_COLORS[order.status].split(' ')[1]}`} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Order Ticket</p>
                          <h4 className="font-black text-slate-900 text-xl">{order.id}</h4>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-widest ${STATUS_COLORS[order.status]}`}>
                        {order.status.replace('_', ' ')}
                      </span>
                   </div>

                   <div className="space-y-5 mb-8">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Patient Identity</p>
                        <p className="text-base font-bold text-slate-900">{order.patientName}</p>
                        <p className="text-sm text-slate-500 font-medium">{order.patientPhone}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Delivery Destination</p>
                        <p className="text-sm text-slate-700 font-medium leading-relaxed">{order.address}</p>
                      </div>
                      <div className="flex gap-3">
                        {order.requiresRefrigeration && (
                          <div className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black border border-blue-100 tracking-wider">REFRIGERATED</div>
                        )}
                        {order.isHighValue && (
                          <div className="px-2.5 py-1 bg-red-50 text-red-600 rounded-lg text-[10px] font-black border border-red-100 tracking-wider">HIGH VALUE</div>
                        )}
                      </div>
                   </div>

                   <div className="flex flex-wrap gap-3">
                      {order.status === OrderStatus.ASSIGNED && (
                        <button onClick={() => handleUpdateOrderStatus(order.id, OrderStatus.PICKED_UP)} className="flex-1 bg-slate-950 text-white py-4 rounded-2xl text-xs font-black hover:bg-slate-800 transition-all shadow-lg active:scale-95">Verify Pickup</button>
                      )}
                      {order.status === OrderStatus.PICKED_UP && (
                        <button onClick={() => handleUpdateOrderStatus(order.id, OrderStatus.OUT_FOR_DELIVERY)} className="flex-1 bg-blue-600 text-white py-4 rounded-2xl text-xs font-black hover:bg-blue-700 transition-all shadow-lg active:scale-95">Mark Out for Delivery</button>
                      )}
                      {order.status === OrderStatus.OUT_FOR_DELIVERY && (
                        <button onClick={() => handleUpdateOrderStatus(order.id, OrderStatus.DELIVERED)} className="flex-1 bg-green-600 text-white py-4 rounded-2xl text-xs font-black hover:bg-green-700 transition-all shadow-lg active:scale-95">Complete & Capture Pod</button>
                      )}
                      {order.status === OrderStatus.DELIVERED && (
                        <div className="w-full flex items-center justify-center gap-2 py-4 bg-green-50 text-green-700 rounded-2xl text-xs font-black border border-green-100 tracking-wider">
                          <CheckCircle2 className="w-4 h-4" />
                          SUCCESSFULLY DELIVERED
                        </div>
                      )}
                   </div>
                 </div>
               ))
             ) : (
               <div className="col-span-full py-24 bg-white border border-dashed border-slate-200 rounded-[3rem] flex flex-col items-center justify-center text-center">
                  <div className="p-6 bg-slate-50 rounded-full mb-6">
                    <Truck className="w-16 h-16 text-slate-200" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900">Queue is Clear</h3>
                  <p className="text-slate-500 mt-2 font-medium">Waiting for new pharmacy dispatches.</p>
               </div>
             )}
           </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            drivers={visibleDrivers} 
            orders={visibleOrders} 
            userRole={userRole} 
            activePharmacy={activePharmacy}
            onAssign={handleAssignOrder}
            setOrders={(o: any) => {
              setOrders(prev => {
                const currentFiltered = prev.filter(x => x.pharmacyId === activePharmacy?.id);
                const others = prev.filter(x => x.pharmacyId !== activePharmacy?.id);
                const nextData = typeof o === 'function' ? o(currentFiltered) : o;
                
                // Ensure pharmacyId is tagged on any new orders created by this pharmacy
                const taggedNext = nextData.map((order: any) => ({
                  ...order,
                  pharmacyId: order.pharmacyId || activePharmacy?.id
                }));
                
                return [...others, ...taggedNext];
              });
            }}
          />
        );
      case 'registry':
        return userRole === 'SUPER_ADMIN' ? (
          <Management pharmacies={pharmacies} setPharmacies={setPharmacies} drivers={drivers} setDrivers={setDrivers} />
        ) : null;
      case 'audit':
        return userRole === 'SUPER_ADMIN' ? <AuditLogs /> : null;
      case 'drivers':
        return userRole === 'SUPER_ADMIN' ? <Drivers drivers={drivers} setDrivers={setDrivers} /> : null;
      default:
        return (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Lock className="w-12 h-12 text-slate-200 mb-4" />
            <h2 className="text-2xl font-black text-slate-900">Terminal Restricted</h2>
            <p className="text-slate-500 mt-2">Authentication token does not permit access to this module.</p>
          </div>
        );
    }
  };

  if (!isInitialized) return null;

  // Render the appropriate view based on state
  if (view === 'LANDING') {
    return <Landing onStart={() => setView('LOGIN')} />;
  }

  if (view === 'LOGIN') {
    return (
      <Login 
        onLogin={handleLogin} 
        pharmacies={pharmacies} 
        drivers={drivers} 
      />
    );
  }

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      activePharmacy={activePharmacy}
      activeDriver={activeDriver}
      onLogout={handleLogout}
      role={userRole}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;
