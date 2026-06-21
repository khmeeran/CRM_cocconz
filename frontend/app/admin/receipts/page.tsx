'use client';

import { useState, useEffect } from 'react';
import { Search, FileText, Download, Printer, X, FileCheck } from 'lucide-react';
import { API_BASE } from '../../../lib/api';

interface Receipt {
    receipt_no: string;
    receipt_date: string;
    student_name: string;
    roll_no: string;
    branch: string;
    class_name: string;
    fee_head: string;
    amount_paid: number;
    balance_remaining: number;
    collected_by: string;
    payment_mode: string;
}

export default function ReceiptsPage() {
    const [receipts, setReceipts] = useState<Receipt[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);

    const getHeaders = () => {
        const token = document.cookie.split('; ').find(row => row.startsWith('access_token='))?.split('=')[1];
        return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
    };

    useEffect(() => {
        fetchReceipts();
    }, []);

    const fetchReceipts = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/receipts`, { headers: getHeaders() });
            if (res.ok) {
                setReceipts(await res.json());
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = async (receipt_no: string) => {
        try {
            const token = document.cookie.split('; ').find(row => row.startsWith('access_token='))?.split('=')[1];
            const res = await fetch(`${API_BASE}/api/receipt/${receipt_no}/pdf`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Receipt_${receipt_no}.pdf`;
                document.body.appendChild(a);
                a.click();
                a.remove();
            } else {
                alert("Failed to download PDF");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handlePrint = (receipt_no: string) => {
        const token = document.cookie.split('; ').find(row => row.startsWith('access_token='))?.split('=')[1];
        const url = `${API_BASE}/api/receipt/${receipt_no}/pdf`;
        
        fetch(url, { headers: { 'Authorization': `Bearer ${token}` } })
            .then(res => res.blob())
            .then(blob => {
                const blobUrl = URL.createObjectURL(blob);
                const iframe = document.createElement('iframe');
                iframe.style.display = 'none';
                iframe.src = blobUrl;
                document.body.appendChild(iframe);
                iframe.onload = () => {
                    iframe.contentWindow?.print();
                };
            })
            .catch(console.error);
    };

    const filteredReceipts = receipts.filter(r => 
        r.receipt_no?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        r.student_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.roll_no?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
            {/* Breadcrumb */}
            <div style={{ fontSize: '0.875rem', color: '#9CA3AF', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span>Admin</span>
                <span>/</span>
                <span style={{ color: 'white', fontWeight: 500 }}>Receipts</span>
            </div>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 800 }}>Receipt Manager</h1>
                <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '0.5rem', padding: '0 0.75rem', border: '1px solid rgba(255,255,255,0.1)', width: '300px' }}>
                    <Search size={16} color="#9CA3AF" />
                    <input 
                        type="text" 
                        placeholder="Search by receipt no or student..." 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        style={{ background: 'none', border: 'none', color: 'white', padding: '0.75rem', outline: 'none', width: '100%' }} 
                    />
                </div>
            </div>

            {/* List Grid */}
            <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: '#9CA3AF', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Receipt No</th>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Date</th>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Student</th>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Fee Head</th>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Amount</th>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#9CA3AF' }}>Loading...</td></tr>
                            ) : filteredReceipts.length === 0 ? (
                                <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#9CA3AF' }}>No receipts found.</td></tr>
                            ) : filteredReceipts.map(r => (
                                <tr key={r.receipt_no} style={{ borderTop: '1px solid rgba(255,255,255,0.05)', transition: 'background-color 0.2s' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                                    <td style={{ padding: '1rem 1.5rem', fontWeight: 500, color: '#3B82F6' }}>{r.receipt_no}</td>
                                    <td style={{ padding: '1rem 1.5rem', color: '#9CA3AF', fontSize: '0.875rem' }}>{new Date(r.receipt_date).toLocaleDateString()}</td>
                                    <td style={{ padding: '1rem 1.5rem', color: 'white' }}>
                                        <div style={{ fontWeight: 500 }}>{r.student_name}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{r.roll_no} • {r.class_name}</div>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', color: '#9CA3AF', fontSize: '0.875rem' }}>{r.fee_head}</td>
                                    <td style={{ padding: '1rem 1.5rem', fontWeight: 600, color: '#10B981' }}>₹{r.amount_paid.toLocaleString()}</td>
                                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                            <button onClick={() => setSelectedReceipt(r)} style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', padding: '0.25rem' }} title="View Details"><FileText size={18} /></button>
                                            <button onClick={() => handleDownload(r.receipt_no)} style={{ background: 'none', border: 'none', color: '#3B82F6', cursor: 'pointer', padding: '0.25rem' }} title="Download PDF"><Download size={18} /></button>
                                            <button onClick={() => handlePrint(r.receipt_no)} style={{ background: 'none', border: 'none', color: '#10B981', cursor: 'pointer', padding: '0.25rem' }} title="Print"><Printer size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Receipt Modal */}
            {selectedReceipt && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
                    <div style={{ width: '100%', maxWidth: '500px', backgroundColor: '#101D42', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <FileCheck size={24} color="#3B82F6" />
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Receipt Details</h2>
                            </div>
                            <button onClick={() => setSelectedReceipt(null)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }}><X size={20} /></button>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem', backgroundColor: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>Receipt No</div>
                                <div style={{ fontWeight: 600, color: 'white' }}>{selectedReceipt.receipt_no}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>Date</div>
                                <div style={{ fontWeight: 600, color: 'white' }}>{new Date(selectedReceipt.receipt_date).toLocaleString()}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>Student Name</div>
                                <div style={{ fontWeight: 600, color: 'white' }}>{selectedReceipt.student_name}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>Admission No</div>
                                <div style={{ fontWeight: 600, color: 'white' }}>{selectedReceipt.roll_no}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>Class & Branch</div>
                                <div style={{ fontWeight: 600, color: 'white' }}>{selectedReceipt.class_name} • {selectedReceipt.branch}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>Payment Mode</div>
                                <div style={{ fontWeight: 600, color: 'white' }}>{selectedReceipt.payment_mode}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>Fee Head</div>
                                <div style={{ fontWeight: 600, color: 'white' }}>{selectedReceipt.fee_head}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>Collected By</div>
                                <div style={{ fontWeight: 600, color: 'white' }}>{selectedReceipt.collected_by}</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                            <div>
                                <div style={{ fontSize: '0.875rem', color: '#10B981', fontWeight: 600 }}>Amount Paid</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>₹{selectedReceipt.amount_paid.toLocaleString()}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>Balance Remaining</div>
                                <div style={{ fontSize: '1rem', fontWeight: 600, color: '#EF4444' }}>₹{selectedReceipt.balance_remaining.toLocaleString()}</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                            <button onClick={() => handlePrint(selectedReceipt.receipt_no)} style={{ backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.5rem 1.5rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Printer size={16} /> Print</button>
                            <button onClick={() => handleDownload(selectedReceipt.receipt_no)} style={{ backgroundColor: '#0066FF', border: 'none', color: 'white', padding: '0.5rem 1.5rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Download size={16} /> Download PDF</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
