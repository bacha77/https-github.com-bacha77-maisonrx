
import React, { useState, useEffect } from 'react';
import { ShieldCheck, History, Search, Download, Terminal, BrainCircuit } from 'lucide-react';
import { getAuditSummary } from '../services/geminiService';

const MOCK_LOGS = [
  { id: 'log_1', timestamp: '2023-10-27 14:30:05', userId: 'admin_sj', action: 'VIEW_PATIENT_PHI', details: 'Accessed record for patient ID #9823', ip: '192.168.1.45' },
  { id: 'log_2', timestamp: '2023-10-27 14:35:12', userId: 'admin_sj', action: 'BULK_UPLOAD', details: 'Uploaded 45 delivery records via CSV', ip: '192.168.1.45' },
  { id: 'log_3', timestamp: '2023-10-27 15:10:44', userId: 'sys_auto', action: 'GPS_SYNC', details: 'Driver #D102 synced location coords', ip: '10.0.4.12' },
  { id: 'log_4', timestamp: '2023-10-27 15:20:00', userId: 'driver_kb', action: 'CAPTURE_SIGNATURE', details: 'Signature captured for Order #ORD-12093', ip: '172.16.0.8' },
  { id: 'log_5', timestamp: '2023-10-27 16:05:00', userId: 'unkn_user', action: 'FAILED_LOGIN', details: 'Unauthorized access attempt from new IP', ip: '84.12.33.109' },
];

const AuditLogs = () => {
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const generateAiReport = async () => {
    setLoadingAi(true);
    const summary = await getAuditSummary(MOCK_LOGS);
    setAiSummary(summary);
    setLoadingAi(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Security Audit Trail</h1>
          <p className="text-slate-500">Comprehensive logs of all PHI access and system mutations</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={generateAiReport}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
          >
            {loadingAi ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
                <BrainCircuit className="w-4 h-4" />
            )}
            AI Insights
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all">
            <Download className="w-4 h-4" />
            Export Log (CSV)
          </button>
        </div>
      </div>

      {aiSummary && (
        <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-2xl animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-2 mb-4">
             <BrainCircuit className="w-5 h-5 text-indigo-600" />
             <h3 className="text-sm font-bold text-indigo-900">AI-Generated Compliance Summary</h3>
          </div>
          <div className="text-sm text-indigo-800 leading-relaxed whitespace-pre-wrap">
            {aiSummary}
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-bold text-slate-700 uppercase tracking-wider text-[10px]">Timestamp</th>
              <th className="px-6 py-4 font-bold text-slate-700 uppercase tracking-wider text-[10px]">User</th>
              <th className="px-6 py-4 font-bold text-slate-700 uppercase tracking-wider text-[10px]">Action</th>
              <th className="px-6 py-4 font-bold text-slate-700 uppercase tracking-wider text-[10px]">Details</th>
              <th className="px-6 py-4 font-bold text-slate-700 uppercase tracking-wider text-[10px]">IP Address</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {MOCK_LOGS.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-mono text-[11px] text-slate-500">{log.timestamp}</td>
                <td className="px-6 py-4 font-medium text-slate-900">{log.userId}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    log.action.includes('FAILED') ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {log.action}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-600">{log.details}</td>
                <td className="px-6 py-4 font-mono text-xs text-slate-400">{log.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditLogs;
