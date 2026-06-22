'use client';

import { useState, useEffect } from 'react';
import { Plus, Filter, Download, MessageSquare, Send, CheckCircle, Clock } from 'lucide-react';
import { API_BASE } from '../../../lib/api';

interface Broadcast {
    id: number;
    target_class_id: string | null;
    message: string;
    status: string;
    timestamp: string;
}

interface ApiClass {
    id: string;
    name: string;
    section: string;
}

export default function NotificationsPage() {
    const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
    const [classes, setClasses] = useState<ApiClass[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ target_class_id: '', message: '' });

    useEffect(() => {
        fetchBroadcasts();
        fetchClasses();
    }, []);

    const fetchBroadcasts = async () => {
        try {
            const token = document.cookie.split('; ').find(row => row.startsWith('access_token='))?.split('=')[1];
            const res = await fetch(`${API_BASE}/api/broadcast`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setBroadcasts(await res.json());
            }
        } catch (error) {
            console.error("Error fetching broadcasts:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchClasses = async () => {
        try {
            const token = document.cookie.split('; ').find(row => row.startsWith('access_token='))?.split('=')[1];
            const res = await fetch(`${API_BASE}/api/classes`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) setClasses(await res.json());
        } catch (error) {}
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = document.cookie.split('; ').find(row => row.startsWith('access_token='))?.split('=')[1];
            
            const res = await fetch(`${API_BASE}/api/broadcast`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    target_class_id: formData.target_class_id || null,
                    message: formData.message
                })
            });
            
            if (res.ok) {
                fetchBroadcasts();
                setIsModalOpen(false);
                setFormData({ target_class_id: '', message: '' });
                alert("Broadcast queued successfully for SMS and WhatsApp!");
            } else {
                alert("Failed to queue broadcast");
            }
        } catch (error) {
            console.error("Error sending broadcast:", error);
        }
    };

    const openAddModal = () => {
        setFormData({ target_class_id: '', message: '' });
        setIsModalOpen(true);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
            {/* Breadcrumb */}
            <div style={{ fontSize: '0.875rem', color: '#9CA3AF', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span>Admin</span>
                <span>/</span>
                <span style={{ color: 'white', fontWeight: 500 }}>Notifications</span>
            </div>

            {/* Header & Action Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 800 }}>Broadcast & Reminders</h1>
                
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button disabled style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'not-allowed', opacity: 0.5 }}>
                        <Filter size={16} /> Filter (Soon)</button>
                    <button disabled style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'not-allowed', opacity: 0.5 }}>
                        <Download size={16} /> Export (Soon)</button>
                    <button onClick={openAddModal} style={{ backgroundColor: '#0066FF', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', boxShadow: '0 4px 14px 0 rgba(0,102,255,0.39)' }}>
                        <Plus size={18} /> New Broadcast</button>
                </div>
            </div>

            {/* Content Table */}
            <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: '#9CA3AF', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Message</th>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Target</th>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Timestamp</th>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, textAlign: 'right' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: '#9CA3AF' }}>Loading...</td></tr>
                            ) : broadcasts.length === 0 ? (
                                <tr><td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: '#9CA3AF' }}>No broadcasts found.</td></tr>
                            ) : broadcasts.map(b => {
                                const targetClass = classes.find(c => c.id === b.target_class_id);
                                return (
                                <tr key={b.id} style={{ borderTop: '1px solid rgba(255,255,255,0.05)', transition: 'background-color 0.2s' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                                    <td style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'white', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '0.5rem', borderRadius: '50%' }}>
                                            <MessageSquare size={16} color="#3B82F6" />
                                        </div>
                                        <div style={{ maxWidth: '400px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.message}</div>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', color: '#9CA3AF' }}>
                                        <span style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem' }}>
                                            {b.target_class_id ? (targetClass ? `${targetClass.name} ${targetClass.section}` : 'Specific Class') : 'All Students'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', color: '#9CA3AF', fontSize: '0.875rem' }}>
                                        {new Date(b.timestamp).toLocaleString()}
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: b.status === 'QUEUED' ? 'rgba(59,130,246,0.1)' : 'rgba(16,185,129,0.1)', color: b.status === 'QUEUED' ? '#3B82F6' : '#10B981', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 }}>
                                            {b.status === 'QUEUED' ? <Clock size={12} /> : <CheckCircle size={12} />}
                                            {b.status}
                                        </span>
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
                    <div style={{ width: '100%', maxWidth: '500px', backgroundColor: '#101D42', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>Send Notification</h2>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', color: '#9CA3AF', marginBottom: '0.5rem' }}>Target Audience</label>
                                <select value={formData.target_class_id} onChange={e => setFormData({...formData, target_class_id: e.target.value})} style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.75rem', borderRadius: '0.5rem', outline: 'none' }}>
                                    <option value="">All Students</option>
                                    {classes.map(c => <option key={c.id} value={c.id}>{c.name} {c.section}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', color: '#9CA3AF', marginBottom: '0.5rem' }}>Message *</label>
                                <textarea required value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} rows={4} placeholder="Type your SMS/WhatsApp message here..." style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.75rem', borderRadius: '0.5rem', outline: 'none', resize: 'vertical' }} />
                                <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '0.25rem', textAlign: 'right' }}>
                                    {formData.message.length} characters
                                </div>
                            </div>
                            
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                                <button type="button" onClick={() => setIsModalOpen(false)} style={{ backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.5rem 1.5rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 500 }}>Cancel</button>
                                <button type="submit" style={{ backgroundColor: '#10B981', border: 'none', color: 'white', padding: '0.5rem 1.5rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Send size={16} /> Broadcast Now
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}
