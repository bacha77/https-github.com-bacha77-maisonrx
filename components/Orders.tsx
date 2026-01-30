
import React, { useState, useRef } from 'react';
import { 
  Package, 
  Upload, 
  Search, 
  Filter, 
  ChevronRight, 
  Clock, 
  CheckCircle,
  AlertCircle,
  ThermometerSnowflake,
  ShieldAlert,
  Send,
  MessageSquare,
  Truck,
  User,
  X,
  CheckCircle2,
  Plus,
  MapPin,
  ClipboardCheck,
  Navigation,
  FileSignature
} from 'lucide-react';
import { OrderStatus, Order, Driver } from '../types';
import { STATUS_COLORS } from '../constants';
import { parseBulkOrders } from '../services/geminiService';

interface OrdersProps {
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  drivers: Driver[];
  onAssign: (orderId: string, driverId: string) => void;
  hideHeader?: boolean;
  compact?: boolean;
}

const TrackingJourney: React.FC<{ order: Order, onClose: () => void }> = ({ order, onClose }) => {
  const steps = [
    { label: 'Order Created', status: 'COMPLETED', time: '10:45 AM', icon: ClipboardCheck },
    { label: 'Fleet Dispatched', status: order.status !== OrderStatus.PENDING ? 'COMPLETED' : 'PENDING', time: '11:02 AM', icon: Truck },
    { label: 'Medication Pickup', status: [OrderStatus.PICKED_UP, OrderStatus.OUT_FOR_DELIVERY, OrderStatus.DELIVERED].includes(order.status) ? 'COMPLETED' : 'PENDING', time: '11:15 AM', icon: Package },
    { label: 'Final Delivery', status: order.status === OrderStatus.DELIVERED ? 'COMPLETED' : 'PENDING', time: '11:45 AM', icon: CheckCircle2 },
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[5000] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
        <div className="p-8 bg-slate-900 text-white flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold mb-1">Journey Tracking</h3>
            <p className="text-slate-400 text-xs font-mono uppercase tracking-widest">{order.id}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-8 space-y-8">
           <div className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-100 rounded-2xl">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold">
                 {order.patientName[0]}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">{order.patientName}</p>
                <p className="text-xs text-slate-500">{order.address}</p>
              </div>
           </div>

           <div className="relative space-y-12 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
              {steps.map((step, i) => (
                <div key={i} className="relative flex gap-6 items-start">
                  <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-sm ${step.status === 'COMPLETED' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                    <step.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 pt-2">
                    <div className="flex justify-between items-center mb-1">
                      <p className={`text-sm font-bold ${step.status === 'COMPLETED' ? 'text-slate-900' : 'text-slate-400'}`}>{step.label}</p>
                      <p className="text-[10px] font-mono font-bold text-slate-400">{step.time}</p>
                    </div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">
                      {step.status === 'COMPLETED' ? 'Verified Chain of Custody' : 'Pending Action'}
                    </p>
                  </div>
                </div>
              ))}
           </div>

           {order.status === OrderStatus.DELIVERED && (
             <div className="p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Patient Confirmation Signature</p>
                <div className="w-full h-20 bg-white rounded-lg flex items-center justify-center border border-slate-100">
                   <FileSignature className="w-8 h-8 text-slate-300" />
                   <span className="text-xs font-mono text-slate-400 ml-2 italic">PodCapture-Verified</span>
                </div>
             </div>
           )}

           <button onClick={onClose} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all">
             Close Journey Logs
           </button>
        </div>
      </div>
    </div>
  );
};

const OrderCard: React.FC<{ 
  order: Order, 
  onDispatch: (order: Order) => void,
  onTrack: (order: Order) => void,
  assignedDriver?: Driver 
}> = ({ order, onDispatch, onTrack, assignedDriver }) => (
  <div className="group bg-white border border-slate-200 rounded-[2rem] p-6 hover:shadow-xl hover:border-blue-200 transition-all">
    <div className="flex justify-between items-start mb-6">
      <div className="flex gap-4">
        <div className={`p-3.5 rounded-2xl ${STATUS_COLORS[order.status].split(' ')[0]}`}>
          <Package className={`w-5 h-5 ${STATUS_COLORS[order.status].split(' ')[1]}`} />
        </div>
        <div>
          <h4 className="font-bold text-slate-900 flex items-center gap-2">
            {order.id}
            <div className="flex gap-1">
              {order.isHighValue && <ShieldAlert className="w-3.5 h-3.5 text-red-500" />}
              {order.requiresRefrigeration && <ThermometerSnowflake className="w-3.5 h-3.5 text-blue-500" />}
            </div>
          </h4>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1 mt-0.5">
            <Clock className="w-3 h-3" />
            Window: {order.deliveryWindow}
          </p>
        </div>
      </div>
      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase tracking-widest ${STATUS_COLORS[order.status]}`}>
        {order.status.replace('_', ' ')}
      </span>
    </div>
    
    <div className="space-y-4 mb-6">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
           <User className="w-4 h-4" />
        </div>
        <div>
          <p className="text-xs font-bold text-slate-800">{order.patientName}</p>
          <p className="text-[10px] text-slate-500 font-medium truncate max-w-[180px]">{order.address}</p>
        </div>
      </div>
    </div>

    <div className="flex items-center justify-between pt-5 border-t border-slate-100">
      <div className="flex items-center gap-2">
         {assignedDriver ? (
           <div className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-50 rounded-xl border border-slate-100">
              <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-[8px] text-white font-black uppercase">
                {assignedDriver.name.split(' ').map(n => n[0]).join('')}
              </div>
              <span className="text-[10px] font-bold text-slate-700">{assignedDriver.name.split(' ')[0]}</span>
           </div>
         ) : (
           <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
             <AlertCircle className="w-3 h-3" />
             Pending Fleet
           </div>
         )}
      </div>
      
      {order.status === OrderStatus.PENDING ? (
        <button 
          onClick={() => onDispatch(order)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all shadow-md active:scale-95"
        >
          Dispatch Fleet <Send className="w-3 h-3" />
        </button>
      ) : (
        <button 
          onClick={() => onTrack(order)}
          className="flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors py-2"
        >
          Track Journey <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  </div>
);

const Orders = ({ orders, setOrders, drivers, onAssign, hideHeader = false }: OrdersProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [dispatchingOrder, setDispatchingOrder] = useState<Order | null>(null);
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);
  const [assignmentSuccess, setAssignmentSuccess] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Manual Entry Form State
  const [manualTicket, setManualTicket] = useState({ patientName: '', address: '', phone: '', medications: '', window: 'Today, 2PM - 4PM', refrigerated: false, highValue: false });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const csv = event.target?.result as string;
      const parsed = await parseBulkOrders(csv);
      const newOrders = parsed.map((o: any) => ({
        ...o,
        id: `ORD-${Math.floor(Math.random() * 90000) + 10000}`,
        status: OrderStatus.PENDING,
        createdAt: new Date().toISOString()
      }));
      setOrders([...newOrders, ...orders]);
      setIsUploading(false);
    };
    reader.readAsText(file);
  };

  const handleCreateManualTicket = (e: React.FormEvent) => {
    e.preventDefault();
    const order: Order = {
      id: `ORD-${Math.floor(Math.random() * 90000) + 10000}`,
      patientName: manualTicket.patientName,
      patientPhone: manualTicket.phone,
      address: manualTicket.address,
      medications: manualTicket.medications.split(','),
      status: OrderStatus.PENDING,
      createdAt: new Date().toISOString(),
      pharmacyId: 'PH-771', // Should be dynamic
      deliveryWindow: manualTicket.window,
      requiresRefrigeration: manualTicket.refrigerated,
      isHighValue: manualTicket.highValue
    };
    setOrders([order, ...orders]);
    setIsManualModalOpen(false);
    setManualTicket({ patientName: '', address: '', phone: '', medications: '', window: 'Today, 2PM - 4PM', refrigerated: false, highValue: false });
  };

  const handleConfirmAssignment = (driverId: string) => {
    if (!dispatchingOrder) return;
    onAssign(dispatchingOrder.id, driverId);
    setAssignmentSuccess(true);
    setTimeout(() => {
      setAssignmentSuccess(false);
      setDispatchingOrder(null);
    }, 1500);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Active Secure Dispatch</h2>
          <p className="text-sm text-slate-500 font-medium">Real-time medication transport tracking and verification</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-all disabled:opacity-50"
          >
            {isUploading ? <div className="w-4 h-4 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin" /> : <Upload className="w-4 h-4" />}
            Bulk Upload
          </button>
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".csv" />
          <button 
            onClick={() => setIsManualModalOpen(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl text-xs font-bold hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all"
          >
            <Plus className="w-4 h-4" /> New Dispatch
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {orders.length > 0 ? (
          orders.map((order) => (
            <OrderCard 
              key={order.id} 
              order={order} 
              onDispatch={setDispatchingOrder}
              onTrack={setTrackingOrder}
              assignedDriver={drivers.find(d => d.id === order.driverId)}
            />
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-slate-50 border border-dashed border-slate-200 rounded-[2.5rem]">
             <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Package className="w-8 h-8 text-slate-200" />
             </div>
             <h3 className="text-lg font-bold text-slate-900">No Orders in Dispatch</h3>
             <p className="text-sm text-slate-500 mt-1 max-w-xs mx-auto">Upload a delivery manifest or create a manual ticket to begin tracking.</p>
          </div>
        )}
      </div>

      {/* Manual Entry Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[5000] flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                 <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                    <Plus className="w-6 h-6 text-blue-600" />
                    New Manual Dispatch
                 </h2>
                 <button onClick={() => setIsManualModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
                    <X className="w-6 h-6" />
                 </button>
              </div>
              <form onSubmit={handleCreateManualTicket} className="p-8 space-y-6">
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Patient Name</label>
                       <input required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm outline-none focus:ring-2 focus:ring-blue-500" value={manualTicket.patientName} onChange={e => setManualTicket({...manualTicket, patientName: e.target.value})} placeholder="e.g. John Miller" />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phone Number</label>
                       <input required type="tel" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm outline-none" value={manualTicket.phone} onChange={e => setManualTicket({...manualTicket, phone: e.target.value})} placeholder="(555) 000-0000" />
                    </div>
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Delivery Address</label>
                    <input required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm outline-none" value={manualTicket.address} onChange={e => setManualTicket({...manualTicket, address: e.target.value})} placeholder="Full Street Address, Apt, ZIP" />
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Medications (comma separated)</label>
                    <textarea required className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm outline-none" value={manualTicket.medications} onChange={e => setManualTicket({...manualTicket, medications: e.target.value})} placeholder="e.g. Insulin 10ml, Metformin 500mg" />
                 </div>
                 <div className="flex items-center gap-6 pt-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                       <input type="checkbox" className="w-5 h-5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500" checked={manualTicket.refrigerated} onChange={e => setManualTicket({...manualTicket, refrigerated: e.target.checked})} />
                       <span className="text-xs font-bold text-slate-600">Requires Refrigeration</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                       <input type="checkbox" className="w-5 h-5 rounded-lg border-slate-300 text-red-600 focus:ring-red-500" checked={manualTicket.highValue} onChange={e => setManualTicket({...manualTicket, highValue: e.target.checked})} />
                       <span className="text-xs font-bold text-slate-600">High Value Medication</span>
                    </label>
                 </div>
                 <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all">
                    Register Secure Ticket
                 </button>
              </form>
           </div>
        </div>
      )}

      {/* Tracking Journey Modal */}
      {trackingOrder && <TrackingJourney order={trackingOrder} onClose={() => setTrackingOrder(null)} />}

      {/* Dispatch Selection Modal */}
      {dispatchingOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[5000] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                <Truck className="w-6 h-6 text-blue-600" />
                Fleet Dispatch
              </h2>
              <button onClick={() => setDispatchingOrder(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-8">
              {assignmentSuccess ? (
                <div className="py-12 flex flex-col items-center justify-center text-center animate-in zoom-in">
                  <div className="w-24 h-24 bg-green-50 text-green-600 rounded-[2rem] flex items-center justify-center mb-8 shadow-sm">
                    <CheckCircle2 className="w-12 h-12" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900">Driver Notified</h3>
                  <p className="text-slate-500 mt-2 font-medium">Chain of custody handoff has been logged.</p>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="bg-blue-600 p-6 rounded-[2rem] text-white shadow-xl shadow-blue-500/20">
                     <p className="text-[10px] font-black uppercase mb-3 tracking-[0.2em] opacity-80">Pending Assignment</p>
                     <div className="flex justify-between items-end">
                        <div>
                          <p className="text-lg font-black leading-none mb-1">{dispatchingOrder.id}</p>
                          <p className="text-sm font-medium opacity-80">{dispatchingOrder.patientName}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">Window</p>
                          <p className="text-sm font-black">{dispatchingOrder.deliveryWindow}</p>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Live Proximity Fleet</h4>
                    <div className="max-h-[300px] overflow-y-auto pr-2 space-y-3">
                       {drivers.filter(d => d.status === 'ACTIVE').length > 0 ? (
                         drivers.filter(d => d.status === 'ACTIVE').map(driver => (
                           <button 
                             key={driver.id}
                             onClick={() => handleConfirmAssignment(driver.id)}
                             className="w-full flex items-center justify-between p-5 bg-slate-50 hover:bg-white hover:border-blue-500 border border-slate-100 rounded-[1.8rem] transition-all group shadow-sm active:scale-[0.98]"
                           >
                             <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center font-black text-slate-900 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                  {driver.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div className="text-left">
                                  <p className="text-sm font-black text-slate-900">{driver.name}</p>
                                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1 mt-0.5">
                                    <MapPin className="w-3 h-3 text-blue-500" /> 1.2 mi away
                                  </p>
                                </div>
                             </div>
                             <div className="p-2 bg-white rounded-xl border border-slate-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                               <ChevronRight className="w-4 h-4" />
                             </div>
                           </button>
                         ))
                       ) : (
                         <div className="py-12 text-center text-slate-400 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
                            <AlertCircle className="w-10 h-10 mx-auto mb-3 opacity-20" />
                            <p className="text-sm font-bold">No active drivers in range</p>
                         </div>
                       )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
