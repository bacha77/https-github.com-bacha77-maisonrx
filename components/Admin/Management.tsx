
import React, { useState } from 'react';
import { Building2, UserPlus, Phone, MapPin, ShieldCheck, X, CheckCircle2, MoreVertical, Search, Lock, User } from 'lucide-react';
import { Pharmacy, Driver } from '../../types';

interface ManagementProps {
  pharmacies: (Pharmacy & { passcode: string })[];
  setPharmacies: React.Dispatch<React.SetStateAction<(Pharmacy & { passcode: string })[]>>;
  drivers: Driver[];
  setDrivers: React.Dispatch<React.SetStateAction<Driver[]>>;
}

const Management: React.FC<ManagementProps> = ({ pharmacies, setPharmacies, drivers, setDrivers }) => {
  const [activeTab, setActiveTab] = useState<'PHARMACIES' | 'DRIVERS'>('PHARMACIES');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [newPharmacy, setNewPharmacy] = useState({ name: '', id: '', license: '', address: '', passcode: '' });
  const [newDriver, setNewDriver] = useState({ name: '', phone: '', passcode: '' });

  const handleAddPharmacy = (e: React.FormEvent) => {
    e.preventDefault();
    const p: Pharmacy & { passcode: string } = {
      id: newPharmacy.id.trim().toUpperCase(),
      name: newPharmacy.name.trim(),
      licenseNumber: newPharmacy.license.trim(),
      address: newPharmacy.address.trim(),
      passcode: newPharmacy.passcode.trim(),
      createdAt: new Date().toISOString()
    };
    
    // Functional update ensures we don't use stale props
    setPharmacies(prev => [...prev, p]);
    
    setShowSuccess(true);
    setTimeout(() => { 
      setShowSuccess(false); 
      setIsAddModalOpen(false); 
      setNewPharmacy({ name: '', id: '', license: '', address: '', passcode: '' }); 
    }, 1500);
  };

  const handleAddDriver = (e: React.FormEvent) => {
    e.preventDefault();
    const d: Driver = {
      id: `D-${Math.floor(Math.random() * 900) + 100}`,
      name: newDriver.name.trim(),
      phone: newDriver.phone.trim(),
      passcode: newDriver.passcode.trim(),
      status: 'OFFLINE',
    };
    
    // Functional update ensures we don't use stale props
    setDrivers(prev => [...prev, d]);
    
    setShowSuccess(true);
    setTimeout(() => { 
      setShowSuccess(false); 
      setIsAddModalOpen(false); 
      setNewDriver({ name: '', phone: '', passcode: '' }); 
    }, 1500);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Entity Management</h1>
          <p className="text-slate-500">Global registry of pharmacies and delivery fleet</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          {activeTab === 'PHARMACIES' ? 'Register Pharmacy' : 'Register Driver'}
        </button>
      </div>

      <div className="flex bg-slate-100 p-1 w-fit rounded-xl border border-slate-200 mb-6">
        <button 
          onClick={() => setActiveTab('PHARMACIES')}
          className={`px-8 py-2.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'PHARMACIES' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
        >
          Pharmacy Network
        </button>
        <button 
          onClick={() => setActiveTab('DRIVERS')}
          className={`px-8 py-2.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'DRIVERS' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
        >
          Fleet Registry
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-bold text-slate-700 uppercase tracking-wider text-[10px]">Entity</th>
              <th className="px-6 py-4 font-bold text-slate-700 uppercase tracking-wider text-[10px]">{activeTab === 'PHARMACIES' ? 'License' : 'Status'}</th>
              <th className="px-6 py-4 font-bold text-slate-700 uppercase tracking-wider text-[10px]">{activeTab === 'PHARMACIES' ? 'Address' : 'Contact'}</th>
              <th className="px-6 py-4 font-bold text-slate-700 uppercase tracking-wider text-[10px]">Registry Date</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {activeTab === 'PHARMACIES' ? (
              pharmacies.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold border border-blue-100">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{p.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono tracking-tighter uppercase">{p.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-[10px] text-slate-500 uppercase font-bold">{p.licenseNumber}</td>
                  <td className="px-6 py-4 text-slate-600 text-xs truncate max-w-[200px]">{p.address}</td>
                  <td className="px-6 py-4 text-slate-400 text-xs">Dec 2024</td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-slate-300 hover:text-slate-600"><MoreVertical className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))
            ) : (
              drivers.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold">
                        {d.name[0]}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{d.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono tracking-tighter uppercase">{d.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                     <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${d.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                       {d.status}
                     </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 text-xs">{d.phone}</td>
                  <td className="px-6 py-4 text-slate-400 text-xs">Dec 2024</td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-slate-300 hover:text-slate-600"><MoreVertical className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in duration-200">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-blue-600" />
                {activeTab === 'PHARMACIES' ? 'Provision Terminal' : 'Register Driver'}
              </h2>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400"><X className="w-6 h-6" /></button>
            </div>
            
            <form onSubmit={activeTab === 'PHARMACIES' ? handleAddPharmacy : handleAddDriver} className="p-8 space-y-6">
              {showSuccess ? (
                <div className="py-12 flex flex-col items-center justify-center text-center animate-in zoom-in">
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6"><CheckCircle2 className="w-12 h-12" /></div>
                  <h3 className="text-xl font-bold text-slate-900">Registry Successful</h3>
                  <p className="text-slate-500 mt-2">Credentials stored and encrypted for transmission.</p>
                </div>
              ) : (
                <>
                  {activeTab === 'PHARMACIES' ? (
                    <>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pharmacy Name</label>
                        <input required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm outline-none focus:ring-2 focus:ring-blue-500" value={newPharmacy.name} onChange={e => setNewPharmacy({...newPharmacy, name: e.target.value})} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Terminal ID</label>
                          <input required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm outline-none" value={newPharmacy.id} onChange={e => setNewPharmacy({...newPharmacy, id: e.target.value.toUpperCase()})} placeholder="PH-XXX" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Initial Passcode</label>
                          <input required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm outline-none" value={newPharmacy.passcode} onChange={e => setNewPharmacy({...newPharmacy, passcode: e.target.value})} />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Physical Address</label>
                        <textarea required className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm outline-none" value={newPharmacy.address} onChange={e => setNewPharmacy({...newPharmacy, address: e.target.value})} />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Driver Full Name</label>
                        <input required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm outline-none" value={newDriver.name} onChange={e => setNewDriver({...newDriver, name: e.target.value})} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mobile Phone</label>
                          <input required type="tel" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm outline-none" value={newDriver.phone} onChange={e => setNewDriver({...newDriver, phone: e.target.value})} placeholder="(555) 000-0000" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Login Passcode</label>
                          <input required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm outline-none" value={newDriver.passcode} onChange={e => setNewDriver({...newDriver, passcode: e.target.value})} placeholder="Secure Key" />
                        </div>
                      </div>
                    </>
                  )}
                  <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 shadow-xl shadow-blue-500/30 transition-all flex items-center justify-center gap-2">
                    <Lock className="w-4 h-4" />
                    Commit to Registry
                  </button>
                </>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Management;
