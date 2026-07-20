'use client';

import { useState, useEffect } from 'react';
import { Plus, Filter, Download, Edit2, CheckCircle, RefreshCw, Mail } from 'lucide-react';
import { API_BASE } from '@/lib/api';

interface StudentClass {
    id: string;
    name: string;
    section: string;
}

interface Parent {
    id: string;
    father_name: string;
    primary_phone: string;
}

interface Admission {
    id: string;
    name: string;
    roll_no: string;
    status: string; // ENQUIRY, FOLLOW_UP, ADMITTED
    student_class: StudentClass;
    parent: Parent;
    class_id: string;
}

export default function AdmissionsPage() {
    const [admissions, setAdmissions] = useState<Admission[]>([]);
    const [classes, setClasses] = useState<StudentClass[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [formData, setFormData] = useState({
        id: '', name: '', class_id: '', parent_name: '', primary_phone: '', status: 'ENQUIRY'
    });

    useEffect(() => {
        fetchAdmissions();
        fetchClasses();
    }, []);

    const getHeaders = () => {
        return { 'Content-Type': 'application/json' };
    };

    const fetchAdmissions = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/admissions`, {
      credentials: 'include', headers: getHeaders() });
            if (res.ok) setAdmissions(await res.json());
        } catch (error) {
            console.error("Error fetching admissions:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchClasses = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/classes`, {
      credentials: 'include', headers: getHeaders() });
            if (res.ok) setClasses(await res.json());
        } catch (error) {
            console.error("Error fetching classes:", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = isEdit ? `${API_BASE}/api/admissions/${formData.id}` : `${API_BASE}/api/admissions`;
            const method = isEdit ? 'PUT' : 'POST';
            
            const payload = isEdit 
                ? { name: formData.name, class_id: formData.class_id, status: formData.status }
                : { name: formData.name, class_id: formData.class_id, parent_name: formData.parent_name, primary_phone: formData.primary_phone, status: formData.status };

            const res = await fetch(url, {
      credentials: 'include',
                method,
                headers: getHeaders(),
                body: JSON.stringify(payload)
            });
            
            if (res.ok) {
                fetchAdmissions();
                setIsModalOpen(false);
            } else {
                alert("Operation failed");
            }
        } catch (error) {
            console.error("Error saving admission:", error);
        }
    };

    const openAddModal = () => {
        setIsEdit(false);
        setFormData({ id: '', name: '', class_id: classes[0]?.id || '', parent_name: '', primary_phone: '', status: 'ENQUIRY' });
        setIsModalOpen(true);
    };

    const openEditModal = (adm: Admission) => {
        setIsEdit(true);
        setFormData({
            id: adm.id,
            name: adm.name,
            class_id: adm.class_id,
            parent_name: adm.parent?.father_name || '',
            primary_phone: adm.parent?.primary_phone || '',
            status: adm.status
        });
        setIsModalOpen(true);
    };

    const updateStatus = async (id: string, newStatus: string) => {
        try {
            const res = await fetch(`${API_BASE}/api/admissions/${id}`, {
      credentials: 'include',
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) fetchAdmissions();
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'ADMITTED': return <span style={{ backgroundColor: 'rgba(16,185,129,0.1)', color: '#10B981', padding: '0.25rem 0.5rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={12} /> Admitted</span>;
            case 'FOLLOW_UP': return <span style={{ backgroundColor: 'rgba(245,158,11,0.1)', color: '#F59E0B', padding: '0.25rem 0.5rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}><RefreshCw size={12} /> Follow Up</span>;
            default: return <span style={{ backgroundColor: 'rgba(59,130,246,0.1)', color: '#3B82F6', padding: '0.25rem 0.5rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Mail size={12} /> Enquiry</span>;
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
            {/* Breadcrumb */}
            <div style={{ fontSize: '0.875rem', color: '#9CA3AF', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span>Admin</span>
                <span>/</span>
                <span style={{ color: 'white', fontWeight: 500 }}>Admissions</span>
            </div>

            {/* Header & Action Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 800 }}>Admission Pipeline</h1>
                
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button disabled style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'not-allowed', opacity: 0.5 }}>
                        <Filter size={16} /> Filter (Soon)</button>
                    <button disabled style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'not-allowed', opacity: 0.5 }}>
                        <Download size={16} /> Export (Soon)</button>
                    <button onClick={openAddModal} style={{ backgroundColor: '#0066FF', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', boxShadow: '0 4px 14px 0 rgba(0,102,255,0.39)' }}>
                        <Plus size={18} /> New Enquiry
                    </button>
                </div>
            </div>

            {/* Content Table */}
            <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: '#9CA3AF', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Candidate Name</th>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Ref / Roll No</th>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Class</th>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Parent Contact</th>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Status</th>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#9CA3AF' }}>Loading...</td></tr>
                            ) : admissions.length === 0 ? (
                                <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#9CA3AF' }}>No admissions found.</td></tr>
                            ) : admissions.map(adm => (
                                <tr key={adm.id} style={{ borderTop: '1px solid rgba(255,255,255,0.05)', transition: 'background-color 0.2s' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                                    <td style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'white' }}>{adm.name}</td>
                                    <td style={{ padding: '1rem 1.5rem', color: '#9CA3AF' }}><span style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontFamily: 'monospace' }}>{adm.roll_no}</span></td>
                                    <td style={{ padding: '1rem 1.5rem', color: 'white' }}>{adm.student_class?.name} {adm.student_class?.section}</td>
                                    <td style={{ padding: '1rem 1.5rem', color: '#9CA3AF', fontSize: '0.875rem' }}>
                                        <div>{adm.parent?.father_name || 'N/A'}</div>
                                        <div style={{ color: '#6B7280' }}>{adm.parent?.primary_phone || 'N/A'}</div>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem' }}>{getStatusBadge(adm.status)}</td>
                                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.5rem' }}>
                                            {adm.status === 'ENQUIRY' && (
                                                <button onClick={() => updateStatus(adm.id, 'FOLLOW_UP')} style={{ background: 'none', border: '1px solid #F59E0B', color: '#F59E0B', cursor: 'pointer', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>Follow Up</button>
                                            )}
                                            {adm.status !== 'ADMITTED' && (
                                                <button onClick={() => updateStatus(adm.id, 'ADMITTED')} style={{ background: 'none', border: '1px solid #10B981', color: '#10B981', cursor: 'pointer', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>Admit</button>
                                            )}
                                            <button onClick={() => openEditModal(adm)} style={{ background: 'none', border: 'none', color: '#3B82F6', cursor: 'pointer', padding: '0.25rem' }}><Edit2 size={18} /></button>
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
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>{isEdit ? 'Edit Admission' : 'New Enquiry'}</h2>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', color: '#9CA3AF', marginBottom: '0.5rem' }}>Candidate Name *</label>
                                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.75rem', borderRadius: '0.5rem', outline: 'none' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', color: '#9CA3AF', marginBottom: '0.5rem' }}>Class *</label>
                                <select required value={formData.class_id} onChange={e => setFormData({...formData, class_id: e.target.value})} style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.75rem', borderRadius: '0.5rem', outline: 'none' }}>
                                    <option value="" disabled>Select Class</option>
                                    {classes.map(c => <option key={c.id} value={c.id}>{c.name} {c.section}</option>)}
                                </select>
                            </div>
                            {!isEdit && (
                                <>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.875rem', color: '#9CA3AF', marginBottom: '0.5rem' }}>Parent Name *</label>
                                        <input required type="text" value={formData.parent_name} onChange={e => setFormData({...formData, parent_name: e.target.value})} style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.75rem', borderRadius: '0.5rem', outline: 'none' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.875rem', color: '#9CA3AF', marginBottom: '0.5rem' }}>Primary Phone *</label>
                                        <input required type="text" value={formData.primary_phone} onChange={e => setFormData({...formData, primary_phone: e.target.value})} style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.75rem', borderRadius: '0.5rem', outline: 'none' }} />
                                    </div>
                                </>
                            )}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', color: '#9CA3AF', marginBottom: '0.5rem' }}>Status</label>
                                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.75rem', borderRadius: '0.5rem', outline: 'none' }}>
                                    <option value="ENQUIRY">Enquiry</option>
                                    <option value="FOLLOW_UP">Follow Up</option>
                                    <option value="ADMITTED">Admitted</option>
                                </select>
                            </div>
                            
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                                <button type="button" onClick={() => setIsModalOpen(false)} style={{ backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.5rem 1.5rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 500 }}>Cancel</button>
                                <button type="submit" style={{ backgroundColor: '#0066FF', border: 'none', color: 'white', padding: '0.5rem 1.5rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 500 }}>{isEdit ? 'Update' : 'Save Enquiry'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
