'use client';

import { useState, useEffect } from 'react';
import { Plus, Filter, Download, Edit2, Trash2, Shield, User } from 'lucide-react';
import { API_BASE } from '@/lib/api';

interface ApiUser {
    id: string;
    username: string;
    role: string;
}

export default function UsersPage() {
    const [users, setUsers] = useState<ApiUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ username: '', role: 'TEACHER', password: '' });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/users`, {
      credentials: 'include'
            });
            if (res.ok) {
                setUsers(await res.json());
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            
            const res = await fetch(`${API_BASE}/api/users`, {
      credentials: 'include',
                method: 'POST',
                headers: { 'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            if (res.ok) {
                fetchUsers();
                setIsModalOpen(false);
                setFormData({ username: '', role: 'TEACHER', password: '' });
            } else {
                alert("Operation failed");
            }
        } catch (error) {
            console.error("Error saving user:", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this user?")) return;
        try {
            const res = await fetch(`${API_BASE}/api/users/${id}`, {
      credentials: 'include',
                method: 'DELETE',
                
            });
            if (res.ok) {
                fetchUsers();
            }
        } catch (error) {
            console.error("Error deleting user:", error);
        }
    };

    const openAddModal = () => {
        setFormData({ username: '', role: 'TEACHER', password: '' });
        setIsModalOpen(true);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
            
            {/* Breadcrumb */}
            <div style={{ fontSize: '0.875rem', color: '#9CA3AF', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span>Admin</span>
                <span>/</span>
                <span style={{ color: 'white', fontWeight: 500 }}>Users</span>
            </div>

            {/* Header & Action Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 800 }}>Users</h1>
                
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button disabled style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'not-allowed', opacity: 0.5 }}>
                        <Filter size={16} /> Filter (Soon)</button>
                    <button disabled style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'not-allowed', opacity: 0.5 }}>
                        <Download size={16} /> Export (Soon)</button>
                    <button onClick={openAddModal} style={{ backgroundColor: '#0066FF', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', boxShadow: '0 4px 14px 0 rgba(0,102,255,0.39)' }}>
                        <Plus size={18} /> New User</button>
                </div>
            </div>

            {/* Content Table */}
            <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: '#9CA3AF', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Username</th>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Role</th>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan={3} style={{ padding: '2rem', textAlign: 'center', color: '#9CA3AF' }}>Loading...</td></tr>
                            ) : users.length === 0 ? (
                                <tr><td colSpan={3} style={{ padding: '2rem', textAlign: 'center', color: '#9CA3AF' }}>No users found.</td></tr>
                            ) : users.map(user => (
                                <tr key={user.id} style={{ borderTop: '1px solid rgba(255,255,255,0.05)', transition: 'background-color 0.2s' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                                    <td style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'white', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '0.5rem', borderRadius: '50%' }}>
                                            <User size={16} />
                                        </div>
                                        {user.username}
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', color: '#9CA3AF' }}>
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: user.role === 'ADMIN' ? 'rgba(59,130,246,0.1)' : 'rgba(16,185,129,0.1)', color: user.role === 'ADMIN' ? '#3B82F6' : '#10B981', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                                            {user.role === 'ADMIN' && <Shield size={12} />}
                                            {user.role}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                            <button onClick={() => handleDelete(user.id)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '0.25rem' }}><Trash2 size={18} /></button>
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
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>New User</h2>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', color: '#9CA3AF', marginBottom: '0.5rem' }}>Username *</label>
                                <input required type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} placeholder="e.g. teacher.john" style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.75rem', borderRadius: '0.5rem', outline: 'none' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', color: '#9CA3AF', marginBottom: '0.5rem' }}>Password *</label>
                                <input required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="••••••••" style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.75rem', borderRadius: '0.5rem', outline: 'none' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', color: '#9CA3AF', marginBottom: '0.5rem' }}>Role</label>
                                <select required value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.75rem', borderRadius: '0.5rem', outline: 'none' }}>
                                    <option value="ADMIN">Super Admin</option>
                                    <option value="OFFICE">Branch Admin</option>
                                    <option value="ACCOUNTANT">Accountant</option>
                                    <option value="TEACHER">Teacher</option>
                                    <option value="PARENT">Parent</option>
                                </select>
                            </div>
                            
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                                <button type="button" onClick={() => setIsModalOpen(false)} style={{ backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.5rem 1.5rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 500 }}>Cancel</button>
                                <button type="submit" style={{ backgroundColor: '#0066FF', border: 'none', color: 'white', padding: '0.5rem 1.5rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 500 }}>Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}
