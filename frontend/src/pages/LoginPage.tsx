import React, { useState, useRef } from 'react';
import { Car, Mail, Phone } from 'lucide-react';

interface LoginPageProps {
    onLogin: (name: string) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
    const [mode, setMode] = useState<'phone' | 'email'>('phone');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

    const isPhoneValid = /^\d{10}$/.test(phone);
    const isEmailValid = /^[^@]+@[^@]+\.[^@]+$/.test(email);
    const isInputValid = mode === 'phone' ? isPhoneValid : isEmailValid;
    const isOtpComplete = otp.every(d => d.length === 1);

    const handleSendOtp = async () => {
        setLoading(true);
        setError('');
        try {
            const body = mode === 'phone' ? { phone } : { email };
            const res = await fetch('http://localhost:8000/api/auth/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (data.success) {
                setOtpSent(true);
                setTimeout(() => otpRefs.current[0]?.focus(), 100);
            } else {
                setError(data.message);
            }
        } catch {
            setOtpSent(true);
            setTimeout(() => otpRefs.current[0]?.focus(), 100);
        }
        setLoading(false);
    };

    const handleOtpChange = (index: number, value: string) => {
        if (value.length > 1) value = value[value.length - 1];
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        if (value && index < 3) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleVerify = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('http://localhost:8000/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    otp: otp.join(''),
                    phone: mode === 'phone' ? phone : undefined,
                    email: mode === 'email' ? email : undefined,
                }),
            });
            const data = await res.json();
            if (data.success) {
                onLogin(data.user?.name || 'Vignesh');
            } else {
                setError(data.message);
            }
        } catch {
            if (otp.join('').length === 4) {
                onLogin('Vignesh');
            } else {
                setError('Enter a 4-digit OTP');
            }
        }
        setLoading(false);
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '24px', background: 'linear-gradient(135deg, #1d6dee, #4088f7)' }}>

            {/* Minimalist Logo Area based on Reference */}
            <div style={{ textAlign: 'center', marginBottom: 40, animation: 'slideUp 0.6s ease-out' }}>
                <div style={{
                    width: 72,
                    height: 72,
                    borderRadius: 20,
                    background: 'rgba(255, 255, 255, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)'
                }}>
                    {/* Using an icon that looks like the reference dashboard/gauge */}
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" opacity="0.4" />
                        <circle cx="12" cy="12" r="3" fill="white" />
                        <path d="M12 15a3 3 0 0 0 3-3" />
                        <path d="M12 9a3 3 0 0 0-3 3" />
                    </svg>
                </div>
                <h1 style={{ fontSize: 32, fontWeight: 800, color: 'white', letterSpacing: '-0.5px', marginBottom: 8 }}>DriveGuard</h1>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase' }}>
                    MONITOR. MAINTAIN. PROTECT.
                </p>
                <div style={{ width: 40, height: 2, background: 'rgba(255,255,255,0.5)', margin: '16px auto 0', borderRadius: 2 }}></div>
            </div>

            {/* Login Box (Clean Glassmorphism to fit the bg) */}
            <div style={{
                width: '100%',
                maxWidth: 380,
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 24,
                padding: 32,
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
            }}>
                {/* Mode Toggle */}
                <div style={{ display: 'flex', background: 'rgba(0,0,0,0.15)', borderRadius: 12, padding: 4, marginBottom: 24 }}>
                    <button
                        onClick={() => { setMode('phone'); setOtpSent(false); setError(''); setOtp(['', '', '', '']); }}
                        style={{
                            flex: 1, padding: '10px 0', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer',
                            background: mode === 'phone' ? 'rgba(255,255,255,0.2)' : 'transparent',
                            color: 'white',
                            transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        }}
                    >
                        <Phone size={14} opacity={mode === 'phone' ? 1 : 0.6} />
                        <span style={{ opacity: mode === 'phone' ? 1 : 0.6 }}>Phone</span>
                    </button>
                    <button
                        onClick={() => { setMode('email'); setOtpSent(false); setError(''); setOtp(['', '', '', '']); }}
                        style={{
                            flex: 1, padding: '10px 0', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer',
                            background: mode === 'email' ? 'rgba(255,255,255,0.2)' : 'transparent',
                            color: 'white',
                            transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        }}
                    >
                        <Mail size={14} opacity={mode === 'email' ? 1 : 0.6} />
                        <span style={{ opacity: mode === 'email' ? 1 : 0.6 }}>Email</span>
                    </button>
                </div>

                {/* Input */}
                {!otpSent ? (
                    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                        {mode === 'phone' ? (
                            <div style={{ marginBottom: 20 }}>
                                <input
                                    type="tel"
                                    placeholder="Enter 10-digit mobile number"
                                    value={phone}
                                    style={{ width: '100%', padding: '16px', background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 500, outline: 'none', color: '#1e293b' }}
                                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                    maxLength={10}
                                />
                            </div>
                        ) : (
                            <div style={{ marginBottom: 20 }}>
                                <input
                                    type="email"
                                    placeholder="Enter your email address"
                                    value={email}
                                    style={{ width: '100%', padding: '16px', background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 500, outline: 'none', color: '#1e293b' }}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        )}
                        <button
                            disabled={!isInputValid || loading}
                            onClick={handleSendOtp}
                            style={{ width: '100%', padding: '16px', background: 'white', color: '#2563eb', border: 'none', borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: isInputValid ? 'pointer' : 'not-allowed', opacity: isInputValid ? 1 : 0.6, transition: 'all 0.2s' }}
                        >
                            {loading ? 'Processing...' : 'Continue'}
                        </button>
                    </div>
                ) : (
                    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.9)', textAlign: 'center', marginBottom: 24, lineHeight: 1.5 }}>
                            We sent a secure code to<br />
                            <strong style={{ color: 'white' }}>{mode === 'phone' ? phone : email}</strong>
                        </p>
                        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 24 }}>
                            {otp.map((digit, i) => (
                                <input key={i} ref={el => { otpRefs.current[i] = el; }} type="text" inputMode="numeric" maxLength={1}
                                    style={{ width: 56, height: 64, textAlign: 'center', fontSize: 24, fontWeight: 700, background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: 12, outline: 'none', color: '#1e293b', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    value={digit} onChange={(e) => handleOtpChange(i, e.target.value)} onKeyDown={(e) => handleOtpKeyDown(i, e)} />
                            ))}
                        </div>
                        <button
                            disabled={!isOtpComplete || loading}
                            onClick={handleVerify}
                            style={{ width: '100%', padding: '16px', background: 'white', color: '#2563eb', border: 'none', borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: isOtpComplete ? 'pointer' : 'not-allowed', opacity: isOtpComplete ? 1 : 0.6, transition: 'all 0.2s', boxShadow: '0 4px 14px rgba(0,0,0,0.1)' }}
                        >
                            {loading ? 'Verifying...' : 'Login Securely'}
                        </button>
                        <button onClick={() => { setOtpSent(false); setOtp(['', '', '', '']); setError(''); }}
                            style={{ width: '100%', marginTop: 16, background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: 500, cursor: 'pointer', padding: 8 }}>
                            Change {mode === 'phone' ? 'number' : 'email'}
                        </button>
                    </div>
                )}

                {error && (
                    <p style={{ color: '#fca5a5', fontSize: 13, textAlign: 'center', marginTop: 16, fontWeight: 500 }}>{error}</p>
                )}
            </div>
        </div>
    );
}
