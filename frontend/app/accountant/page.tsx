'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { IndianRupee, ArrowUpRight, ArrowDownRight, Clock, MapPin, CheckCircle, AlertCircle, FileText } from 'lucide-react';

export default function AccountantDashboard() {
    const router = useRouter();
    const [dateString, setDateString] = useState('');

    useEffect(() => {
        setDateString(new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
    }, []);

    const recentActivity = [
        { id: 1, text: '₹45,000 fee collected (Main Campus)', time: '1 hour ago', type: 'collection' },
        { id: 2, text: 'Receipt #RCP-1042 generated', time: '2 hours ago', type: 'receipt' },
        { id: 3, text: 'Term 1 Dues reminder sent to 45 parents', time: '3 hours ago', type: 'notification' },
        { id: 4, text: '₹12,500 pending payment cleared', time: '1 day ago', type: 'collection' }
    ];

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Header Area */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.25rem' }}>Good Morning, Accountant 👋</h1>
                    <p style={{ color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Clock size={16} /> {dateString}
                    </p>
                </div>
            </div>

            {/* Top KPI Widgets */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '1.5rem', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '0.75rem', borderRadius: '1rem' }}>
                            <IndianRupee size={24} color="#10B981" />
                        </div>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#10B981', fontSize: '0.875rem', fontWeight: 600, backgroundColor: 'rgba(16,185,129,0.1)', padding: '0.25rem 0.5rem', borderRadius: '999px' }}>
                            <ArrowUpRight size={14} /> +12.5%
                        </span>
                    </div>
                    <div>
                        <h3 style={{ color: '#9CA3AF', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>Today's Collections</h3>
                        <p style={{ fontSize: '2rem', fontWeight: 800 }}>₹1,45,000</p>
                    </div>
                </div>

                <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '1.5rem', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: '1rem' }}>
                            <AlertCircle size={24} color="#EF4444" />
                        </div>
                    </div>
                    <div>
                        <h3 style={{ color: '#9CA3AF', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>Outstanding Dues</h3>
                        <p style={{ fontSize: '2rem', fontWeight: 800 }}>₹8,50,000</p>
                    </div>
                </div>

                <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '1.5rem', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: '0.75rem', borderRadius: '1rem' }}>
                            <FileText size={24} color="#F59E0B" />
                        </div>
                    </div>
                    <div>
                        <h3 style={{ color: '#9CA3AF', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>Pending Payments</h3>
                        <p style={{ fontSize: '2rem', fontWeight: 800 }}>45</p>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
                
                {/* Finance Overview */}
                <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '1.5rem', padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.5rem' }}>Collection Trend (Mock)</h3>
                    <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
                        {[40, 70, 45, 90, 65, 100, 80].map((h, i) => (
                            <div key={i} style={{ flex: 1, backgroundColor: '#10B981', height: `${h}%`, borderRadius: '4px 4px 0 0', opacity: 0.8 }}></div>
                        ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', color: '#9CA3AF', fontSize: '0.75rem' }}>
                        <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                    </div>
                </div>

                {/* Recent Finance Activity */}
                <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '1.5rem', padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.5rem' }}>Financial Activity</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {recentActivity.map(act => (
                            <div key={act.id} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                <div style={{ marginTop: '0.25rem', color: '#10B981' }}>
                                    <CheckCircle size={16} />
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#E5E7EB' }}>{act.text}</p>
                                    <p style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: '0.25rem' }}>{act.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
