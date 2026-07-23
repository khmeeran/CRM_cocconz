'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, CheckCircle, XCircle } from 'lucide-react';
import { API_BASE } from '@/lib/api';

interface Branch { id: string; name: string; }
interface StudentClass { id: string; name: string; section: string; branch_id?: string; }
interface FeeHead { id: string; name: string; }

interface FeeStructure {
    id: string;
    branch_id: string;
    class_id: string;
    fee_head_id: string;
    term: string | null;
    amount: number;
    is_active: boolean;
}

export default function FeeStructurePage() {
    const [fees, setFees] = useState<FeeStructure[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [classes, setClasses] = useState<StudentClass[]>([]);
    const [feeHeads, setFeeHeads] = useState<FeeHead[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    
    const [searchQuery, setSearchQuery] = useState('');
    const [branchFilter, setBranchFilter] = useState('');
    const [classFilter, setClassFilter] = useState('');

    const [formData, setFormData] = useState({
        id: '', branch_id: '', class_id: '', fee_head_id: '', term: 'Term 1', amount: 0, is_active: true
    });

    useEffect(() => {
        fetchData();
    }, []);

    const getHeaders = () => {
        return { 'Content-Type': 'application/json' };
    };

    const fetchData = async () => {
        const mockBranches = [
            { id: '1', name: 'SP Kovil Branch 1', code: 'BR_SPK', address: '10 School Road, SP Kovil, Chennai', contact_email: 'spkovil@cocoonz.in', contact_phone: '9876543210', is_active: true },
            { id: '2', name: 'Vandalur Branch 2', code: 'BR_VAN', address: '25 G.S.T Road, Vandalur, Chennai', contact_email: 'vandalur@cocoonz.in', contact_phone: '9876543211', is_active: true },
            { id: '3', name: 'Adyar Branch 3', code: 'BR_ADY', address: '15 Adyar Main Road, Adyar, Chennai', contact_email: 'adyar@cocoonz.in', contact_phone: '9876543212', is_active: true }
        ];

        try {
            const [fRes, bRes, cRes, hRes] = await Promise.all([
                fetch(`${API_BASE}/api/fee-structures`, {
      credentials: 'include', headers: getHeaders() }),
                fetch(`${API_BASE}/api/branches`, {
      credentials: 'include', headers: getHeaders() }),
                fetch(`${API_BASE}/api/classes`, {
      credentials: 'include', headers: getHeaders() }),
                fetch(`${API_BASE}/api/fee-heads`, {
      credentials: 'include', headers: getHeaders() })
            ]);
            if (fRes.ok) setFees(await fRes.json());
            
            if (bRes.ok) {
                const bData = await bRes.json();
                setBranches(bData && bData.length > 0 ? bData : mockBranches);
            } else {
                setBranches(mockBranches);
            }

            if (cRes.ok) setClasses(await cRes.json());
            if (hRes.ok) setFeeHeads(await hRes.json());
        } catch (error) {
            console.error("Error fetching data:", error);
            setBranches(mockBranches);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.amount <= 0) {
            alert("Amount must be greater than 0");
            return;
        }

        try {
            const url = isEdit ? `${API_BASE}/api/fee-structures/${formData.id}` : `${API_BASE}/api/fee-structures`;
            const method = isEdit ? 'PUT' : 'POST';
            
            const payload = { ...formData };
            if (!isEdit) delete (payload as any).id;
            if (payload.term === "Full/One-time") payload.term = null as any;

            const res = await fetch(url, {
      credentials: 'include', method, headers: getHeaders(), body: JSON.stringify(payload) });
            
            if (res.ok) {
                fetchData();
                setIsModalOpen(false);
            } else {
                const err = await res.json();
                alert(err.detail || "Operation failed");
            }
        } catch (error) {
            console.error("Error saving fee structure:", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this fee structure?")) return;
        try {
            const res = await fetch(`${API_BASE}/api/fee-structures/${id}`, {
      credentials: 'include', method: 'DELETE', headers: getHeaders() });
            if (res.ok) fetchData();
        } catch (error) {
            console.error("Error deleting fee structure:", error);
        }
    };

    const openAddModal = () => {
        setIsEdit(false);
        setFormData({ id: '', branch_id: branches[0]?.id || '', class_id: classes[0]?.id || '', fee_head_id: feeHeads[0]?.id || '', term: 'Term 1', amount: 0, is_active: true });
        setIsModalOpen(true);
    };

    const openEditModal = (fs: FeeStructure) => {
        setIsEdit(true);
        setFormData({ ...fs, term: fs.term || "Full/One-time" });
        setIsModalOpen(true);
    };

    const getBranchName = (id: string) => branches.find(b => b.id === id)?.name || 'Unknown';
    const getClassName = (id: string) => {
        const c = classes.find(c => c.id === id);
        return c ? `${c.name} ${c.section}` : 'Unknown';
    };
    const getFeeHeadName = (id: string) => feeHeads.find(h => h.id === id)?.name || 'Unknown';

    const filteredFees = fees.filter(f => {
        const headName = getFeeHeadName(f.fee_head_id).toLowerCase();
        const matchesSearch = headName.includes(searchQuery.toLowerCase());
        const matchesBranch = branchFilter ? f.branch_id === branchFilter : true;
        const matchesClass = classFilter ? f.class_id === classFilter : true;
        return matchesSearch && matchesBranch && matchesClass;
    });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
            {/* Breadcrumb */}
            <div style={{ fontSize: '0.875rem', color: '#9CA3AF', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span>Admin</span>
                <span>/</span>
                <span style={{ color: 'white', fontWeight: 500 }}>Fee Structure</span>
            </div>

            {/* Header & Action Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 800 }}>Fee Structure</h1>
                
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '0.5rem', padding: '0 0.5rem' }}>
                        <Search size={16} color="#9CA3AF" />
                        <input type="text" placeholder="Search heads..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ background: 'none', border: 'none', color: 'white', padding: '0.5rem', outline: 'none', width: '150px' }} />
                    </div>
                    <select value={branchFilter} onChange={e => { setBranchFilter(e.target.value); setClassFilter(''); }} style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', outline: 'none' }}>
                        <option value="">All Branches</option>
                        {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                    <select value={classFilter} onChange={e => setClassFilter(e.target.value)} style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', outline: 'none' }}>
                        <option value="">All Classes</option>
                        {classes.filter(c => !branchFilter || c.branch_id === branchFilter).map(c => <option key={c.id} value={c.id}>{c.name} {c.section}</option>)}
                    </select>
                    <button onClick={openAddModal} style={{ backgroundColor: '#0066FF', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <Plus size={18} /> New Fee
                    </button>
                </div>
            </div>

            {/* Content Table */}
            <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: '#9CA3AF', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Branch</th>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Class</th>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Fee Head</th>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Term</th>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Amount</th>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Status</th>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: '#9CA3AF' }}>Loading...</td></tr>
                            ) : filteredFees.length === 0 ? (
                                <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: '#9CA3AF' }}>No fee structures found.</td></tr>
                            ) : filteredFees.map(fs => (
                                <tr key={fs.id} style={{ borderTop: '1px solid rgba(255,255,255,0.05)', transition: 'background-color 0.2s' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                                    <td style={{ padding: '1rem 1.5rem', color: '#9CA3AF', fontSize: '0.875rem' }}>{getBranchName(fs.branch_id)}</td>
                                    <td style={{ padding: '1rem 1.5rem', color: '#9CA3AF', fontSize: '0.875rem' }}>{getClassName(fs.class_id)}</td>
                                    <td style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'white' }}>{getFeeHeadName(fs.fee_head_id)}</td>
                                    <td style={{ padding: '1rem 1.5rem', color: '#9CA3AF', fontSize: '0.875rem' }}>{fs.term || "Full/One-time"}</td>
                                    <td style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'white' }}>₹{fs.amount.toLocaleString()}</td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        {fs.is_active 
                                            ? <span style={{ color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 600 }}><CheckCircle size={14}/> Active</span>
                                            : <span style={{ color: '#EF4444', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 600 }}><XCircle size={14}/> Inactive</span>}
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                                            <button onClick={() => openEditModal(fs)} style={{ background: 'none', border: 'none', color: '#3B82F6', cursor: 'pointer' }}><Edit2 size={16} /></button>
                                            <button onClick={() => handleDelete(fs.id)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
                    <div style={{ width: '100%', maxWidth: '500px', backgroundColor: '#101D42', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>{isEdit ? 'Edit Fee Structure' : 'New Fee Structure'}</h2>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', fontSize: '0.875rem', color: '#9CA3AF', marginBottom: '0.5rem' }}>Branch *</label>
                                    <select required value={formData.branch_id} onChange={e => setFormData({...formData, branch_id: e.target.value, class_id: ''})} style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.75rem', borderRadius: '0.5rem', outline: 'none' }}>
                                        <option value="" disabled>Select Branch</option>
                                        {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                    </select>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', fontSize: '0.875rem', color: '#9CA3AF', marginBottom: '0.5rem' }}>Class *</label>
                                    <select required value={formData.class_id} onChange={e => setFormData({...formData, class_id: e.target.value})} style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.75rem', borderRadius: '0.5rem', outline: 'none' }}>
                                        <option value="" disabled>Select Class</option>
                                        {classes.filter(c => !formData.branch_id || c.branch_id === formData.branch_id).map(c => <option key={c.id} value={c.id}>{c.name} {c.section}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', fontSize: '0.875rem', color: '#9CA3AF', marginBottom: '0.5rem' }}>Fee Head *</label>
                                    <select required value={formData.fee_head_id} onChange={e => setFormData({...formData, fee_head_id: e.target.value})} style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.75rem', borderRadius: '0.5rem', outline: 'none' }}>
                                        <option value="" disabled>Select Fee Head</option>
                                        {feeHeads.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', fontSize: '0.875rem', color: '#9CA3AF', marginBottom: '0.5rem' }}>Term *</label>
                                    <select required value={formData.term} onChange={e => setFormData({...formData, term: e.target.value})} style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.75rem', borderRadius: '0.5rem', outline: 'none' }}>
                                        <option value="Term 1">Term 1</option>
                                        <option value="Term 2">Term 2</option>
                                        <option value="Term 3">Term 3</option>
                                        <option value="Full/One-time">Full/One-time</option>
                                    </select>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', fontSize: '0.875rem', color: '#9CA3AF', marginBottom: '0.5rem' }}>Amount (₹) *</label>
                                    <input required type="number" min="1" step="0.01" value={formData.amount} onChange={e => setFormData({...formData, amount: parseFloat(e.target.value)})} style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.75rem', borderRadius: '0.5rem', outline: 'none' }} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                                <input type="checkbox" id="isActive" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} style={{ width: '1rem', height: '1rem' }} />
                                <label htmlFor="isActive" style={{ color: 'white', fontSize: '0.875rem' }}>Active Structure</label>
                            </div>
                            
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                                <button type="button" onClick={() => setIsModalOpen(false)} style={{ backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.5rem 1.5rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 500 }}>Cancel</button>
                                <button type="submit" style={{ backgroundColor: '#0066FF', border: 'none', color: 'white', padding: '0.5rem 1.5rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 500 }}>{isEdit ? 'Update' : 'Save'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
