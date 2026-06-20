'use client';

import { useEffect, useState } from 'react';
import { API_BASE } from '../../../lib/api';

interface Student {
  id: string;
  name: string;
  roll_no: string;
  class_name: string;
}

interface AttendanceRecord {
  student_id: string;
  status: string;
}

interface ClassItem {
  id: string;
  name: string;
  section: string;
}

export default function AttendancePage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchStudents();
      fetchAttendance();
    }
  }, [selectedClass, selectedDate]);

  const fetchClasses = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/classes`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setClasses(data);
      }
    } catch (err) {
      console.error('Failed to fetch classes', err);
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/students?class_id=${selectedClass}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setStudents(data);
      }
    } catch (err) {
      console.error('Failed to fetch students', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendance = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/attendance/check?class_id=${selectedClass}&date=${selectedDate}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setAttendance(data);
      }
    } catch (err) {
      console.error('Failed to fetch attendance', err);
    }
  };

  const handleStatusChange = (studentId: string, status: string) => {
    setAttendance(prev => {
      const existing = prev.find(a => a.student_id === studentId);
      if (existing) {
        return prev.map(a => a.student_id === studentId ? { ...a, status } : a);
      }
      return [...prev, { student_id: studentId, status }];
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');

    try {
      const res = await fetch(`${API_BASE}/api/attendance/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'X-CSRF-Token': document.cookie.split('; ').find(row => row.startsWith('csrf_token='))?.split('=')[1] || ''
        },
        body: JSON.stringify({
          date: selectedDate,
          entries: attendance
        })
      });

      if (res.ok) {
        setMessage('Attendance saved successfully!');
      } else {
        const error = await res.json();
        setMessage('Error: ' + (error.detail || 'Failed to save attendance'));
      }
    } catch (err) {
      setMessage('Error connecting to server.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusForStudent = (studentId: string) => {
    return attendance.find(a => a.student_id === studentId)?.status || 'P';
  };

  return (
    <div style={{ padding: '2rem', color: 'white', backgroundColor: '#0a0a0a', minHeight: '100vh' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Attendance Management</h1>
        <p style={{ color: '#888' }}>Mark and manage student attendance records.</p>
      </div>

      <div style={{ backgroundColor: '#111', borderRadius: '12px', border: '1px solid #222', padding: '2rem', marginBottom: '2rem' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888', fontSize: '0.875rem' }}>Select Class *</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '6px', color: 'white' }}
                required
              >
                <option value="">-- Select Class --</option>
                {classes.map(classItem => (
                  <option key={classItem.id} value={classItem.id}>
                    {classItem.name} - {classItem.section}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888', fontSize: '0.875rem' }}>Date *</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '6px', color: 'white' }}
                required
              />
            </div>
          </div>

          {message && (
            <div style={{ padding: '1rem', borderRadius: '6px', marginBottom: '1rem', backgroundColor: message.includes('Error') ? '#7f1d1d' : '#065f46', color: 'white' }}>
              {message}
            </div>
          )}

          {selectedClass && (
            <div style={{ backgroundColor: '#1a1a1a', borderRadius: '8px', border: '1px solid #333', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ backgroundColor: '#222', borderBottom: '1px solid #333' }}>
                  <tr>
                    <th style={{ padding: '1rem' }}>Roll No</th>
                    <th style={{ padding: '1rem' }}>Name</th>
                    <th style={{ padding: '1rem' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => (
                    <tr key={s.id} style={{ borderBottom: '1px solid #222' }}>
                      <td style={{ padding: '1rem', color: '#888' }}>{s.roll_no}</td>
                      <td style={{ padding: '1rem', fontWeight: 600 }}>{s.name}</td>
                      <td style={{ padding: '1rem' }}>
                        <select
                          value={getStatusForStudent(s.id)}
                          onChange={(e) => handleStatusChange(s.id, e.target.value)}
                          style={{ padding: '0.5rem', backgroundColor: '#0a0a0a', border: '1px solid #333', borderRadius: '4px', color: 'white', cursor: 'pointer' }}
                        >
                          <option value="P">Present</option>
                          <option value="A">Absent</option>
                          <option value="L">Late</option>
                          <option value="H">Half Day</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {students.length === 0 && (
                <div style={{ padding: '4rem', textAlign: 'center', color: '#555' }}>
                  No students found in this class.
                </div>
              )}
            </div>
          )}

          {selectedClass && students.length > 0 && (
            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  backgroundColor: '#10b981',
                  color: 'white',
                  padding: '0.75rem 2rem',
                  borderRadius: '8px',
                  fontWeight: 600,
                  border: 'none',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting ? 0.6 : 1
                }}
              >
                {submitting ? 'Saving...' : 'Save Attendance'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
