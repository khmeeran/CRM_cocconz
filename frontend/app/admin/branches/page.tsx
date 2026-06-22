'use client';

import { useState, useEffect } from 'react';
import { Plus, Filter, Download, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { API_BASE } from '../../../lib/api';

interface Branch {
    id: string;
    name: string;
    code: string;
    address: string | null;
    contact_email: string | null;
    contact_phone: string | null;
    is_active: boolean;
}

export default function BranchesPage() {
    const [branches, setBranches] = useState<Branch[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState<Partial<Branch>>({
        name: '', code: '', address: '', contact_email: '', contact_phone: '', is_active: true
    });
    const [editingId, setEditingId] = useState<string | null>(null);

    useEffect(() => {
        fetchBranches();
    }, []);

    const fetchBranches = async () => {
        const mockBranches = [
            { id: '1', name: 'SP Kovil Branch 1', code: 'BR_SPK', address: '10 School Road, SP Kovil, Chennai', contact_email: 'spkovil@cocoonz.in', contact_phone: '9876543210', is_active: true },
            { id: '2', name: 'Vandalur Branch 2', code: 'BR_VAN', address: '25 G.S.T Road, Vandalur, Chennai', contact_email: 'vandalur@cocoonz.in', contact_phone: '9876543211', is_active: true },
            { id: '3', name: 'Adyar Branch 3', code: 'BR_ADY', address: '15 Adyar Main Road, Adyar, Chennai', contact_email: 'adyar@cocoonz.in', contact_phone: '9876543212', is_active: true }
        ];

        try {
            const token = document.cookie.split('; ').find(row => row.startsWith('access_token='))?.split('=')[1];
            const res = await fetch(`${API_BASE}/api/branches`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setBranches(data && data.length > 0 ? data : mockBranches);
            } else {
                setBranches(mockBranches);
            }
        } catch (error) {
            console.error("Error fetching branches:", error);
            setBranches(mockBranches);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = document.cookie.split('; ').find(row => row.startsWith('access_token='))?.split('=')[1];
            const url = editingId ? `${API_BASE}/api/branches/${editingId}` : `${API_BASE}/api/branches`;
            const method = editingId ? 'PUT' : 'POST';
            
            const res = await fetch(url, {
                method,
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            if (res.ok) {
                fetchBranches();
                setIsModalOpen(false);
                setFormData({ name: '', code: '', address: '', contact_email: '', contact_phone: '', is_active: true });
                setEditingId(null);
            } else {
                alert("Operation failed");
            }
        } catch (error) {
            console.error("Error saving branch:", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this branch?")) return;
        try {
            const token = document.cookie.split('; ').find(row => row.startsWith('access_token='))?.split('=')[1];
            const res = await fetch(`${API_BASE}/api/branches/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                fetchBranches();
            }
        } catch (error) {
            console.error("Error deleting branch:", error);
        }
    };

    const openEditModal = (branch: Branch) => {
        setFormData(branch);
        setEditingId(branch.id);
        setIsModalOpen(true);
    };

    const openAddModal = () => {
        setFormData({ name: '', code: '', address: '', contact_email: '', contact_phone: '', is_active: true });
        setEditingId(null);
        setIsModalOpen(true);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
            
            {/* Breadcrumb */}
            <div style={{ fontSize: '0.875rem', color: '#9CA3AF', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span>Admin</span>
                <span>/</span>
                <span style={{ color: 'white', fontWeight: 500 }}>Branches</span>
            </div>

            {/* Header & Action Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 800 }}>Branches</h1>
                
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <Filter size={16} /> Filter
                    </button>
                    <button style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <Download size={16} /> Export
                    </button>
                    <button onClick={openAddModal} style={{ backgroundColor: '#0066FF', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', boxShadow: '0 4px 14px 0 rgba(0,102,255,0.39)' }}>
                        <Plus size={18} /> New Branch
                    </button>
                </div>
            </div>

            {/* Content Table */}
            <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: '#9CA3AF', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Branch Name</th>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Code</th>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Contact Info</th>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Status</th>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#9CA3AF' }}>Loading...</td></tr>
                            ) : branches.length === 0 ? (
                                <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#9CA3AF' }}>No branches found.</td></tr>
                            ) : branches.map(branch => (
                                <tr key={branch.id} style={{ borderTop: '1px solid rgba(255,255,255,0.05)', transition: 'background-color 0.2s' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                                    <td style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'white' }}>{branch.name}</td>
                                    <td style={{ padding: '1rem 1.5rem', color: '#9CA3AF' }}><span style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontFamily: 'monospace' }}>{branch.code}</span></td>
                                    <td style={{ padding: '1rem 1.5rem', color: '#9CA3AF', fontSize: '0.875rem' }}>
                                        <div>{branch.contact_phone || 'N/A'}</div>
                                        <div style={{ color: '#6B7280' }}>{branch.contact_email || 'N/A'}</div>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        {branch.is_active ? (
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#10B981', fontSize: '0.75rem', fontWeight: 600, backgroundColor: 'rgba(16,185,129,0.1)', padding: '0.25rem 0.5rem', borderRadius: '999px' }}><CheckCircle size={12} /> Active</span>
                                        ) : (
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#EF4444', fontSize: '0.75rem', fontWeight: 600, backgroundColor: 'rgba(239,68,68,0.1)', padding: '0.25rem 0.5rem', borderRadius: '999px' }}><XCircle size={12} /> Inactive</span>
                                        )}
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                            <button onClick={() => openEditModal(branch)} style={{ background: 'none', border: 'none', color: '#3B82F6', cursor: 'pointer', padding: '0.25rem' }}><Edit2 size={18} /></button>
                                            <button onClick={() => handleDelete(branch.id)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '0.25rem' }}><Trash2 size={18} /></button>
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
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>{editingId ? 'Edit Branch' : 'New Branch'}</h2>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', color: '#9CA3AF', marginBottom: '0.5rem' }}>Branch Name *</label>
                                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.75rem', borderRadius: '0.5rem', outline: 'none' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', color: '#9CA3AF', marginBottom: '0.5rem' }}>Branch Code *</label>
                                <input required type="text" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.75rem', borderRadius: '0.5rem', outline: 'none' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', color: '#9CA3AF', marginBottom: '0.5rem' }}>Contact Phone</label>
                                <input type="text" value={formData.contact_phone || ''} onChange={e => setFormData({...formData, contact_phone: e.target.value})} style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.75rem', borderRadius: '0.5rem', outline: 'none' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', color: '#9CA3AF', marginBottom: '0.5rem' }}>Contact Email</label>
                                <input type="email" value={formData.contact_email || ''} onChange={e => setFormData({...formData, contact_email: e.target.value})} style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.75rem', borderRadius: '0.5rem', outline: 'none' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', color: '#9CA3AF', marginBottom: '0.5rem' }}>Address</label>
                                <textarea value={formData.address || ''} onChange={e => setFormData({...formData, address: e.target.value})} style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.75rem', borderRadius: '0.5rem', outline: 'none', minHeight: '80px' }} />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <input type="checkbox" id="isActive" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} />
                                <label htmlFor="isActive" style={{ fontSize: '0.875rem', color: '#E5E7EB' }}>Active Branch</label>
                            </div>
                            
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                                <button type="button" onClick={() => setIsModalOpen(false)} style={{ backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.5rem 1.5rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 500 }}>Cancel</button>
                                <button type="submit" style={{ backgroundColor: '#0066FF', border: 'none', color: 'white', padding: '0.5rem 1.5rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 500 }}>{editingId ? 'Update' : 'Save'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}
