import React from 'react';
import { AlertTriangle, CheckCircle2, TrendingDown, Clock } from 'lucide-react';

export default function PartsGrid({ state, vehicleType, rul, activeFaults, anomalies }: any) {
    const parts = Object.entries(state).map(([key, val]: [string, any]) => {
        const isAnomaly = anomalies?.includes(key);
        const hasFault = activeFaults?.includes(key);
        const lifeLeft = rul && rul[key] ? rul[key] : null;

        let status = 'ok';
        if (isAnomaly || hasFault) status = 'warning';

        if (key === 'brake_fluid' && val < 40) status = 'critical';
        if (key === 'coolant_temp' && val > 105) status = 'critical';
        if (key === 'battery_soc' && val < 20) status = 'critical';
        if (key === 'cell_voltage_delta' && val > 0.4) status = 'critical';

        return { key, val, status, lifeLeft };
    });

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {parts.map(p => (
                <div key={p.key} className={`p-5 rounded-2xl border transition-all duration-300 ${p.status === 'ok' ? 'border-slate-200 bg-white shadow-sm hover:shadow-md' : p.status === 'warning' ? 'border-amber-300 bg-amber-50 shadow-md ring-4 ring-amber-50' : 'border-red-400 bg-red-50 relative overflow-hidden shadow-lg shadow-red-500/10 ring-4 ring-red-50'}`}>

                    <div className="flex justify-between items-start mb-6">
                        <span className="text-sm font-bold tracking-wide uppercase text-slate-600">{p.key.replace(/_/g, ' ')}</span>
                        {p.status === 'ok' && <CheckCircle2 className="text-emerald-500 w-6 h-6" />}
                        {p.status === 'warning' && <AlertTriangle className="text-amber-500 w-6 h-6 animate-pulse" />}
                        {p.status === 'critical' && <AlertTriangle className="text-red-600 w-6 h-6 animate-bounce" />}
                    </div>

                    <div className="text-3xl font-black text-slate-800 tracking-tight flex items-baseline gap-1">
                        {typeof p.val === 'number' ? p.val.toFixed(2) : p.val}
                        <span className="text-sm font-semibold text-slate-400">
                            {p.key.includes('temp') ? '°C' : p.key.includes('pressure') ? 'psi' : p.key.includes('soc') ? '%' : p.key.includes('delta') ? 'V' : ''}
                        </span>
                    </div>

                    {p.lifeLeft && p.lifeLeft > 0 && p.lifeLeft < 1000 ? (
                        <div className="text-xs font-bold text-red-600 flex items-center gap-1 mt-4 bg-red-100/80 border border-red-200 w-fit px-3 py-1.5 rounded-lg shadow-sm">
                            <Clock size={14} className="animate-spin-slow" /> FAIL IN {p.lifeLeft.toFixed(0)}s
                        </div>
                    ) : p.lifeLeft === 0 ? (
                        <div className="text-xs font-bold text-red-100 flex items-center gap-1 mt-4 bg-red-600 w-fit px-3 py-1.5 rounded-lg shadow-md animate-pulse">
                            <TrendingDown size={14} /> SYSTEM FAILURE
                        </div>
                    ) : (
                        <div className="mt-4 pt-4 border-t border-slate-100/50 flex">
                            <span className="text-xs font-medium text-slate-400">Stable Condition</span>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
