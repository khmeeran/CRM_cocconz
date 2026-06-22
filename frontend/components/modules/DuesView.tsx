'use client';

import { useState, useEffect } from 'react';
import { Search, AlertCircle, Clock, CheckCircle, Wallet, Users, BarChart3, ChevronRight, Filter } from 'lucide-react';
import { API_BASE } from '@/lib/api';
import Link from 'next/link';

interface DueSummary {
    total_outstanding: number;
    total_overdue: number;
    students_with_dues: number;
    recovery_percentage: number;
}

interface DueRecord {
    assignment_id: string;
    student_id: string;
    student_name: string;
    roll_no: string;
    branch: string;
    class_name: string;
    fee_head: string;
    final_amount: number;
    amount_paid: number;
    balance: number;
    status: string;
    due_date: string | null;
}

export default function DuesPage() {
    const [summary, setSummary] = useState<DueSummary | null>(null);
    const [dues, setDues] = useState<DueRecord[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [filterClass, setFilterClass] = useState('ALL');
    const [isLoading, setIsLoading] = useState(true);

    const getHeaders = () => {
        const token = document.cookie.split('; ').find(row => row.startsWith('access_token='))?.split('=')[1];
        return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
    };

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [sumRes, duesRes] = await Promise.all([
                    fetch(`${API_BASE}/api/dues/summary`, { headers: getHeaders() }),
                    fetch(`${API_BASE}/api/dues`, { headers: getHeaders() })
                ]);
                
                if (sumRes.ok) setSummary(await sumRes.json());
                if (duesRes.ok) setDues(await duesRes.json());
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredDues = dues.filter(d => {
        const matchSearch = d.student_name.toLowerCase().includes(searchQuery.toLowerCase()) || d.roll_no.toLowerCase().includes(searchQuery.toLowerCase());
        const matchStatus = filterStatus === 'ALL' || d.status === filterStatus;
        const matchClass = filterClass === 'ALL' || d.class_name === filterClass;
        return matchSearch && matchStatus && matchClass;
    });

    const uniqueClasses = Array.from(new Set(dues.map(d => d.class_name)));

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
            {/* Breadcrumb */}
            <div style={{ fontSize: '0.875rem', color: '#9CA3AF', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span>Admin</span>
                <span>/</span>
                <span style={{ color: 'white', fontWeight: 500 }}>Due Management</span>
            </div>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 800 }}>Due Management</h1>
            </div>

            {/* Dashboard Widgets */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '1rem', padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.2)', padding: '0.5rem', borderRadius: '0.5rem' }}><Clock size={20} color="#F59E0B" /></div>
                        <span style={{ color: '#F59E0B', fontWeight: 600 }}>Total Outstanding</span>
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: 'white' }}>₹{summary?.total_outstanding.toLocaleString() || '0'}</div>
                </div>

                <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '1rem', padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', padding: '0.5rem', borderRadius: '0.5rem' }}><AlertCircle size={20} color="#EF4444" /></div>
                        <span style={{ color: '#EF4444', fontWeight: 600 }}>Total Overdue</span>
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: 'white' }}>₹{summary?.total_overdue.toLocaleString() || '0'}</div>
                </div>

                <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '1rem', padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)', padding: '0.5rem', borderRadius: '0.5rem' }}><Users size={20} color="#3B82F6" /></div>
                        <span style={{ color: '#3B82F6', fontWeight: 600 }}>Students w/ Dues</span>
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: 'white' }}>{summary?.students_with_dues || '0'}</div>
                </div>

                <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '1rem', padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', padding: '0.5rem', borderRadius: '0.5rem' }}><BarChart3 size={20} color="#10B981" /></div>
                        <span style={{ color: '#10B981', fontWeight: 600 }}>Recovery %</span>
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: 'white' }}>{summary?.recovery_percentage || '0'}%</div>
                </div>
            </div>

            {/* Filters Bar */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', backgroundColor: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '0.5rem', padding: '0 0.75rem', flex: 1, minWidth: '200px' }}>
                    <Search size={16} color="#9CA3AF" />
                    <input 
                        type="text" 
                        placeholder="Search student..." 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        style={{ background: 'none', border: 'none', color: 'white', padding: '0.75rem', outline: 'none', width: '100%' }} 
                    />
                </div>
                
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.75rem', borderRadius: '0.5rem', outline: 'none', minWidth: '150px' }}>
                    <option value="ALL">All Status</option>
                    <option value="PAID">Paid</option>
                    <option value="PARTIAL">Partial</option>
                    <option value="OVERDUE">Overdue</option>
                </select>

                <select value={filterClass} onChange={e => setFilterClass(e.target.value)} style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.75rem', borderRadius: '0.5rem', outline: 'none', minWidth: '150px' }}>
                    <option value="ALL">All Classes</option>
                    {uniqueClasses.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>

            {/* Main Table */}
            <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: '#9CA3AF', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Student</th>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Branch & Class</th>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Fee Head</th>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Total</th>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Paid</th>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Balance</th>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Status</th>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan={8} style={{ padding: '2rem', textAlign: 'center', color: '#9CA3AF' }}>Loading...</td></tr>
                            ) : filteredDues.length === 0 ? (
                                <tr><td colSpan={8} style={{ padding: '2rem', textAlign: 'center', color: '#9CA3AF' }}>No assignments found.</td></tr>
                            ) : filteredDues.map(d => (
                                <tr key={d.assignment_id} style={{ borderTop: '1px solid rgba(255,255,255,0.05)', transition: 'background-color 0.2s' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                                    <td style={{ padding: '1rem 1.5rem', color: 'white' }}>
                                        <div style={{ fontWeight: 500 }}>{d.student_name}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{d.roll_no}</div>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', color: '#9CA3AF', fontSize: '0.875rem' }}>{d.branch} • {d.class_name}</td>
                                    <td style={{ padding: '1rem 1.5rem', color: '#9CA3AF', fontSize: '0.875rem' }}>{d.fee_head}</td>
                                    <td style={{ padding: '1rem 1.5rem', color: 'white' }}>₹{d.final_amount.toLocaleString()}</td>
                                    <td style={{ padding: '1rem 1.5rem', color: '#10B981' }}>₹{d.amount_paid.toLocaleString()}</td>
                                    <td style={{ padding: '1rem 1.5rem', color: d.balance > 0 ? '#EF4444' : '#10B981', fontWeight: 600 }}>₹{d.balance.toLocaleString()}</td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        {d.status === 'PAID' && <span style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10B981', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 600 }}>PAID</span>}
                                        {d.status === 'PARTIAL' && <span style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 600 }}>PARTIAL</span>}
                                        {d.status === 'OVERDUE' && <span style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 600 }}>OVERDUE</span>}
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                            {d.balance > 0 ? (
                                                <Link href="/admin/collections" style={{ backgroundColor: '#0066FF', color: 'white', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>Collect <ChevronRight size={16} /></Link>
                                            ) : (
                                                <span style={{ color: '#10B981', fontSize: '0.875rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '0.5rem' }}><CheckCircle size={16}/> Cleared</span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
