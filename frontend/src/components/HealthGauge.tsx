import React from 'react';

export default function HealthGauge({ health, anomalies }: any) {
    // Map health 0-100 to angle
    const radius = 160;
    const stroke = 32;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    // Semi-circle
    const strokeDashoffset = circumference - ((health / 100) * circumference) / 2;

    const color = health > 70 ? '#10b981' : health > 40 ? '#f59e0b' : '#ef4444';

    return (
        <div className="relative flex flex-col items-center justify-center w-full h-[320px]">
            <svg
                height={radius}
                width={radius * 2}
                className="health-gauge-svg absolute bottom-0 transform scale-[1.2]"
                viewBox={`0 0 ${radius * 2} ${radius}`}
            >
                <path
                    d={`M ${stroke},${radius} A ${normalizedRadius},${normalizedRadius} 0 0,1 ${radius * 2 - stroke},${radius}`}
                    fill="none"
                    stroke="#f1f5f9"
                    strokeWidth={stroke}
                    strokeLinecap="round"
                />
                <path
                    d={`M ${stroke},${radius} A ${normalizedRadius},${normalizedRadius} 0 0,1 ${radius * 2 - stroke},${radius}`}
                    fill="none"
                    stroke={color}
                    strokeWidth={stroke}
                    strokeLinecap="round"
                    strokeDasharray={`${circumference} ${circumference}`}
                    style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
                />
            </svg>

            <div className="absolute top-[45%] text-center">
                <div className="text-7xl font-black text-slate-800 drop-shadow-sm tracking-tight" style={{ color }}>
                    {health.toFixed(0)}<span className="text-4xl text-slate-400">%</span>
                </div>
                <p className="text-base font-bold text-slate-400 uppercase tracking-[0.2em] mt-3">Health Score</p>
            </div>

            {anomalies && anomalies.length > 0 && (
                <div className="absolute top-[10%] bg-red-100 border border-red-200 text-red-700 px-4 py-1.5 rounded-full text-sm font-bold animate-pulse shadow-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
                    Z-Score Anomaly Triggered ({anomalies.length})
                </div>
            )}
        </div>
    );
}
