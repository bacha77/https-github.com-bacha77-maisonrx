
import React, { useEffect, useRef, useState } from 'react';
import { 
  Users, 
  Package, 
  CheckCircle2, 
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Map as MapIcon,
  Upload,
  Plus,
  Zap,
  Clock,
  Navigation
} from 'lucide-react';
import { 
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import L from 'leaflet';
import { Driver, Order, UserRole, Pharmacy } from '../types';
import Orders from './Orders';

const chartData = [
  { name: '08:00', count: 5 },
  { name: '10:00', count: 18 },
  { name: '12:00', count: 42 },
  { name: '14:00', count: 35 },
  { name: '16:00', count: 52 },
  { name: '18:00', count: 21 },
];

const StatCard = ({ title, value, icon: Icon, color, trend }: any) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-2xl ${color} group-hover:scale-110 transition-transform`}>
        <Icon className="w-5 h-5" />
      </div>
      {trend !== undefined && (
        <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${trend > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
          {trend > 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">{title}</h3>
    <p className="text-2xl font-bold text-slate-900">{value}</p>
  </div>
);

interface DashboardProps {
  drivers: Driver[];
  orders: Order[];
  userRole: UserRole;
  activePharmacy?: Pharmacy | null;
  setOrders?: React.Dispatch<React.SetStateAction<Order[]>>;
  onAssign?: (orderId: string, driverId: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  drivers, 
  orders, 
  userRole, 
  activePharmacy, 
  setOrders, 
  onAssign 
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    mapRef.current = L.map(mapContainerRef.current, { 
      zoomControl: false,
      attributionControl: false 
    }).setView([39.7817, -89.6501], 12);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png').addTo(mapRef.current);
    return () => { if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    drivers.forEach(driver => {
      if (!driver.currentLocation) return;
      const { lat, lng } = driver.currentLocation;
      const statusColor = driver.status === 'ACTIVE' ? '#3b82f6' : driver.status === 'BUSY' ? '#f97316' : '#94a3b8';
      if (markersRef.current[driver.id]) {
        markersRef.current[driver.id].setLatLng([lat, lng]);
      } else {
        const marker = L.circleMarker([lat, lng], { radius: 6, fillColor: statusColor, color: '#fff', weight: 2, fillOpacity: 0.9 }).addTo(mapRef.current!);
        markersRef.current[driver.id] = marker;
      }
    });
  }, [drivers]);

  const isPharmacy = userRole === 'PHARMACY_USER';
  const deliveredCount = orders.filter(o => o.status === 'DELIVERED').length;
  const activeCount = orders.filter(o => o.status !== 'DELIVERED').length;

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-600 rounded-xl text-white">
              <Zap className="w-5 h-5" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              {isPharmacy ? 'Dispatch Command' : 'Network Intelligence'}
            </h1>
          </div>
          <p className="text-slate-500 font-medium ml-12">
            {isPharmacy ? `Monitoring secure flow for ${activePharmacy?.name}` : 'Real-time performance across the pharmacy network'}
          </p>
        </div>
        
        {isPharmacy && (
          <div className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
             <div className="flex flex-col text-right pr-4 border-r border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Today's Goal</span>
                <span className="text-sm font-bold text-slate-900">{deliveredCount} / 50 Orders</span>
             </div>
             <div className="w-32 bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: `${Math.min((deliveredCount / 50) * 100, 100)}%` }} />
             </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="In Transit" value={orders.filter(o => o.status === 'OUT_FOR_DELIVERY').length} icon={Navigation} color="bg-blue-50 text-blue-600" trend={12} />
        <StatCard title="Ready to Pick" value={orders.filter(o => o.status === 'PENDING').length} icon={Package} color="bg-amber-50 text-amber-600" trend={-5} />
        <StatCard title="Fulfilled Today" value={deliveredCount} icon={CheckCircle2} color="bg-green-50 text-green-600" trend={8} />
        <StatCard title="Fleet Efficiency" value="94%" icon={Users} color="bg-purple-50 text-purple-600" trend={2} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Main Operational Interface */}
          {isPharmacy && setOrders && onAssign && (
            <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
              <Orders 
                orders={orders} 
                setOrders={setOrders} 
                drivers={drivers} 
                onAssign={onAssign} 
                hideHeader={true}
                compact={true}
              />
            </div>
          )}
        </div>

        <div className="space-y-8">
          <div className="bg-slate-950 p-8 rounded-[2.5rem] text-white shadow-xl shadow-blue-900/10">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <MapIcon className="w-5 h-5 text-blue-400" />
              Fleet Positioning
            </h2>
            <div className="h-[280px] w-full rounded-3xl overflow-hidden relative border border-slate-800">
               <div ref={mapContainerRef} className="absolute inset-0 grayscale" />
               <div className="absolute inset-0 pointer-events-none bg-blue-500/10" />
            </div>
            <div className="mt-6 space-y-4">
               <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-bold uppercase tracking-widest">Available Fleet</span>
                  <span className="text-blue-400 font-mono font-bold">{drivers.filter(d => d.status === 'ACTIVE').length} Units</span>
               </div>
               <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-bold uppercase tracking-widest">Active Dispatch</span>
                  <span className="text-orange-400 font-mono font-bold">{drivers.filter(d => d.status === 'BUSY').length} Units</span>
               </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-2">Hourly Velocity</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-6">Dispatch Volume Trend</p>
            <div className="h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" hide />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
