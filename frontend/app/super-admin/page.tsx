'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { IndianRupee, Users, ArrowUpRight, ArrowDownRight, Clock, MapPin, TrendingUp, CheckCircle, Plus, AlertCircle } from 'lucide-react';

export default function AdminDashboard() {
    const router = useRouter();
    const [dateString, setDateString] = useState('');
    const userRole = 'ADMIN';

    useEffect(() => {
        setDateString(new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
        
    }, []);

    const recentActivity = [
        { id: 1, text: 'Arjun M. admitted to Grade 4', time: '10 mins ago', type: 'admission' },
        { id: 2, text: '₹45,000 fee collected (Main Campus)', time: '1 hour ago', type: 'collection' },
        { id: 3, text: 'Term 1 Dues reminder sent to 45 parents', time: '3 hours ago', type: 'notification' },
        { id: 4, text: 'New Branch "North Campus" activated', time: '1 day ago', type: 'system' }
    ];

    const pipeline = [
        { stage: 'Enquiries', count: 145, color: '#9CA3AF' },
        { stage: 'Registered', count: 82, color: '#3B82F6' },
        { stage: 'Interview', count: 45, color: '#8B5CF6' },
        { stage: 'Admitted', count: 28, color: '#10B981' }
    ];

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Header Area */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.25rem' }}>Good Morning, Super Admin 👋</h1>
                    <p style={{ color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Clock size={16} /> {dateString}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.5rem 1rem', borderRadius: '0.5rem' }}>
                        <MapPin size={16} color="#0066FF" />
                        <select style={{ backgroundColor: 'transparent', border: 'none', color: 'white', outline: 'none', fontWeight: 600, cursor: 'pointer', appearance: 'none' }}>
                            <option value="all">All Branches</option>
                            <option value="main">Main Campus</option>
                            <option value="north">North Campus</option>
                        </select>
                    </div>
                    {true && (
                        <button type="button" onClick={() => router.push('/super-admin/admissions')} style={{ backgroundColor: '#0066FF', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 14px 0 rgba(0,102,255,0.39)' }}>
                            <Plus size={18} /> New Admission
                        </button>
                    )}
                </div>
            </div>

            {/* Top KPI Widgets */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {true && (
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
                )}

                {true && (
                    <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '1.5rem', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '0.75rem', borderRadius: '1rem' }}>
                                <Users size={24} color="#3B82F6" />
                            </div>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#3B82F6', fontSize: '0.875rem', fontWeight: 600, backgroundColor: 'rgba(59,130,246,0.1)', padding: '0.25rem 0.5rem', borderRadius: '999px' }}>
                                <TrendingUp size={14} /> +4 Today
                            </span>
                        </div>
                        <div>
                            <h3 style={{ color: '#9CA3AF', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>New Admissions</h3>
                            <p style={{ fontSize: '2rem', fontWeight: 800 }}>28</p>
                        </div>
                    </div>
                )}

                {true && (
                    <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '1.5rem', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: '1rem' }}>
                                <AlertCircle size={24} color="#EF4444" />
                            </div>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#EF4444', fontSize: '0.875rem', fontWeight: 600, backgroundColor: 'rgba(239,68,68,0.1)', padding: '0.25rem 0.5rem', borderRadius: '999px' }}>
                                <ArrowDownRight size={14} /> -2.4%
                            </span>
                        </div>
                        <div>
                            <h3 style={{ color: '#9CA3AF', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>Outstanding Dues</h3>
                            <p style={{ fontSize: '2rem', fontWeight: 800 }}>₹8,50,000</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Main Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
                
                {/* Finance Overview */}
                {true && (
                    <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '1.5rem', padding: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.5rem' }}>Collection Trend (Mock)</h3>
                        <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
                            {[40, 70, 45, 90, 65, 100, 80].map((h, i) => (
                                <div key={i} style={{ flex: 1, backgroundColor: '#0066FF', height: `${h}%`, borderRadius: '4px 4px 0 0', opacity: 0.8 }}></div>
                            ))}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', color: '#9CA3AF', fontSize: '0.75rem' }}>
                            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                        </div>
                    </div>
                )}

                {/* Admission Pipeline */}
                {true && (
                    <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '1.5rem', padding: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.5rem' }}>Admission Pipeline</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {pipeline.map((p, i) => (
                                <div key={i}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                                        <span>{p.stage}</span>
                                        <span style={{ fontWeight: 700 }}>{p.count}</span>
                                    </div>
                                    <div style={{ height: '8px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '999px', overflow: 'hidden' }}>
                                        <div style={{ width: `${(p.count/145)*100}%`, height: '100%', backgroundColor: p.color, borderRadius: '999px' }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Recent Activity */}
                <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '1.5rem', padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.5rem' }}>Recent Activity</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {recentActivity.map(act => (
                            <div key={act.id} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                <div style={{ marginTop: '0.25rem', color: '#0066FF' }}>
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
