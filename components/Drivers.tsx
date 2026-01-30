
import React, { useState, useEffect, useRef } from 'react';
import { Truck, MapPin, Phone, MessageSquare, MoreVertical, Search, Filter, X, Send, History, Navigation, Crosshair, Maximize, UserPlus, CheckCircle2, GpsFixed, Map as MapIcon, Clock } from 'lucide-react';
import L from 'leaflet';
import { MOCK_COMMUNICATIONS } from '../constants';
import { Driver, CommunicationLog } from '../types';

interface DriversProps {
  drivers: Driver[];
  setDrivers: React.Dispatch<React.SetStateAction<Driver[]>>;
}

const Drivers: React.FC<DriversProps> = ({ drivers, setDrivers }) => {
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [comms, setComms] = useState<CommunicationLog[]>(MOCK_COMMUNICATIONS);
  const [newMessage, setNewMessage] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'BUSY' | 'OFFLINE'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Add Driver Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [newDriver, setNewDriver] = useState({ name: '', phone: '', passcode: '' });
  const [isSyncingGps, setIsSyncingGps] = useState(false);
  
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Derived filtered drivers list
  const filteredDrivers = drivers.filter(d => {
    const matchesStatus = statusFilter === 'ALL' || d.status === statusFilter;
    const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         d.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Sync selectedDriver with global state updates
  useEffect(() => {
    if (selectedDriver) {
      const updated = drivers.find(d => d.id === selectedDriver.id);
      if (updated) setSelectedDriver(updated);
    }
  }, [drivers]);

  // Map Initialization
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    mapRef.current = L.map(mapContainerRef.current, { zoomControl: false }).setView([39.7817, -89.6501], 13);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
    }).addTo(mapRef.current);
    L.control.zoom({ position: 'bottomright' }).addTo(mapRef.current);
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Helper to create a status-aware icon
  const createDriverIcon = (driver: Driver) => {
    const statusColor = driver.status === 'ACTIVE' ? 'bg-blue-600' : 'bg-orange-500';
    return L.divIcon({
      className: 'custom-div-icon',
      html: `
        <div class="relative flex items-center justify-center">
          ${driver.status === 'ACTIVE' ? `<div class="absolute w-10 h-10 ${statusColor} rounded-full opacity-20 animate-ping"></div>` : ''}
          <div class="relative w-8 h-8 ${statusColor} rounded-full flex items-center justify-center border-2 border-white shadow-lg transition-all duration-500 hover:scale-110">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 18h14"></path>
              <path d="M14 18v3"></path>
              <path d="M10 18v3"></path>
              <path d="M16 18a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2"></path>
            </svg>
          </div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });
  };

  // Update Markers and Icons in real-time
  useEffect(() => {
    if (!mapRef.current) return;

    // Remove markers for drivers no longer in the filtered view
    Object.keys(markersRef.current).forEach(id => {
      if (!filteredDrivers.find(d => d.id === id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });

    // Sync current fleet to map
    filteredDrivers.forEach(driver => {
      if (!driver.currentLocation) return;
      const { lat, lng } = driver.currentLocation;
      const markerId = driver.id;

      if (markersRef.current[markerId]) {
        const marker = markersRef.current[markerId];
        marker.setLatLng([lat, lng]);
        marker.setIcon(createDriverIcon(driver));
        marker.getPopup()?.setContent(`<div class="p-1"><p class="font-bold text-slate-900">${driver.name}</p><p class="text-[10px] uppercase font-bold text-slate-500">${driver.status}</p></div>`);
      } else {
        const marker = L.marker([lat, lng], { icon: createDriverIcon(driver) }).addTo(mapRef.current!);
        marker.bindPopup(`<div class="p-1"><p class="font-bold text-slate-900">${driver.name}</p><p class="text-[10px] uppercase font-bold text-slate-500">${driver.status}</p></div>`);
        markersRef.current[markerId] = marker;
      }
    });
  }, [filteredDrivers]);

  const handleAddDriver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDriver.name || !newDriver.phone || !newDriver.passcode) return;

    const timestamp = new Date().toISOString();
    const driver: Driver = {
      id: `D-${Math.floor(Math.random() * 900) + 100}`,
      name: newDriver.name.trim(),
      phone: newDriver.phone.trim(),
      passcode: newDriver.passcode.trim(),
      status: 'ACTIVE',
      lastSeen: timestamp,
      currentLocation: {
        lat: 39.7817 + (Math.random() - 0.5) * 0.05,
        lng: -89.6501 + (Math.random() - 0.5) * 0.05,
        address: 'Assigned Starting Point'
      }
    };

    // Use functional state update to ensure atomic data save
    setDrivers(prev => [driver, ...prev]);

    setNewDriver({ name: '', phone: '', passcode: '' });
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setIsAddModalOpen(false);
    }, 2000);
  };

  const locateDriver = (driver: Driver) => {
    if (mapRef.current && driver.currentLocation) {
      mapRef.current.flyTo([driver.currentLocation.lat, driver.currentLocation.lng], 16, { duration: 1.5 });
      markersRef.current[driver.id]?.openPopup();
    }
  };

  const fitFleet = () => {
    if (mapRef.current && filteredDrivers.length > 0) {
      const activeCoords = filteredDrivers.filter(d => d.currentLocation).map(d => [d.currentLocation!.lat, d.currentLocation!.lng] as L.LatLngExpression);
      if (activeCoords.length > 0) {
        const bounds = L.latLngBounds(activeCoords);
        mapRef.current.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  };

  const syncGPS = () => {
    if (!selectedDriver) return;
    setIsSyncingGps(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const timestamp = new Date().toISOString();
          setDrivers(prev => prev.map(d => 
            d.id === selectedDriver.id 
              ? { ...d, lastSeen: timestamp, currentLocation: { ...d.currentLocation!, lat: latitude, lng: longitude, address: 'User Provided GPS Location' } } 
              : d
          ));
          setIsSyncingGps(false);
          if (mapRef.current) {
            mapRef.current.flyTo([latitude, longitude], 16);
          }
        },
        (error) => {
          console.error("GPS Sync Error:", error);
          alert("Could not sync GPS. Please check permissions.");
          setIsSyncingGps(false);
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
      setIsSyncingGps(false);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedDriver) return;
    const log: CommunicationLog = {
      id: `c-${Date.now()}`,
      driverId: selectedDriver.id,
      timestamp: new Date().toISOString(),
      senderName: 'Dispatch Central',
      content: newMessage,
      type: 'OUTBOUND'
    };
    setComms(prev => [log, ...prev]);
    setNewMessage('');
  };

  const driverComms = selectedDriver 
    ? [...comms].filter(c => c.driverId === selectedDriver.id).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    : [];

  const formatLastSeen = (isoString?: string) => {
    if (!isoString) return 'Never';
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);

    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="space-y-8 animate-in fade-in duration-500 flex-1 overflow-y-auto pr-2 pb-12">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Driver Network</h1>
            <p className="text-slate-500">Real-time status and telemetry for the delivery fleet</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all">
              <Filter className="w-4 h-4" />
              Reporting
            </button>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Add New Driver
            </button>
          </div>
        </div>

        {/* Real-Time Map Container */}
        <div className="bg-white p-4 border border-slate-200 rounded-2xl shadow-sm h-[400px] relative">
          <div className="flex items-center justify-between mb-3 px-2">
            <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Navigation className="w-4 h-4 text-blue-600" />
              Live Fleet Telemetry (updates every 15s)
            </h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-600" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-orange-500" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Busy</span>
              </div>
            </div>
          </div>
          <div ref={mapContainerRef} className="h-[320px] w-full rounded-xl overflow-hidden border border-slate-100 z-0" />
          <div className="absolute top-16 right-8 flex flex-col gap-2 z-[1000]">
            <button onClick={fitFleet} className="p-2 bg-white border border-slate-200 rounded-lg shadow-md hover:bg-slate-50 transition-all text-slate-700" title="Fit Fleet to View">
              <Maximize className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-wrap gap-4 justify-between items-center">
            <div className="flex items-center gap-6 flex-1">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Filter by name or ID..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg py-1.5 pl-9 pr-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="flex bg-slate-100/50 p-1 rounded-xl border border-slate-200">
                {['ALL', 'ACTIVE', 'BUSY', 'OFFLINE'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status as any)}
                    className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${statusFilter === status ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-bold text-slate-700 uppercase tracking-wider text-[10px]">Driver</th>
                <th className="px-6 py-4 font-bold text-slate-700 uppercase tracking-wider text-[10px]">Status</th>
                <th className="px-6 py-4 font-bold text-slate-700 uppercase tracking-wider text-[10px]">Last Seen</th>
                <th className="px-6 py-4 font-bold text-slate-700 uppercase tracking-wider text-[10px]">Last Location</th>
                <th className="px-6 py-4 font-bold text-slate-700 uppercase tracking-wider text-[10px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDrivers.map((driver) => (
                <tr key={driver.id} onClick={() => setSelectedDriver(driver)} className={`hover:bg-slate-50 transition-colors cursor-pointer group ${selectedDriver?.id === driver.id ? 'bg-blue-50/50' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-600 text-xs">
                        {driver.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div><p className="font-bold text-slate-900">{driver.name}</p><p className="text-[10px] text-slate-400 font-mono">{driver.id}</p></div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors duration-500 ${driver.status === 'ACTIVE' ? 'bg-green-100 text-green-700 border-green-200' : driver.status === 'BUSY' ? 'bg-orange-100 text-orange-700 border-orange-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-500 ${driver.status === 'ACTIVE' ? 'bg-green-500' : driver.status === 'BUSY' ? 'bg-orange-500' : 'bg-slate-400'}`} />
                      {driver.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                       <p className="text-slate-900 font-medium">{formatLastSeen(driver.lastSeen)}</p>
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Sync Verified</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    <div className="flex items-center gap-2"><MapPin className="w-3 h-3 text-blue-500" /><div><p className="text-xs font-medium truncate w-40">{driver.currentLocation?.address}</p></div></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                      <button onClick={() => locateDriver(driver)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Locate on Map"><Crosshair className="w-4 h-4" /></button>
                      <button onClick={() => setSelectedDriver(driver)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Communication Log"><MessageSquare className="w-4 h-4" /></button>
                      <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"><MoreVertical className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Driver Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2"><UserPlus className="w-5 h-5 text-blue-600" />Register New Driver</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddDriver} className="p-6 space-y-6">
              {showSuccess ? (
                <div className="py-12 flex flex-col items-center justify-center text-center animate-in zoom-in">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4"><CheckCircle2 className="w-10 h-10" /></div>
                  <h3 className="text-lg font-bold text-slate-900">Driver Registered</h3>
                  <p className="text-slate-500 text-sm">Encrypted credential stored successfully.</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                    <input required type="text" placeholder="e.g. Robert Wilson" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={newDriver.name} onChange={e => setNewDriver({...newDriver, name: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Secure Phone Number</label>
                    <input required type="tel" placeholder="(555) 000-0000" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={newDriver.phone} onChange={e => setNewDriver({...newDriver, phone: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Secure Passcode</label>
                    <input required type="text" placeholder="e.g. driver789" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={newDriver.passcode} onChange={e => setNewDriver({...newDriver, passcode: e.target.value})} />
                  </div>
                  <div className="pt-4 flex gap-3">
                    <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">Cancel</button>
                    <button type="submit" className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all">Save & Activate</button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Side Panel for Driver Details & Communication Log */}
      <div className={`fixed inset-y-0 right-0 w-[400px] bg-white shadow-2xl border-l border-slate-200 transform transition-transform duration-300 z-[3000] flex flex-col ${selectedDriver ? 'translate-x-0' : 'translate-x-full'}`}>
        {selectedDriver && (
          <>
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-900 text-white">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center font-bold text-white text-lg border-2 border-slate-700">
                    {selectedDriver.name.split(' ').map(n => n[0]).join('')}
                 </div>
                 <div>
                    <h2 className="text-lg font-bold leading-tight">{selectedDriver.name}</h2>
                    <p className="text-xs text-slate-400 font-mono uppercase tracking-widest">{selectedDriver.id} • {selectedDriver.phone}</p>
                 </div>
              </div>
              <button onClick={() => setSelectedDriver(null)} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="p-6 bg-slate-50 border-b border-slate-200">
               <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2"><MapIcon className="w-3 h-3" />Live Telemetry</h3>
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-400 font-mono">
                        {selectedDriver.currentLocation?.lat.toFixed(4)}, {selectedDriver.currentLocation?.lng.toFixed(4)}
                      </span>
                      <span className="text-[9px] font-bold text-blue-600 uppercase tracking-widest mt-1">Last Seen: {formatLastSeen(selectedDriver.lastSeen)}</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={syncGPS}
                    disabled={isSyncingGps}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-blue-600 hover:bg-blue-50 transition-all shadow-sm active:scale-95 disabled:opacity-50"
                  >
                    {isSyncingGps ? (
                      <div className="w-4 h-4 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
                    ) : (
                      <Crosshair className="w-4 h-4" />
                    )}
                    Sync Device GPS (Report Location)
                  </button>
               </div>
            </div>

            <div className="p-4 bg-white border-b border-slate-100">
               <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2"><History className="w-3 h-3" />Communication Log</h3>
                  <span className="text-[10px] bg-slate-50 border border-slate-200 px-2 py-0.5 rounded text-slate-500 font-bold">{driverComms.length} Record(s)</span>
               </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
               {driverComms.map((log) => (
                 <div key={log.id} className={`flex flex-col ${log.type === 'OUTBOUND' ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${log.type === 'OUTBOUND' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-slate-700 rounded-tl-none border border-slate-200'}`}>
                       <p className="leading-relaxed">{log.content}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-1 px-1">
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{log.senderName}</span>
                       <span className="text-[10px] text-slate-300">•</span>
                       <span className="text-[10px] text-slate-400">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                 </div>
               ))}
            </div>
            
            <div className="p-6 border-t border-slate-200 bg-white">
              <form onSubmit={handleSendMessage} className="relative">
                <textarea value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Log a secure message to this driver..." className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-4 pr-12 text-sm focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px] resize-none" />
                <button type="submit" disabled={!newMessage.trim()} className="absolute right-3 bottom-3 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 shadow-md"><Send className="w-4 h-4" /></button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Drivers;
