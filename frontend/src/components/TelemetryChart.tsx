import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function TelemetryChart({ state, timestamp, vehicleType }: any) {
    const [data, setData] = useState<any[]>([]);

    useEffect(() => {
        setData((prev) => {
            const point = { time: new Date(timestamp * 1000).toLocaleTimeString([], { minute: '2-digit', second: '2-digit' }), ...state };
            const next = [...prev, point];
            if (next.length > 30) next.shift(); // keep 30 ticks (60s)
            return next;
        });
    }, [timestamp, state]);

    // Determine what to chart based on type
    const metric1 = vehicleType === 'EV' ? 'battery_soc' : 'coolant_temp';
    const metric2 = vehicleType === 'EV' ? 'inverter_temp' : 'rpm';

    return (
        <div className="h-[300px] flex gap-6">
            <div className="flex-1 border border-slate-200 rounded-2xl p-5 bg-white shadow-sm flex flex-col">
                <h4 className="text-sm font-bold text-slate-500 mb-4 uppercase tracking-wider">{metric1.replace('_', ' ')}</h4>
                <div className="flex-1 min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorM1" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4} />
                                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="time" hide />
                            <YAxis domain={['auto', 'auto']} tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                            <Area type="monotone" dataKey={metric1} stroke="#0ea5e9" strokeWidth={4} fillOpacity={1} fill="url(#colorM1)" isAnimationActive={false} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="flex-1 border border-slate-200 rounded-2xl p-5 bg-white shadow-sm flex flex-col">
                <h4 className="text-sm font-bold text-slate-500 mb-4 uppercase tracking-wider">{metric2.replace('_', ' ')}</h4>
                <div className="flex-1 min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorM2" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="time" hide />
                            <YAxis domain={['auto', 'auto']} tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                            <Area type="monotone" dataKey={metric2} stroke="#8b5cf6" strokeWidth={4} fillOpacity={1} fill="url(#colorM2)" isAnimationActive={false} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
