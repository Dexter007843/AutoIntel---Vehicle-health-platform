import React, { useState } from 'react';
import { useFleet } from '../App';
import { User, LogOut, Wifi, WifiOff, Server, Shield, Activity, Radio, BarChart3, Zap, Target, TrendingUp, Cpu, Info, X } from 'lucide-react';

interface ProfilePageProps { userName: string; onLogout: () => void; }

export default function ProfilePage({ userName, onLogout }: ProfilePageProps) {
    const { wsConnected, fleet, mode, allAlerts } = useFleet();
    const [showInfo, setShowInfo] = useState(false);

    return (
        <div className="page">
            {/* Profile Header */}
            <div style={{ textAlign: 'center', marginBottom: 32, paddingTop: 20 }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #3478F6, #60a5fa)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', boxShadow: '0 4px 14px rgba(52,120,246,0.3)' }}>
                    <User size={36} color="#fff" />
                </div>
                <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1e293b' }}>{userName}</h1>
                <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>Fleet Manager</p>
            </div>

            {/* System Status */}
            <div className="card" style={{ marginBottom: 12 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#64748b', marginBottom: 12 }}>System Status</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <StatusRow icon={wsConnected ? <Wifi size={16} color="#22c55e" /> : <WifiOff size={16} color="#ef4444" />} label="WebSocket" badge={wsConnected ? 'Connected' : 'Disconnected'} badgeType={wsConnected ? 'success' : 'danger'} />
                    <StatusRow icon={<Radio size={16} color={mode === 'LIVE' ? '#22c55e' : '#F5A623'} />} label="Data Mode" badge={mode} badgeType={mode === 'LIVE' ? 'success' : 'warning'} />
                    <StatusRow icon={<Server size={16} color="#3478F6" />} label="Fleet Vehicles" badge={`${fleet.length}`} badgeType="info" />
                    <StatusRow icon={<Activity size={16} color="#3478F6" />} label="Total Alerts" badge={`${allAlerts.length}`} badgeType={allAlerts.length > 10 ? 'danger' : allAlerts.length > 0 ? 'warning' : 'success'} />
                    <StatusRow icon={<Shield size={16} color="#22c55e" />} label="Intelligence Engine" badge="Active" badgeType="success" />
                </div>
            </div>

            {/* Intelligence Features */}
            <div className="card" style={{ marginBottom: 12 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#64748b', marginBottom: 8 }}>Intelligence Stack</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {[
                        { icon: <BarChart3 size={16} color="#3478F6" />, label: 'Health Scoring', desc: '5-tier (Optimal to Failure Imminent), weighted subsystems' },
                        { icon: <Zap size={16} color="#F5A623" />, label: 'Anomaly Detection', desc: 'Z-score with 30-sample rolling window' },
                        { icon: <Target size={16} color="#ef4444" />, label: 'Rule Engine', desc: '24 hard rules + 3 compound rules' },
                        { icon: <TrendingUp size={16} color="#22c55e" />, label: 'RUL Estimator', desc: 'Linear regression time-to-failure projection' },
                        { icon: <Cpu size={16} color="#8b5cf6" />, label: 'AI Recommendations', desc: 'Repair suggestions with cost estimates' },
                    ].map(item => (
                        <div key={item.label} style={{ display: 'flex', gap: 10, padding: '6px 0', alignItems: 'flex-start' }}>
                            <div style={{ marginTop: 2, flexShrink: 0 }}>{item.icon}</div>
                            <div>
                                <p style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{item.label}</p>
                                <p style={{ fontSize: 11, color: '#94a3b8' }}>{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* About + Info Button */}
            <div className="card" style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#64748b' }}>About</p>
                    <button onClick={() => setShowInfo(true)} style={{
                        width: 32, height: 32, borderRadius: '50%', border: '1px solid #e2e8f0',
                        background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', transition: 'all 0.2s',
                    }}>
                        <Info size={16} color="#3478F6" />
                    </button>
                </div>
                <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.6 }}>
                    AutoIntel uses physics-based simulation with adaptive intelligence to monitor your fleet's health in real-time.
                    Supports car, SUV, EV, and truck vehicle types with specialized subsystem monitoring.
                </p>
            </div>

            {/* Info Modal */}
            {showInfo && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }} onClick={() => setShowInfo(false)}>
                    <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 16, padding: '24px', maxWidth: 480, width: '100%', maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1e293b' }}>How It Works</h2>
                            <button onClick={() => setShowInfo(false)} style={{ width: 32, height: 32, borderRadius: '50%', border: 'none', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                <X size={16} color="#64748b" />
                            </button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: 13, color: '#475569', lineHeight: 1.7 }}>
                            <div>
                                <p style={{ fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>1. Start Evaluation</p>
                                <p>Press the "Start Evaluation" button on the Home page to begin real-time vehicle telemetry simulation. Each vehicle generates sensor data every 2 seconds using a physics-based engine.</p>
                            </div>
                            <div>
                                <p style={{ fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>2. Health Scoring</p>
                                <p>Each sensor value is scored against optimal thresholds. Subsystem scores are computed with weighted averages, producing an overall health percentage (Optimal, Good, Fair, Poor, or Critical).</p>
                            </div>
                            <div>
                                <p style={{ fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>3. Anomaly Detection</p>
                                <p>A rolling Z-score detects statistical outliers across 30 data samples. Sudden spikes or drops are flagged as anomalies in real time.</p>
                            </div>
                            <div>
                                <p style={{ fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>4. Rule Engine Alerts</p>
                                <p>24 hard-coded rules check sensor values against critical thresholds (e.g., brake pad wear below 15%, coolant above 115 C). Violations trigger severity-tagged alerts.</p>
                            </div>
                            <div>
                                <p style={{ fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>5. Charts and Insights</p>
                                <p>Real-time trend charts visualize sensor data over time. The Insights tab shows RUL (Remaining Useful Life) estimates and AI-generated repair recommendations with cost estimates.</p>
                            </div>
                            <div>
                                <p style={{ fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>6. Fault Injection</p>
                                <p>On the Health tab you can inject faults (brake failure, overheating, tyre blowout, etc.) to test how the system detects and responds to degrading conditions.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Logout */}
            <button onClick={onLogout} style={{ width: '100%', padding: '14px', borderRadius: 12, border: '1px solid #fecaca', background: '#fef2f2', color: '#ef4444', fontSize: 15, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s' }}>
                <LogOut size={18} /> Logout
            </button>
        </div>
    );
}

function StatusRow({ icon, label, badge, badgeType }: { icon: React.ReactNode; label: string; badge: string; badgeType: string }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {icon}
                <span style={{ fontSize: 14, color: '#1e293b' }}>{label}</span>
            </div>
            <span className={`badge badge-${badgeType}`}>{badge}</span>
        </div>
    );
}
