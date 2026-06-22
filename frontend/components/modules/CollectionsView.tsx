'use client';

import { useState, useEffect } from 'react';
import { Search, CreditCard, Clock, History, CheckCircle, Wallet, X } from 'lucide-react';
import { API_BASE } from '@/lib/api';

interface Student {
    id: string;
    name: string;
    roll_no: string;
    class_name: string;
}

interface OutstandingSummary {
    total_due: number;
    total_paid: number;
    total_balance: number;
    assignments: any[];
}

export default function CollectionsPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [outstanding, setOutstanding] = useState<OutstandingSummary | null>(null);
    const [ledger, setLedger] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Modal state
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [activeAssignment, setActiveAssignment] = useState<any>(null);
    const [paymentAmount, setPaymentAmount] = useState<number | ''>('');
    const [paymentMode, setPaymentMode] = useState('UPI');

    const getHeaders = () => {
        const token = document.cookie.split('; ').find(row => row.startsWith('access_token='))?.split('=')[1];
        return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
    };

    useEffect(() => {
        // Fetch all students for search
        fetch(`${API_BASE}/api/students`, { headers: getHeaders() })
            .then(r => r.json())
            .then(data => setStudents(data.map((s: any) => ({
                id: s.id, name: s.name, roll_no: s.roll_no, class_name: s.class_name || "Unknown"
            }))))
            .catch(console.error);
    }, []);

    useEffect(() => {
        if (selectedStudent) {
            loadStudentData(selectedStudent.id);
        } else {
            setOutstanding(null);
            setLedger([]);
        }
    }, [selectedStudent]);

    const loadStudentData = async (studentId: string) => {
        setIsLoading(true);
        try {
            const outRes = await fetch(`${API_BASE}/api/students/${studentId}/outstanding`, { headers: getHeaders() });
            const ledRes = await fetch(`${API_BASE}/api/students/${studentId}/ledger`, { headers: getHeaders() });
            if (outRes.ok) setOutstanding(await outRes.json());
            if (ledRes.ok) setLedger(await ledRes.json());
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const handleSelectStudent = (student: Student) => {
        setSelectedStudent(student);
        setSearchQuery('');
    };

    const openPaymentModal = (assignment: any) => {
        setActiveAssignment(assignment);
        setPaymentAmount(assignment.balance);
        setPaymentMode('UPI');
        setIsPaymentModalOpen(true);
    };

    const submitPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStudent || !activeAssignment) return;
        if (Number(paymentAmount) <= 0 || Number(paymentAmount) > activeAssignment.balance) {
            alert("Invalid amount. Must be > 0 and <= " + activeAssignment.balance);
            return;
        }

        try {
            const payload = {
                student_id: selectedStudent.id,
                assignment_id: activeAssignment.assignment_id,
                fee_head_id: activeAssignment.fee_head_id,
                amount: Number(paymentAmount),
                payment_mode: paymentMode
            };
            const res = await fetch(`${API_BASE}/api/collections`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                const data = await res.json();
                setIsPaymentModalOpen(false);
                alert(`Payment successful! Receipt: ${data.receipt_no}`);
                loadStudentData(selectedStudent.id); // reload
            } else {
                const err = await res.json();
                alert(err.detail);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const filteredSearch = searchQuery.length > 1 
        ? students.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || (s.roll_no && s.roll_no.toLowerCase().includes(searchQuery.toLowerCase())))
        : [];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
            {/* Breadcrumb */}
            <div style={{ fontSize: '0.875rem', color: '#9CA3AF', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span>Admin</span>
                <span>/</span>
                <span style={{ color: 'white', fontWeight: 500 }}>Collections</span>
            </div>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 800 }}>Fee Collections</h1>
                <div style={{ position: 'relative', width: '300px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '0.5rem', padding: '0 0.75rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <Search size={16} color="#9CA3AF" />
                        <input 
                            type="text" 
                            placeholder="Search student by name or roll..." 
                            value={searchQuery}
                            onChange={handleSearch}
                            style={{ background: 'none', border: 'none', color: 'white', padding: '0.75rem', outline: 'none', width: '100%' }} 
                        />
                    </div>
                    {filteredSearch.length > 0 && (
                        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', marginTop: '0.5rem', zIndex: 50, maxHeight: '200px', overflowY: 'auto', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}>
                            {filteredSearch.map(s => (
                                <div 
                                    key={s.id} 
                                    onClick={() => handleSelectStudent(s)}
                                    style={{ padding: '0.75rem 1rem', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}
                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    <div style={{ fontWeight: 600, color: 'white' }}>{s.name}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{s.roll_no} • {s.class_name}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {selectedStudent ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Student Info & Summary Widgets */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                        
                        {/* Student Profile Widget */}
                        <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white', marginBottom: '0.25rem' }}>{selectedStudent.name}</h3>
                                    <p style={{ fontSize: '0.875rem', color: '#9CA3AF' }}>{selectedStudent.roll_no} • {selectedStudent.class_name}</p>
                                </div>
                                <button onClick={() => setSelectedStudent(null)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }}><X size={20} /></button>
                            </div>
                        </div>

                        {/* Financial Summaries */}
                        <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '1rem', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', padding: '0.5rem', borderRadius: '0.5rem' }}><Wallet size={20} color="#10B981" /></div>
                                <span style={{ color: '#10B981', fontWeight: 600 }}>Total Paid</span>
                            </div>
                            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'white' }}>₹{outstanding?.total_paid.toLocaleString() || '0'}</div>
                        </div>

                        <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '1rem', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', padding: '0.5rem', borderRadius: '0.5rem' }}><Clock size={20} color="#EF4444" /></div>
                                <span style={{ color: '#EF4444', fontWeight: 600 }}>Total Balance</span>
                            </div>
                            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'white' }}>₹{outstanding?.total_balance.toLocaleString() || '0'}</div>
                        </div>

                    </div>

                    {/* Main Content Layout */}
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
                        
                        {/* Outstanding Grid */}
                        <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', padding: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CreditCard size={20} /> Fee Assignments</h2>
                            {isLoading ? <p style={{ color: '#9CA3AF' }}>Loading...</p> : (
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#9CA3AF', fontSize: '0.875rem' }}>
                                                <th style={{ padding: '0.75rem 0', fontWeight: 600 }}>Fee Head</th>
                                                <th style={{ padding: '0.75rem 0', fontWeight: 600 }}>Term</th>
                                                <th style={{ padding: '0.75rem 0', fontWeight: 600 }}>Total</th>
                                                <th style={{ padding: '0.75rem 0', fontWeight: 600 }}>Paid</th>
                                                <th style={{ padding: '0.75rem 0', fontWeight: 600 }}>Balance</th>
                                                <th style={{ padding: '0.75rem 0', fontWeight: 600, textAlign: 'right' }}>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {outstanding?.assignments.map(a => (
                                                <tr key={a.assignment_id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                    <td style={{ padding: '1rem 0', color: 'white', fontWeight: 500 }}>{a.fee_head_name}</td>
                                                    <td style={{ padding: '1rem 0', color: '#9CA3AF', fontSize: '0.875rem' }}>{a.term || '-'}</td>
                                                    <td style={{ padding: '1rem 0', color: 'white' }}>₹{a.final_amount.toLocaleString()}</td>
                                                    <td style={{ padding: '1rem 0', color: '#10B981' }}>₹{a.amount_paid.toLocaleString()}</td>
                                                    <td style={{ padding: '1rem 0', color: a.balance > 0 ? '#EF4444' : '#10B981', fontWeight: 600 }}>₹{a.balance.toLocaleString()}</td>
                                                    <td style={{ padding: '1rem 0', textAlign: 'right' }}>
                                                        {a.balance > 0 ? (
                                                            <button onClick={() => openPaymentModal(a)} style={{ backgroundColor: '#0066FF', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>Collect</button>
                                                        ) : (
                                                            <span style={{ color: '#10B981', fontSize: '0.875rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={14}/> Cleared</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                            {(!outstanding?.assignments || outstanding.assignments.length === 0) && (
                                                <tr><td colSpan={6} style={{ padding: '2rem 0', textAlign: 'center', color: '#9CA3AF' }}>No assignments found.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Payment History */}
                        <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', padding: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><History size={20} /> Ledger</h2>
                            {isLoading ? <p style={{ color: '#9CA3AF' }}>Loading...</p> : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {ledger.map(l => (
                                        <div key={l.id} style={{ padding: '1rem', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                <span style={{ fontWeight: 600, color: 'white' }}>{l.fee_head_name}</span>
                                                <span style={{ fontWeight: 700, color: '#10B981' }}>+ ₹{l.amount.toLocaleString()}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#9CA3AF' }}>
                                                <span>{new Date(l.payment_date).toLocaleDateString()}</span>
                                                <span>{l.payment_mode} • {l.receipt_no}</span>
                                            </div>
                                        </div>
                                    ))}
                                    {ledger.length === 0 && <p style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>No payment history.</p>}
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            ) : (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '1rem', border: '1px dashed rgba(255,255,255,0.1)' }}>
                    <Search size={48} opacity={0.2} style={{ marginBottom: '1rem' }} />
                    <p>Search and select a student to view their outstanding fees and process collections.</p>
                </div>
            )}

            {/* Payment Modal */}
            {isPaymentModalOpen && activeAssignment && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
                    <div style={{ width: '100%', maxWidth: '400px', backgroundColor: '#101D42', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Collect Payment</h2>
                        <p style={{ color: '#9CA3AF', fontSize: '0.875rem', marginBottom: '1.5rem' }}>{activeAssignment.fee_head_name} • Balance: <strong style={{ color: '#EF4444' }}>₹{activeAssignment.balance.toLocaleString()}</strong></p>
                        
                        <form onSubmit={submitPayment} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', color: '#9CA3AF', marginBottom: '0.5rem' }}>Amount to Pay (₹) *</label>
                                <input 
                                    required 
                                    type="number" 
                                    min="1" 
                                    max={activeAssignment.balance}
                                    step="0.01" 
                                    value={paymentAmount} 
                                    onChange={e => setPaymentAmount(e.target.value ? Number(e.target.value) : '')} 
                                    style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.75rem', borderRadius: '0.5rem', outline: 'none', fontSize: '1rem' }} 
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', color: '#9CA3AF', marginBottom: '0.5rem' }}>Payment Mode *</label>
                                <select 
                                    value={paymentMode} 
                                    onChange={e => setPaymentMode(e.target.value)} 
                                    style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.75rem', borderRadius: '0.5rem', outline: 'none' }}
                                >
                                    <option value="CASH">Cash</option>
                                    <option value="UPI">UPI</option>
                                    <option value="BANK">Bank Transfer</option>
                                </select>
                            </div>
                            
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                                <button type="button" onClick={() => setIsPaymentModalOpen(false)} style={{ backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.5rem 1.5rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 500 }}>Cancel</button>
                                <button type="submit" style={{ backgroundColor: '#10B981', border: 'none', color: 'white', padding: '0.5rem 1.5rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600 }}>Confirm Payment</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
