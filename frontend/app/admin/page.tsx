'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE } from '../../lib/api';

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
                        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
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

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading Systems...</div>;

    const modules = [
        { name: 'Branches', path: '/admin/branches' },
        { name: 'Students', path: '/admin/students' },
        { name: 'Classes', path: '/admin/classes' },
        { name: 'Admissions', path: '/admin/admissions' },
        { name: 'Fee Structure', path: '/admin/fee-structure' },
        { name: 'Fee Collection', path: '/admin/collections' },
        { name: 'Receipts', path: '/admin/receipts' },
        { name: 'Dues Management', path: '/admin/dues' },
        { name: 'Reports', path: '/admin/reports' },
        { name: 'Users', path: '/admin/users' },
        { name: 'Notifications', path: '/admin/notifications' },
        { name: 'Settings', path: '/admin/settings' }
    ];

    return (
        <div className="p-8">
            <header style={{ marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 900 }}>DASHBOARD <span style={{ color: 'var(--electric-blue, #0066FF)' }}>SUMMARY</span></h1>
                <p style={{ color: 'var(--gray-400, #9CA3AF)' }}>Cocoonz ERP</p>
            </header>

            <main style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
                <div style={{ padding: '1.5rem', backgroundColor: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', boxShadow: '0 8px 32px 0 rgba(0,0,0,0.3)' }}>
                    <h3 style={{ color: 'var(--gray-400)', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>Total Collections</h3>
                    <p style={{ fontSize: '2.5rem', fontWeight: 900 }}>₹{stats?.total_collected?.toLocaleString() || 0}</p>
                </div>
                <div style={{ padding: '1.5rem', backgroundColor: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', boxShadow: '0 8px 32px 0 rgba(0,0,0,0.3)' }}>
                    <h3 style={{ color: 'var(--gray-400)', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>Total Dues</h3>
                    <p style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--danger-red, #EF4444)' }}>₹{stats?.total_pending_fees?.toLocaleString() || 0}</p>
                </div>
                <div style={{ padding: '1.5rem', backgroundColor: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', boxShadow: '0 8px 32px 0 rgba(0,0,0,0.3)' }}>
                    <h3 style={{ color: 'var(--gray-400)', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>Total Admissions</h3>
                    <p style={{ fontSize: '2.5rem', fontWeight: 900 }}>{stats?.total_students || 0}</p>
                </div>
            </main>

            <section>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '2rem' }}>Modules</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                    {modules.map(module => (
                        <div key={module.name} 
                             onClick={() => router.push(module.path)}
                             style={{ padding: '1.5rem', textAlign: 'center', cursor: 'pointer', transition: 'transform 0.2s', backgroundColor: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', boxShadow: '0 8px 32px 0 rgba(0,0,0,0.3)' }} 
                             onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'}
                             onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                            <p style={{ fontWeight: 700 }}>{module.name}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
