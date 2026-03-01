import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Grid3X3, Bell, User, Activity, Wifi, WifiOff } from 'lucide-react';
import { useFleet } from '../App';

export function DesktopNav() {
    const navigate = useNavigate();
    const location = useLocation();
    const { mode, wsConnected } = useFleet();
    const path = location.pathname;

    const tabs = [
        { label: 'Home', icon: Home, path: '/' },
        { label: 'Vehicles', icon: Grid3X3, path: '/vehicles' },
        { label: 'Alerts', icon: Bell, path: '/alerts' },
        { label: 'Profile', icon: User, path: '/profile' },
    ];

    const isActive = (tabPath: string) => {
        if (tabPath === '/') return path === '/';
        return path.startsWith(tabPath);
    };

    return (
        <nav className="desktop-nav">
            <div className="desktop-nav-logo">
                <Activity size={22} />
            </div>
            {tabs.map(tab => (
                <button
                    key={tab.label}
                    className={isActive(tab.path) ? 'active' : ''}
                    onClick={() => navigate(tab.path)}
                    title={tab.label}
                >
                    <tab.icon size={20} />
                </button>
            ))}
            <div className="desktop-nav-status">
                {wsConnected ? <Wifi size={14} color="#22c55e" /> : <WifiOff size={14} color="#ef4444" />}
            </div>
        </nav>
    );
}

export function MobileNav() {
    const navigate = useNavigate();
    const location = useLocation();
    const path = location.pathname;

    const tabs = [
        { label: 'Home', icon: Home, path: '/' },
        { label: 'Vehicles', icon: Grid3X3, path: '/vehicles' },
        { label: 'Alerts', icon: Bell, path: '/alerts' },
        { label: 'Profile', icon: User, path: '/profile' },
    ];

    const isActive = (tabPath: string) => {
        if (tabPath === '/') return path === '/';
        return path.startsWith(tabPath);
    };

    return (
        <div className="bottom-nav">
            {tabs.map(tab => (
                <button key={tab.label} className={isActive(tab.path) ? 'active' : ''} onClick={() => navigate(tab.path)}>
                    <tab.icon size={22} />
                    {tab.label}
                </button>
            ))}
        </div>
    );
}

export function ModeBadge() {
    const { mode } = useFleet();
    return (
        <div className={`mode-badge ${mode === 'LIVE' ? 'live' : 'sim'}`}>
            {mode === 'LIVE' ? (
                <><span className="status-dot status-dot-green" style={{ width: 6, height: 6, marginRight: 4 }}></span> LIVE</>
            ) : (
                <><span className="status-dot status-dot-orange" style={{ width: 6, height: 6, marginRight: 4 }}></span> SIM</>
            )}
        </div>
    );
}

export default function BottomNav() {
    return (
        <>
            <ModeBadge />
            <MobileNav />
        </>
    );
}
