import React from 'react';
import { useFleet } from '../App';
import { useNavigate } from 'react-router-dom';
import { Bell, AlertTriangle, Calendar, Shield, Clock, Play, Square } from 'lucide-react';
import { getTier } from '../intelligence/scoring';

interface HomePageProps { userName: string; }

export default function HomePage({ userName }: HomePageProps) {
    const { fleet, allAlerts, evaluating, tickCount, startEvaluation, stopEvaluation } = useFleet();
    const navigate = useNavigate();

    const vehiclesNeedingAttention = fleet.filter(v => (v.scoring?.overallScore || 100) < 70);
    const totalVehicles = fleet.length;
    const attentionCount = vehiclesNeedingAttention.length;

    const events = [
        { type: 'insurance', vehicle: 'Swift Dzire', message: 'Insurance expires in 5 days', badge: '5D', urgent: false },
        { type: 'service', vehicle: 'Tata Nexon EV', message: 'Service due in 12 days', badge: '12D', urgent: false },
    ];

    return (
        <div className="page">
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <div>
                    <p style={{ fontSize: 14, color: '#94a3b8', fontWeight: 500 }}>Hello,</p>
                    <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1e293b' }}>{userName}</h1>
                </div>
                <button onClick={() => navigate('/alerts')} style={{ width: 44, height: 44, borderRadius: '50%', border: '1px solid #e8ecf1', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}>
                    <Bell size={20} color="#64748b" />
                    {allAlerts.length > 0 && (
                        <span style={{ position: 'absolute', top: -2, right: -2, width: 18, height: 18, borderRadius: '50%', background: '#ef4444', color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {Math.min(allAlerts.length, 99)}
                        </span>
                    )}
                </button>
            </div>

            {/* ═══ Start Evaluation Button ═══ */}
            <div style={{
                background: evaluating
                    ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
                    : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                borderRadius: 16, padding: '20px', marginBottom: 24,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                boxShadow: evaluating ? '0 4px 20px rgba(15,23,42,0.3)' : '0 4px 20px rgba(34,197,94,0.3)',
            }}>
                <div>
                    <p style={{ color: '#fff', fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
                        {evaluating ? 'Evaluation Running' : 'Vehicle Health Evaluation'}
                    </p>
                    <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13 }}>
                        {evaluating
                            ? `Tick ${tickCount} — Live data flowing to graphs and insights`
                            : 'Press to start real-time simulation of all vehicles'}
                    </p>
                </div>
                <button onClick={evaluating ? stopEvaluation : startEvaluation} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '12px 24px', borderRadius: 12, border: 'none', cursor: 'pointer',
                    fontSize: 15, fontWeight: 700, transition: 'all 0.2s',
                    background: evaluating ? '#ef4444' : '#fff',
                    color: evaluating ? '#fff' : '#16a34a',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                }}>
                    {evaluating ? <><Square size={16} /> Stop</> : <><Play size={16} /> Start Evaluation</>}
                </button>
            </div>

            {/* Summary Cards */}
            <div className="responsive-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
                <div onClick={() => navigate('/vehicles')} style={{ background: 'linear-gradient(135deg, #3478F6, #5b9cf6)', borderRadius: 16, padding: '20px 16px', cursor: 'pointer', color: '#fff' }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                        <Shield size={16} />
                    </div>
                    <div style={{ fontSize: 36, fontWeight: 800 }}>{totalVehicles}</div>
                    <div style={{ fontSize: 13, fontWeight: 500, opacity: 0.9 }}>Vehicles</div>
                </div>
                <div onClick={() => navigate('/alerts')} style={{ background: 'linear-gradient(135deg, #F5A623, #f7c26b)', borderRadius: 16, padding: '20px 16px', cursor: 'pointer', color: '#fff' }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                        <AlertTriangle size={16} />
                    </div>
                    <div style={{ fontSize: 36, fontWeight: 800 }}>{attentionCount}</div>
                    <div style={{ fontSize: 13, fontWeight: 500, opacity: 0.9 }}>Need Attention</div>
                </div>
            </div>

            {/* Desktop: two-column layout */}
            <div className="desktop-sidebar-layout">
                <div>
                    {/* Fleet Table */}
                    {fleet.length > 0 && (
                        <div className="card" style={{ marginBottom: 20, overflow: 'hidden' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                <h2 style={{ fontSize: 16, fontWeight: 700 }}>Fleet Overview</h2>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    {evaluating && (
                                        <span style={{ fontSize: 10, fontWeight: 700, color: '#22c55e', background: '#f0fdf4', padding: '2px 8px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <span className="status-dot status-dot-green" style={{ width: 5, height: 5 }}></span> LIVE
                                        </span>
                                    )}
                                    <button onClick={() => navigate('/vehicles')} style={{ fontSize: 12, fontWeight: 600, color: '#3478F6', background: 'none', border: 'none', cursor: 'pointer' }}>View all</button>
                                </div>
                            </div>
                            <div style={{ overflowX: 'auto' }}>
                                <table className="fleet-table">
                                    <thead>
                                        <tr><th>Vehicle</th><th>Type</th><th>Health</th><th>Status</th></tr>
                                    </thead>
                                    <tbody>
                                        {fleet.map(v => {
                                            const score = v.scoring?.overallScore || 0;
                                            const tier = getTier(score);
                                            return (
                                                <tr key={v.id} onClick={() => navigate(`/vehicle/${v.id}`)}>
                                                    <td style={{ fontWeight: 600 }}>{v.info?.name}</td>
                                                    <td style={{ color: '#64748b', textTransform: 'capitalize' }}>{v.info?.type}</td>
                                                    <td><span style={{ fontWeight: 700, color: tier.color }}>{score}%</span></td>
                                                    <td>
                                                        <span className={`badge ${score >= 70 ? 'badge-success' : score >= 50 ? 'badge-warning' : 'badge-danger'}`}>
                                                            <span className={`status-dot status-dot-${tier.dot}`} style={{ width: 6, height: 6 }}></span> {tier.label}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Needs Attention */}
                    {vehiclesNeedingAttention.length > 0 && (
                        <div style={{ marginBottom: 20 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                <h2 style={{ fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <AlertTriangle size={18} color="#F5A623" /> Needs Attention
                                </h2>
                                <span className="badge badge-warning">{attentionCount} WARNING{attentionCount > 1 ? 'S' : ''}</span>
                            </div>
                            {vehiclesNeedingAttention.map(v => (
                                <div key={v.id} onClick={() => navigate(`/vehicle/${v.id}`)} className="card" style={{ marginBottom: 8, cursor: 'pointer', borderLeft: '4px solid #F5A623' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                                <span style={{ fontSize: 12, fontWeight: 600, background: '#1e293b', color: '#fff', padding: '2px 8px', borderRadius: 6 }}>
                                                    {v.info?.plate}
                                                </span>
                                                <span className="badge badge-warning">{v.scoring?.tier}</span>
                                            </div>
                                            <p style={{ fontSize: 16, fontWeight: 700, color: '#1e293b' }}>{v.info?.name}</p>
                                            <p style={{ fontSize: 13, color: '#94a3b8' }}>{v.recommendations?.[0]?.action || 'Health below optimal'}</p>
                                        </div>
                                        <div style={{ fontSize: 28, fontWeight: 800, color: '#F5A623' }}>{v.scoring?.overallScore || 0}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Upcoming Events */}
                    <div style={{ marginBottom: 20 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                            <h2 style={{ fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Calendar size={18} color="#3478F6" /> Upcoming Events
                            </h2>
                        </div>
                        {events.map((event, i) => (
                            <div key={i} className="card" style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ width: 40, height: 40, borderRadius: 10, background: event.urgent ? '#fef2f2' : '#fff8eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {event.urgent ? <AlertTriangle size={18} color="#ef4444" /> : <Clock size={18} color="#F5A623" />}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>{event.type === 'insurance' ? 'Insurance' : 'Service'} — {event.vehicle}</p>
                                    <p style={{ fontSize: 12, color: '#94a3b8' }}>{event.message}</p>
                                </div>
                                <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 8, background: event.urgent ? '#fef2f2' : '#fff8eb', color: event.urgent ? '#ef4444' : '#F5A623' }}>{event.badge}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right sidebar: Live Alert Feed */}
                <div>
                    <div className="card" style={{ position: 'sticky', top: 20 }}>
                        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Bell size={16} color="#ef4444" /> Live Alert Feed
                        </h3>
                        <div className="alert-feed">
                            {!evaluating ? (
                                <p style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', padding: 20 }}>Start evaluation to see live alerts</p>
                            ) : allAlerts.length === 0 ? (
                                <p style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', padding: 20 }}>No alerts yet</p>
                            ) : (
                                allAlerts.slice(0, 20).map((alert, i) => (
                                    <div key={alert.id || i} style={{
                                        padding: '8px 10px', borderRadius: 8, marginBottom: 6, fontSize: 12,
                                        background: alert.severity === 'danger' ? '#fef2f2' : alert.severity === 'critical' ? '#fff8eb' : '#f0f9ff',
                                        borderLeft: `3px solid ${alert.severity === 'danger' ? '#ef4444' : alert.severity === 'critical' ? '#F5A623' : '#3478F6'}`,
                                    }}>
                                        <p style={{ fontWeight: 600, color: '#1e293b', fontSize: 11 }}>{alert.message}</p>
                                        <p style={{ color: '#94a3b8', fontSize: 10, marginTop: 2 }}>
                                            {alert.label} &middot; {new Date(alert.timestamp * 1000).toLocaleTimeString()}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
