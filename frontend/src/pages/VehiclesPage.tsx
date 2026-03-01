import React from 'react';
import { useFleet } from '../App';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Car, Truck, Zap, Bike } from 'lucide-react';
import { getTier } from '../intelligence/scoring';

export default function VehiclesPage() {
    const { fleet, mode } = useFleet();
    const navigate = useNavigate();

    const VehicleIcon = ({ type, fuel }: { type: string; fuel: string }) => {
        if (fuel === 'Electric') return <Zap size={20} color="#22c55e" />;
        if (type === 'truck') return <Truck size={20} color="#92400e" />;
        return <Car size={20} color="#3478F6" />;
    };

    return (
        <div className="page">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1e293b' }}>My Vehicles</h1>
                <span className={`badge ${mode === 'LIVE' ? 'badge-success' : 'badge-warning'}`}>{fleet.length} connected</span>
            </div>

            {fleet.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
                    <Car size={48} color="#cbd5e1" style={{ margin: '0 auto 12px' }} />
                    <p style={{ fontSize: 16, fontWeight: 600 }}>Connecting to fleet...</p>
                    <p style={{ fontSize: 13, marginTop: 4 }}>Make sure the backend server is running</p>
                </div>
            ) : (
                <div className="responsive-grid-2" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {fleet.map(v => {
                        const score = v.scoring?.overallScore || 0;
                        const tier = getTier(score);
                        const alertCount = v.alerts?.length || 0;

                        return (
                            <div key={v.id} className="card" onClick={() => navigate(`/vehicle/${v.id}`)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, transition: 'box-shadow 0.2s' }}>
                                <div style={{
                                    width: 48, height: 48, borderRadius: 12,
                                    background: v.info?.fuel_type === 'Electric' ? '#f0fdf4' : v.info?.type === 'truck' ? '#fef3c7' : '#eef5ff',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                }}>
                                    <VehicleIcon type={v.info?.type || 'car'} fuel={v.info?.fuel_type || 'Petrol'} />
                                </div>

                                <div style={{ flex: 1 }}>
                                    <p style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>{v.info?.name}</p>
                                    <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                                        {v.info?.plate} &middot; {v.info?.year} &middot; {v.info?.fuel_type}
                                    </p>
                                    <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                                        <span className={`badge ${score >= 70 ? 'badge-success' : score >= 50 ? 'badge-warning' : 'badge-danger'}`} style={{ fontSize: 10 }}>
                                            <span className={`status-dot status-dot-${tier.dot}`} style={{ width: 5, height: 5 }}></span> {tier.label}
                                        </span>
                                        {alertCount > 0 && (
                                            <span className="badge badge-danger" style={{ fontSize: 10 }}>{alertCount} alerts</span>
                                        )}
                                    </div>
                                </div>

                                <div style={{ textAlign: 'center', flexShrink: 0 }}>
                                    <div style={{ width: 48, height: 48, borderRadius: '50%', border: `3px solid ${tier.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <span style={{ fontSize: 15, fontWeight: 800, color: tier.color }}>{score}</span>
                                    </div>
                                </div>

                                <ChevronRight size={18} color="#cbd5e1" />
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
