'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { API_BASE } from '../../lib/api';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(false);
        setLoading(true);

        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);

        try {
            const response = await fetch(`${API_BASE}/token`, {
      credentials: 'include',
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('user_role', data.role);
                                if (data.role === 'ADMIN') router.push('/super-admin');
                else if (data.role === 'OFFICE') router.push('/branch-admin');
                else if (data.role === 'ACCOUNTANT') router.push('/accountant');
                else if (data.role === 'TEACHER') router.push('/teacher');
                else router.push('/login');
            } else {
                setError(true);
            }
        } catch (err) {
            console.error('Login failed', err);
            alert('Backend Connection Failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mesh-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
            <div style={{ width: '100%', maxWidth: '560px' }}>
                {/* Brand */}
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{ 
                        width: '4rem', 
                        height: '4rem', 
                        backgroundColor: 'var(--indigo-600)', 
                        borderRadius: '1.5rem', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        margin: '0 auto 1rem', 
                        boxShadow: '0 20px 25px -5px rgba(99, 102, 241, 0.2)',
                        transform: 'rotate(3deg)'
                    }}>
                        <span style={{ fontSize: '1.5rem', color: 'white' }}>L</span>
                    </div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 900, letterSpacing: '-0.025em' }}>
                        COCOONZ <span style={{ color: 'var(--indigo-400)' }}>OS</span>
                    </h1>
                    <p style={{ color: 'var(--gray-400)', fontSize: '0.875rem', fontWeight: 500, marginTop: '0.5rem' }}>
                        Next-Gen School Operating System
                    </p>
                </div>

                {/* Login Card */}
                <div className="premium-card">
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>
                        Authorized Personnel Only
                    </h2>
                    
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div>
                            <label style={{ fontSize: '0.625rem', fontWeight: 900, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.2em', display: 'block', marginBottom: '0.5rem', marginLeft: '0.25rem' }}>
                                Username
                            </label>
                            <input 
                                type="text" 
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="principal_admin" 
                                className="premium-input"
                                required 
                            />
                        </div>
                        
                        <div>
                            <label style={{ fontSize: '0.625rem', fontWeight: 900, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.2em', display: 'block', marginBottom: '0.5rem', marginLeft: '0.25rem' }}>
                                Secure Key
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••" 
                                    className="premium-input"
                                    required 
                                />
                                <button 
                                    type="button" 
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div style={{ color: '#f87171', fontSize: '0.75rem', textAlign: 'center' }}>
                                Invalid credentials. Access Denied.
                            </div>
                        )}

                        <div style={{ paddingTop: '1rem' }}>
                            <button 
                                type="submit" 
                                className="btn-primary"
                                disabled={loading}
                            >
                                {loading ? 'Processing...' : 'Enter Command Center'}
                            </button>
                        </div>
                    </form>
                    
                    <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                        <p style={{ fontSize: '0.625rem', color: 'var(--gray-600)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            Hardware ID: KH-2026-X1
                        </p>
                    </div>
                </div>

                <p style={{ textAlign: 'center', color: 'var(--gray-500)', fontSize: '0.75rem', marginTop: '2.5rem' }}>
                    © 2026 Cocoonz Intelligence Systems. <br />Design for Scale.
                </p>
            </div>
        </div>
    );
}
