import React from 'react';

interface HealthCardProps {
    icon: string;
    label: string;
    value: string;
    normal: string;
    score: number;
    rul?: number;
}

export default function HealthCard({ icon, label, value, normal, score, rul }: HealthCardProps) {
    const getColor = (s: number) => {
        if (s >= 80) return '#22c55e';
        if (s >= 60) return '#F5A623';
        if (s >= 40) return '#f97316';
        return '#ef4444';
    };

    const getDot = (s: number) => {
        if (s >= 80) return 'status-dot-green';
        if (s >= 50) return 'status-dot-orange';
        return 'status-dot-red';
    };

    const color = getColor(score);

    return (
        <div className="card" style={{ position: 'relative', textAlign: 'center', padding: '16px 12px' }}>
            <div style={{ position: 'absolute', top: 8, right: 8 }}>
                <span className={`status-dot ${getDot(score)}`}></span>
            </div>
            <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: score >= 80 ? '#f0fdf4' : score >= 50 ? '#fff8eb' : '#fef2f2',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 8px', fontSize: 22,
            }}>
                {icon}
            </div>
            <p style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>{label}</p>
            <p style={{ fontSize: 22, fontWeight: 800, color, marginTop: 4 }}>{value}</p>
            <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>Normal: {normal}</p>
            <div className="status-bar" style={{ marginTop: 8 }}>
                <div className="status-bar-fill" style={{ width: `${Math.min(100, Math.max(5, score))}%`, background: color }} />
            </div>
            {rul !== undefined && rul >= 0 && rul < 300 && (
                <p style={{ fontSize: 10, fontWeight: 700, color: '#ef4444', marginTop: 6 }}>⏱ Fail in {Math.round(rul)}s</p>
            )}
        </div>
    );
}
