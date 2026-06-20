'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE } from '../../../../lib/api';

export default function OutstandingFeesReport() {
    const [reportData, setReportData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/reports/outstanding`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` },
                    credentials: 'include'
                });
                if (res.ok) setReportData(await res.json());
                else if (res.status === 401) router.push('/login');
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchReport();
    }, [router]);

    const totalOutstanding = reportData.reduce((sum, item) => sum + item.pending_balance, 0);

    return (
        <div className="mesh-bg min-h-screen p-8 text-white">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black">OUTSTANDING <span className="text-red-400">FEES REPORT</span></h1>
                    <p className="text-gray-400">Track pending payments and dues</p>
                </div>
                <button onClick={() => router.push('/admin')} className="btn-secondary px-6 py-2">
                    Back to Dashboard
                </button>
            </header>

            <div className="premium-card p-6 mb-8 text-center bg-gray-900/50">
                <p className="text-sm text-gray-400 uppercase tracking-widest font-bold">Total Outstanding</p>
                <p className="text-5xl font-black text-red-500 mt-2">₹{totalOutstanding.toLocaleString()}</p>
            </div>

            <div className="premium-card p-6 overflow-x-auto">
                {loading ? (
                    <div className="text-center py-8">Loading report...</div>
                ) : reportData.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">No outstanding dues found.</div>
                ) : (
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-800 text-gray-400 text-sm">
                                <th className="pb-4">Student</th>
                                <th className="pb-4">Adm No</th>
                                <th className="pb-4">Class</th>
                                <th className="pb-4">Parent</th>
                                <th className="pb-4">Phone</th>
                                <th className="pb-4 text-right">Balance (₹)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reportData.map((row) => (
                                <tr key={row.student_id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                                    <td className="py-4 font-bold">{row.name}</td>
                                    <td className="py-4 text-gray-400">{row.roll_no}</td>
                                    <td className="py-4 text-gray-400">{row.class_name}</td>
                                    <td className="py-4 text-gray-400">{row.parent_name}</td>
                                    <td className="py-4 text-gray-400">{row.parent_phone}</td>
                                    <td className="py-4 text-right font-bold text-red-400">
                                        {row.pending_balance.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
