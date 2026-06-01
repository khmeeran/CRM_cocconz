'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE } from '../lib/api';

export default function AdminDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const role = localStorage.getItem('user_role');
        if (!role) {
            router.push('/login');
            return;
        }

        async function fetchStats() {
            try {
                const res = await fetch(`${API_BASE}/api/dashboard`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access_token')}` // Placeholder, actually using cookies
                    },
                    credentials: 'include'
                });
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                } else if (res.status === 401) {
                    router.push('/login');
                }
            } catch (err) {
                console.error('Failed to fetch stats', err);
            } finally {
                setLoading(false);
            }
        }

        fetchStats();
    }, [router]);

    const handleLogout = async () => {
        try {
            await fetch(`${API_BASE}/api/logout`, { method: 'POST', credentials: 'include' });
        } catch (e) {}
        localStorage.removeItem('user_role');
        router.push('/login');
    };

    if (loading) return <div className="mesh-bg min-h-screen flex items-center justify-center">Loading Systems...</div>;

    return (
        <div className="mesh-bg min-h-screen p-8">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 900 }}>COMMAND <span style={{ color: 'var(--indigo-400)' }}>CENTER</span></h1>
                    <p style={{ color: 'var(--gray-400)' }}>Cocoonz OS Beta v1.0.0</p>
                </div>
                <button onClick={handleLogout} className="btn-primary" style={{ width: 'auto', padding: '0.75rem 1.5rem' }}>
                    Logout
                </button>
            </header>

            <main style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
                <div className="premium-card">
                    <h3 style={{ color: 'var(--gray-400)', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>Total Students</h3>
                    <p style={{ fontSize: '2.5rem', fontWeight: 900 }}>{stats?.total_students || 0}</p>
                </div>
                <div className="premium-card">
                    <h3 style={{ color: 'var(--gray-400)', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>Today's Attendance</h3>
                    <p style={{ fontSize: '2.5rem', fontWeight: 900 }}>{stats?.attendance_percentage || 0}%</p>
                </div>
                <div className="premium-card">
                    <h3 style={{ color: 'var(--gray-400)', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>Pending Fees</h3>
                    <p style={{ fontSize: '2.5rem', fontWeight: 900, color: '#f87171' }}>₹{stats?.total_pending_fees?.toLocaleString() || 0}</p>
                </div>
            </main>

            <section style={{ marginTop: '4rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '2rem' }}>Quick Access Modules</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                    {['Students', 'Attendance', 'Fees', 'Staff', 'Transport', 'Exams'].map(module => (
                        <div key={module} className="premium-card" style={{ padding: '1.5rem', textAlign: 'center', cursor: 'pointer', transition: 'transform 0.2s' }} 
                             onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'}
                             onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                            <p style={{ fontWeight: 700 }}>{module}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
