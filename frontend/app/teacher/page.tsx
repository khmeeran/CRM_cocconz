'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Clock, CheckCircle, GraduationCap, Calendar, Bell } from 'lucide-react';

export default function TeacherDashboard() {
    const router = useRouter();
    const [dateString, setDateString] = useState('');

    useEffect(() => {
        setDateString(new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
    }, []);

    const recentActivity = [
        { id: 1, text: 'Attendance marked for Grade 4 - A', time: '10 mins ago', type: 'academic' },
        { id: 2, text: 'Assignment submitted by 12 students', time: '1 hour ago', type: 'academic' },
        { id: 3, text: 'New circular from Principal', time: '3 hours ago', type: 'notification' },
        { id: 4, text: 'Tomorrow is a holiday (Public Holiday)', time: '1 day ago', type: 'notification' }
    ];

    const schedule = [
        { time: '09:00 AM', subject: 'Mathematics', class: 'Grade 4 - A' },
        { time: '10:00 AM', subject: 'Science', class: 'Grade 5 - B' },
        { time: '11:30 AM', subject: 'English', class: 'Grade 4 - A' },
        { time: '01:00 PM', subject: 'History', class: 'Grade 6 - C' }
    ];

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Header Area */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.25rem' }}>Good Morning, Teacher 👋</h1>
                    <p style={{ color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Clock size={16} /> {dateString}
                    </p>
                </div>
            </div>

            {/* Top KPI Widgets */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '1.5rem', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '0.75rem', borderRadius: '1rem' }}>
                            <GraduationCap size={24} color="#3B82F6" />
                        </div>
                    </div>
                    <div>
                        <h3 style={{ color: '#9CA3AF', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>Assigned Classes</h3>
                        <p style={{ fontSize: '2rem', fontWeight: 800 }}>4</p>
                    </div>
                </div>

                <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '1.5rem', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', padding: '0.75rem', borderRadius: '1rem' }}>
                            <Users size={24} color="#8B5CF6" />
                        </div>
                    </div>
                    <div>
                        <h3 style={{ color: '#9CA3AF', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>Total Students</h3>
                        <p style={{ fontSize: '2rem', fontWeight: 800 }}>142</p>
                    </div>
                </div>

                <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '1.5rem', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: '0.75rem', borderRadius: '1rem' }}>
                            <Bell size={24} color="#F59E0B" />
                        </div>
                    </div>
                    <div>
                        <h3 style={{ color: '#9CA3AF', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>Pending Notifications</h3>
                        <p style={{ fontSize: '2rem', fontWeight: 800 }}>3</p>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
                
                {/* Today's Schedule */}
                <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '1.5rem', padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Calendar size={20} color="#3B82F6" /> Today's Schedule
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {schedule.map((item, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                    <span style={{ fontWeight: 600 }}>{item.subject}</span>
                                    <span style={{ fontSize: '0.875rem', color: '#9CA3AF' }}>{item.class}</span>
                                </div>
                                <div style={{ fontSize: '0.875rem', color: '#3B82F6', fontWeight: 600 }}>
                                    {item.time}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Academic Activity */}
                <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '1.5rem', padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.5rem' }}>Academic Activity</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {recentActivity.map(act => (
                            <div key={act.id} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                <div style={{ marginTop: '0.25rem', color: '#8B5CF6' }}>
                                    <CheckCircle size={16} />
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#E5E7EB' }}>{act.text}</p>
                                    <p style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: '0.25rem' }}>{act.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
