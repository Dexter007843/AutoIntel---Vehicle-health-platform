import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function FleetTable({ fleet, selectedId, onSelect }: any) {
    // Sort by FPI descending
    const sortedFleet = [...fleet].sort((a, b) => b.fpi - a.fpi);

    return (
        <div className="glass-card overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-white">
                <h3 className="font-bold text-slate-800">Fleet Priority Ranking</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                            <th className="p-4">Vehicle ID</th>
                            <th className="p-4">Type</th>
                            <th className="p-4">FPI Risk Score</th>
                            <th className="p-4">Alerts</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedFleet.map((v) => (
                            <tr
                                key={v.id}
                                onClick={() => onSelect(v.id)}
                                className={`border-b border-slate-50 cursor-pointer transition-colors ${selectedId === v.id ? 'bg-brand-50' : 'hover:bg-slate-50'}`}
                            >
                                <td className="p-4 font-medium text-slate-800">{v.id}</td>
                                <td className="p-4 text-slate-600">{v.vehicle_type}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${v.fpi > 70 ? 'bg-red-100 text-red-700' : v.fpi > 30 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                        {v.fpi.toFixed(1)}
                                    </span>
                                </td>
                                <td className="p-4 text-sm">
                                    {v.anomalies?.length > 0 && <span className="flex items-center gap-1 text-red-600 font-medium"><AlertTriangle size={14} /> Anomaly</span>}
                                    {v.active_faults?.length > 0 && <span className="flex items-center gap-1 text-amber-600 font-medium text-xs mt-1">Fault Active</span>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
