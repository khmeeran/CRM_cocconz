'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE } from '../../../lib/api';

export default function FeesCollection() {
    const [students, setStudents] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStudent, setSelectedStudent] = useState<any>(null);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentMode, setPaymentMode] = useState('CASH');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
    const router = useRouter();

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/students`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                    },
                    credentials: 'include'
                });
                if (res.ok) {
                    setStudents(await res.json());
                } else if (res.status === 401) {
                    router.push('/login');
                }
            } catch (err) {
                console.error('Failed to fetch students', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStudents();
    }, [router]);

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStudent || !paymentAmount) return;
        setSubmitting(true);
        
        try {
            const res = await fetch(`${API_BASE}/api/fees/pay`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                },
                credentials: 'include',
                body: JSON.stringify({
                    student_id: selectedStudent.id,
                    amount: parseFloat(paymentAmount),
                    payment_mode: paymentMode
                })
            });
            
            if (res.ok) {
                alert('Payment successful!');
                setSelectedStudent(null);
                setPaymentAmount('');
                // Refresh list
                const refreshed = await fetch(`${API_BASE}/api/students`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` },
                    credentials: 'include'
                }).then(r => r.json());
                setStudents(refreshed);
            } else {
                const err = await res.json();
                alert(`Error: ${err.detail}`);
            }
        } catch (err) {
            console.error('Payment error', err);
            alert('Failed to process payment');
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        if (!selectedStudent) {
            setPaymentHistory([]);
            return;
        }
        const fetchHistory = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/students/${selectedStudent.id}/ledger`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` },
                    credentials: 'include'
                });
                if (res.ok) setPaymentHistory(await res.json());
            } catch (err) {
                console.error(err);
            }
        };
        fetchHistory();
    }, [selectedStudent]);

    const filteredStudents = students.filter(s => 
        s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.roll_no?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="mesh-bg min-h-screen p-8 text-white">Loading Students...</div>;

    return (
        <div className="mesh-bg min-h-screen p-8">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black">FEE <span className="text-indigo-400">COLLECTION</span></h1>
                    <p className="text-gray-400">Manage student dues and payments</p>
                </div>
                <button onClick={() => router.push('/admin')} className="btn-secondary px-6 py-2" style={{ width: 'auto' }}>
                    Back to Dashboard
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Search & List */}
                <div className="premium-card p-6">
                    <h2 className="text-xl font-bold mb-4">Select Student</h2>
                    <input 
                        type="text" 
                        placeholder="Search by Name or Admission No..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-800 rounded-lg p-3 text-white mb-4 focus:border-indigo-500 focus:outline-none"
                    />
                    <div className="max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                        {filteredStudents.map(student => (
                            <div 
                                key={student.id}
                                onClick={() => setSelectedStudent(student)}
                                className={`p-4 mb-2 rounded-lg cursor-pointer transition-colors ${
                                    selectedStudent?.id === student.id 
                                    ? 'bg-indigo-600 border border-indigo-400' 
                                    : 'bg-gray-800/50 border border-gray-700/50 hover:border-indigo-500/50'
                                }`}
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-bold">{student.name}</p>
                                        <p className="text-sm text-gray-400">{student.roll_no} | {student.class_name}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-400 uppercase tracking-wider">Pending</p>
                                        <p className={`font-black ${student.pending_balance > 0 ? 'text-red-400' : 'text-green-400'}`}>
                                            ₹{student.pending_balance?.toLocaleString() || 0}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Collection Form */}
                <div className="premium-card p-6 h-fit sticky top-8">
                    <h2 className="text-xl font-bold mb-6">Process Payment</h2>
                    
                    {!selectedStudent ? (
                        <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-800 rounded-xl">
                            Select a student from the list to continue
                        </div>
                    ) : (
                        <form onSubmit={handlePayment} className="space-y-6">
                            <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800">
                                <p className="text-sm text-gray-400">Collecting fee for</p>
                                <p className="text-lg font-bold">{selectedStudent.name}</p>
                                <div className="mt-2 flex justify-between items-end">
                                    <p className="text-sm text-gray-400">Total Due</p>
                                    <p className="text-2xl font-black text-red-400">₹{selectedStudent.pending_balance?.toLocaleString()}</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-400 uppercase tracking-wide mb-2">Amount Paying (₹)</label>
                                <input 
                                    type="number" 
                                    required
                                    min="1"
                                    max={selectedStudent.pending_balance > 0 ? selectedStudent.pending_balance : undefined}
                                    value={paymentAmount}
                                    onChange={(e) => setPaymentAmount(e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-800 rounded-lg p-3 text-white focus:border-indigo-500 focus:outline-none text-xl font-bold"
                                    placeholder="0"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-400 uppercase tracking-wide mb-2">Payment Mode</label>
                                <select 
                                    value={paymentMode}
                                    onChange={(e) => setPaymentMode(e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-800 rounded-lg p-3 text-white focus:border-indigo-500 focus:outline-none"
                                >
                                    <option value="CASH">Cash</option>
                                    <option value="UPI">UPI</option>
                                    <option value="BANK">Bank Transfer / Card</option>
                                </select>
                            </div>

                            <button 
                                type="submit" 
                                disabled={submitting || !paymentAmount}
                                className="w-full btn-primary py-4 text-lg font-bold disabled:opacity-50"
                            >
                                {submitting ? 'Processing...' : 'Confirm Payment'}
                            </button>
                        </form>
                    )}
                    
                    {selectedStudent && paymentHistory.length > 0 && (
                        <div className="mt-8">
                            <h3 className="text-lg font-bold mb-4 border-t border-gray-800 pt-6">Payment History</h3>
                            <div className="space-y-3">
                                {paymentHistory.map(ph => (
                                    <div key={ph.id} className="bg-gray-800/50 p-3 rounded-lg border border-gray-700/50 flex justify-between items-center">
                                        <div>
                                            <p className="font-bold text-green-400">₹{ph.amount.toLocaleString()}</p>
                                            <p className="text-xs text-gray-400">{new Date(ph.payment_date).toLocaleDateString()} | {ph.payment_mode}</p>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                                                {ph.receipt_no}
                                            </span>
                                            <button 
                                                onClick={() => window.open(`${API_BASE}/api/ledger/receipt/${ph.receipt_no}/pdf?token=${localStorage.getItem('access_token')}`, '_blank')}
                                                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                                            >
                                                Download PDF
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
