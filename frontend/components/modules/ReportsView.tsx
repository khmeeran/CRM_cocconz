'use client';

import { useState, useEffect } from 'react';
import { Download, FileText, Calendar, Building, Users, AlertCircle, BarChart2 } from 'lucide-react';
import { API_BASE } from '@/lib/api';

type Tab = 'Daily' | 'Monthly' | 'Branch' | 'Outstanding' | 'Students';

export default function ReportsPage() {
    const [activeTab, setActiveTab] = useState<Tab>('Daily');
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Filters
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());

    const getHeaders = () => {
        return { 'Content-Type': 'application/json' };
    };

    const fetchReport = async () => {
        setIsLoading(true);
        try {
            let url = '';
            if (activeTab === 'Daily') url = `${API_BASE}/api/reports/daily?date_str=${date}`;
            else if (activeTab === 'Monthly') url = `${API_BASE}/api/reports/monthly?year=${year}&month=${month}`;
            else if (activeTab === 'Branch') url = `${API_BASE}/api/reports/branch`;
            else if (activeTab === 'Outstanding') url = `${API_BASE}/api/reports/outstanding`;
            else if (activeTab === 'Students') url = `${API_BASE}/api/reports/students`;

            const res = await fetch(url, {
      credentials: 'include', headers: getHeaders() });
            if (res.ok) {
                setData(await res.json());
            } else {
                setData(null);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, [activeTab, date, month, year]);

    const handleExport = async (format: 'pdf' | 'excel') => {
        try {
            let url = '';
            if (activeTab === 'Daily') url = `${API_BASE}/api/reports/daily?date_str=${date}&export=${format}`;
            else if (activeTab === 'Monthly') url = `${API_BASE}/api/reports/monthly?year=${year}&month=${month}&export=${format}`;
            else if (activeTab === 'Branch') url = `${API_BASE}/api/reports/branch?export=${format}`;
            else if (activeTab === 'Outstanding') url = `${API_BASE}/api/reports/outstanding?export=${format}`;
            else if (activeTab === 'Students') url = `${API_BASE}/api/reports/students?export=${format}`;
            const res = await fetch(url, {
      credentials: 'include' });
            
            if (res.ok) {
                const blob = await res.blob();
                const objUrl = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = objUrl;
                a.download = `${activeTab}_Report.${format === 'excel' ? 'xlsx' : 'pdf'}`;
                document.body.appendChild(a);
                a.click();
                a.remove();
            } else {
                alert("Export failed");
            }
        } catch (e) {
            console.error(e);
        }
    };

    const tabs = [
        { id: 'Daily', icon: <Calendar size={18} /> },
        { id: 'Monthly', icon: <BarChart2 size={18} /> },
        { id: 'Branch', icon: <Building size={18} /> },
        { id: 'Outstanding', icon: <AlertCircle size={18} /> },
        { id: 'Students', icon: <Users size={18} /> },
    ] as const;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
            {/* Breadcrumb */}
            <div style={{ fontSize: '0.875rem', color: '#9CA3AF', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span>Admin</span>
                <span>/</span>
                <span style={{ color: 'white', fontWeight: 500 }}>Reports</span>
            </div>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 800 }}>Reporting Center</h1>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button onClick={() => handleExport('excel')} style={{ backgroundColor: '#10B981', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <FileText size={16} /> Export Excel
                    </button>
                    <button onClick={() => handleExport('pdf')} style={{ backgroundColor: '#EF4444', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <Download size={16} /> Export PDF
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', overflowX: 'auto', paddingBottom: '2px' }}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            background: 'none', border: 'none', cursor: 'pointer', padding: '0.75rem 1.25rem', fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem',
                            color: activeTab === tab.id ? '#3B82F6' : '#9CA3AF',
                            borderBottom: activeTab === tab.id ? '2px solid #3B82F6' : '2px solid transparent',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {tab.icon} {tab.id}
                    </button>
                ))}
            </div>

            {/* Filters row (contextual) */}
            <div style={{ display: 'flex', gap: '1rem', backgroundColor: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                {activeTab === 'Daily' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <label style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>Date:</label>
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.5rem', borderRadius: '0.5rem', outline: 'none' }} />
                    </div>
                )}
                {activeTab === 'Monthly' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <label style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>Month:</label>
                            <select value={month} onChange={e => setMonth(Number(e.target.value))} style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.5rem', borderRadius: '0.5rem', outline: 'none' }}>
                                {[...Array(12)].map((_, i) => <option key={i+1} value={i+1}>{i+1}</option>)}
                            </select>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <label style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>Year:</label>
                            <input type="number" value={year} onChange={e => setYear(Number(e.target.value))} style={{ width: '80px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.5rem', borderRadius: '0.5rem', outline: 'none' }} />
                        </div>
                    </div>
                )}
                {['Branch', 'Outstanding', 'Students'].includes(activeTab) && (
                    <span style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>Viewing real-time report metrics.</span>
                )}
            </div>

            {/* Content Area */}
            {isLoading ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: '#9CA3AF' }}>Loading report...</div>
            ) : data ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Summary Widgets */}
                    {(data.summary || activeTab === 'Branch') && (
                        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                            {Object.entries(data.summary || data).map(([key, value]: any) => (
                                <div key={key} style={{ flex: 1, minWidth: '200px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '1rem', padding: '1.5rem' }}>
                                    <div style={{ color: '#9CA3AF', fontSize: '0.875rem', textTransform: 'capitalize', marginBottom: '0.5rem' }}>{key.replace(/_/g, ' ')}</div>
                                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'white' }}>{typeof value === 'number' && key.includes('amount') || key.includes('total_col') || key.includes('outstand') ? `₹${value.toLocaleString()}` : value}</div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Data Table */}
                    {(data.data || Array.isArray(data)) && (
                        <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', overflow: 'hidden', overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: '#9CA3AF', fontSize: '0.875rem' }}>
                                        {Object.keys((data.data || data)[0] || {}).map(k => (
                                            <th key={k} style={{ padding: '1rem', fontWeight: 600 }}>{k}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {(data.data || data).map((row: any, i: number) => (
                                        <tr key={i} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                            {Object.values(row).map((v: any, j) => (
                                                <td key={j} style={{ padding: '1rem', color: 'white', fontSize: '0.875rem' }}>{v}</td>
                                            ))}
                                        </tr>
                                    ))}
                                    {(data.data || data).length === 0 && (
                                        <tr><td colSpan={10} style={{ padding: '2rem', textAlign: 'center', color: '#9CA3AF' }}>No data found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            ) : (
                <div style={{ padding: '3rem', textAlign: 'center', color: '#EF4444' }}>Failed to load report data.</div>
            )}
        </div>
    );
}
