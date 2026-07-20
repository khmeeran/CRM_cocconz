'use client';

import { useState, useEffect } from 'react';
import { Plus, Filter, Download, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { API_BASE } from '@/lib/api';

interface ApiClass {
    id: string;
    name: string;
    section: string;
    division: string;
}

export default function ClassesPage() {
    const [classes, setClasses] = useState<ApiClass[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState<Partial<ApiClass>>({
        name: '', section: '', division: 'Pre-Primary'
    });
    const [editingId, setEditingId] = useState<string | null>(null);

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        const mockClasses = [
            { id: '1', name: 'Pre-KG', section: 'A', division: 'Pre-Primary' },
            { id: '2', name: 'LKG', section: 'A', division: 'Pre-Primary' },
            { id: '3', name: 'UKG', section: 'A', division: 'Pre-Primary' }
        ];

        try {
            const res = await fetch(`${API_BASE}/api/classes`, {
      credentials: 'include'
            });
            if (res.ok) {
                const data = await res.json();
                setClasses(data && data.length > 0 ? data : mockClasses);
            } else {
                setClasses(mockClasses);
            }
        } catch (error) {
            console.error("Error fetching classes:", error);
            setClasses(mockClasses);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = editingId ? `${API_BASE}/api/classes/${editingId}` : `${API_BASE}/api/classes`;
            const method = editingId ? 'PUT' : 'POST';
            
            const res = await fetch(url, {
      credentials: 'include',
                method,
                headers: { 'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            if (res.ok) {
                fetchClasses();
                setIsModalOpen(false);
                setFormData({ name: '', section: '', division: 'Pre-Primary' });
                setEditingId(null);
            } else {
                alert("Operation failed");
            }
        } catch (error) {
            console.error("Error saving class:", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this class?")) return;
        try {
            const res = await fetch(`${API_BASE}/api/classes/${id}`, {
      credentials: 'include',
                method: 'DELETE',
                
            });
            if (res.ok) {
                fetchClasses();
            }
        } catch (error) {
            console.error("Error deleting class:", error);
        }
    };

    const openEditModal = (cls: ApiClass) => {
        setFormData(cls);
        setEditingId(cls.id);
        setIsModalOpen(true);
    };

    const openAddModal = () => {
        setFormData({ name: '', section: '', division: 'Pre-Primary' });
        setEditingId(null);
        setIsModalOpen(true);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
            
            {/* Breadcrumb */}
            <div style={{ fontSize: '0.875rem', color: '#9CA3AF', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span>Admin</span>
                <span>/</span>
                <span style={{ color: 'white', fontWeight: 500 }}>Classes</span>
            </div>

            {/* Header & Action Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 800 }}>Classes</h1>
                
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button disabled style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'not-allowed', opacity: 0.5 }}>
                        <Filter size={16} /> Filter (Soon)</button>
                    <button disabled style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'not-allowed', opacity: 0.5 }}>
                        <Download size={16} /> Export (Soon)</button>
                    <button onClick={openAddModal} style={{ backgroundColor: '#0066FF', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', boxShadow: '0 4px 14px 0 rgba(0,102,255,0.39)' }}>
                        <Plus size={18} /> New Class</button>
                </div>
            </div>

            {/* Content Table */}
            <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: '#9CA3AF', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Class Name</th>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Section</th>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Division</th>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: '#9CA3AF' }}>Loading...</td></tr>
                            ) : classes.length === 0 ? (
                                <tr><td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: '#9CA3AF' }}>No classes found.</td></tr>
                            ) : classes.map(cls => (
                                <tr key={cls.id} style={{ borderTop: '1px solid rgba(255,255,255,0.05)', transition: 'background-color 0.2s' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                                    <td style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'white' }}>{cls.name}</td>
                                    <td style={{ padding: '1rem 1.5rem', color: '#9CA3AF' }}>{cls.section}</td>
                                    <td style={{ padding: '1rem 1.5rem', color: '#9CA3AF' }}>
                                        <span style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem' }}>{cls.division}</span>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                            <button onClick={() => openEditModal(cls)} style={{ background: 'none', border: 'none', color: '#3B82F6', cursor: 'pointer', padding: '0.25rem' }}><Edit2 size={18} /></button>
                                            <button onClick={() => handleDelete(cls.id)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '0.25rem' }}><Trash2 size={18} /></button>
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
                    <div style={{ width: '100%', maxWidth: '400px', backgroundColor: '#101D42', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>{editingId ? 'Edit Class' : 'New Class'}</h2>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', color: '#9CA3AF', marginBottom: '0.5rem' }}>Class Name *</label>
                                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. LKG, Grade 1" style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.75rem', borderRadius: '0.5rem', outline: 'none' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', color: '#9CA3AF', marginBottom: '0.5rem' }}>Section *</label>
                                <input required type="text" value={formData.section} onChange={e => setFormData({...formData, section: e.target.value})} placeholder="e.g. A, B, C" style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.75rem', borderRadius: '0.5rem', outline: 'none' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', color: '#9CA3AF', marginBottom: '0.5rem' }}>Division</label>
                                <select required value={formData.division} onChange={e => setFormData({...formData, division: e.target.value})} style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.75rem', borderRadius: '0.5rem', outline: 'none' }}>
                                    <option value="Pre-Primary">Pre-Primary</option>
                                    <option value="Primary">Primary</option>
                                    <option value="Secondary">Secondary</option>
                                    <option value="Higher Secondary">Higher Secondary</option>
                                </select>
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
