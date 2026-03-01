import React from 'react';
import { useFleet } from '../App';
import { AlertTriangle, Bell, Shield, Zap } from 'lucide-react';

export default function AlertsPage() {
    const { allAlerts, fleet } = useFleet();

    const currentAlerts: any[] = [];
    for (const v of fleet) {
        if (v.alerts && v.alerts.length > 0) {
            for (const alert of v.alerts) {
                currentAlerts.push({ ...alert, vehicle_name: v.info?.name || v.id, live: true });
            }
        }
        if (v.anomalies && v.anomalies.length > 0) {
            for (const anomaly of v.anomalies) {
                currentAlerts.push({
                    id: `anom-${v.id}-${anomaly.param}`,
                    severity: anomaly.severity === 'extreme' ? 'danger' : 'warning',
                    param: anomaly.param,
                    label: anomaly.label,
                    message: `Z-Score anomaly: ${anomaly.label} (z=${anomaly.zScore}, value=${anomaly.value})`,
                    vehicle_name: v.info?.name || v.id,
                    timestamp: Date.now() / 1000,
                    live: true,
                    isAnomaly: true,
                });
            }
        }
    }

    const combined = [...currentAlerts, ...allAlerts.slice(0, 50)];

    const getSeverityStyle = (severity: string) => {
        if (severity === 'danger') return { bg: '#fef2f2', border: '#fecaca', icon: '#ef4444' };
        if (severity === 'critical') return { bg: '#fff8eb', border: '#fde68a', icon: '#F5A623' };
        if (severity === 'warning') return { bg: '#fff8eb', border: '#fde68a', icon: '#F5A623' };
        return { bg: '#f0f9ff', border: '#bae6fd', icon: '#3478F6' };
    };

    return (
        <div className="page">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1e293b' }}>Alerts</h1>
                <span className="badge badge-danger">{combined.length} total</span>
            </div>
            <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 20 }}>Real-time alerts from Rule Engine + Anomaly Detection</p>

            {combined.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
                    <Shield size={48} color="#22c55e" style={{ margin: '0 auto 12px' }} />
                    <p style={{ fontSize: 16, fontWeight: 600 }}>All Clear</p>
                    <p style={{ fontSize: 13, marginTop: 4 }}>No alerts detected. Your fleet is healthy.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {combined.map((alert, i) => {
                        const style = getSeverityStyle(alert.severity);
                        return (
                            <div key={alert.id || i} style={{
                                background: style.bg, border: `1px solid ${style.border}`,
                                borderRadius: 12, padding: '12px 14px',
                                display: 'flex', gap: 10, alignItems: 'flex-start',
                                animation: alert.live ? 'slideUp 0.3s ease-out' : undefined,
                            }}>
                                {alert.isAnomaly ?
                                    <Zap size={18} color={style.icon} style={{ marginTop: 2, flexShrink: 0 }} /> :
                                    <AlertTriangle size={18} color={style.icon} style={{ marginTop: 2, flexShrink: 0 }} />
                                }
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                        <p style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{alert.vehicle_name || alert.label}</p>
                                        {alert.live && (
                                            <span style={{ fontSize: 9, fontWeight: 700, color: '#ef4444', background: '#fee2e2', padding: '2px 6px', borderRadius: 4 }}>LIVE</span>
                                        )}
                                    </div>
                                    <p style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{alert.message}</p>
                                    {alert.timestamp && (
                                        <p style={{ fontSize: 10, color: '#94a3b8', marginTop: 4 }}>
                                            {new Date(alert.timestamp * 1000).toLocaleTimeString()}
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
