'use client';

import { useEffect, useState } from 'react';
import { API_BASE } from '../../../lib/api';

interface Student {
  id: string;
  name: string;
  roll_no: string;
  class_name: string;
  parent_name: string;
  parent_phone: string;
  pending_balance: number;
  status: string;
}

export default function StudentManagement() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/students`, {
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

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this student? This action is permanent.')) return;
    
    try {
      const res = await fetch(`${API_BASE}/api/students/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'X-CSRF-Token': document.cookie.split('; ').find(row => row.startsWith('csrf_token='))?.split('=')[1] || ''
        }
      });
      if (res.ok) {
        setStudents(students.filter(s => s.id !== id));
      } else {
        alert('Failed to delete. Restricted to Administrators.');
      }
    } catch (err) {
      alert('Error connecting to server.');
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.roll_no.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: '2rem', color: 'white', backgroundColor: '#0a0a0a', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Student Management</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
           <input 
            type="text" 
            placeholder="Search name or roll no..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ 
              backgroundColor: '#1a1a1a', 
              border: '1px solid #333', 
              padding: '0.75rem 1rem', 
              borderRadius: '8px',
              color: 'white',
              width: '300px'
            }}
           />
           <button style={{ backgroundColor: '#fff', color: 'black', padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: 600 }}>
             + Admit Student
           </button>
        </div>
      </div>

      {loading ? (
        <p>Loading records...</p>
      ) : (
        <div style={{ backgroundColor: '#111', borderRadius: '12px', border: '1px solid #222', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ backgroundColor: '#1a1a1a', borderBottom: '1px solid #222' }}>
              <tr>
                <th style={{ padding: '1rem' }}>Name</th>
                <th style={{ padding: '1rem' }}>Roll No</th>
                <th style={{ padding: '1rem' }}>Class</th>
                <th style={{ padding: '1rem' }}>Parent</th>
                <th style={{ padding: '1rem' }}>Phone</th>
                <th style={{ padding: '1rem' }}>Status</th>
                <th style={{ padding: '1rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((s) => (
                <tr key={s.id} style={{ borderBottom: '1px solid #222' }}>
                  <td style={{ padding: '1rem', fontWeight: 600 }}>{s.name}</td>
                  <td style={{ padding: '1rem', color: '#888' }}>{s.roll_no}</td>
                  <td style={{ padding: '1rem' }}>{s.class_name}</td>
                  <td style={{ padding: '1rem' }}>{s.parent_name}</td>
                  <td style={{ padding: '1rem' }}>{s.parent_phone}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '20px', 
                      fontSize: '0.75rem',
                      backgroundColor: s.status === 'ACTIVE' ? '#065f46' : '#333',
                      color: s.status === 'ACTIVE' ? '#34d399' : '#888'
                    }}>
                      {s.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #333', backgroundColor: 'transparent', color: 'white', cursor: 'pointer' }}
                        title="Edit Profile"
                      >
                        ✏️
                      </button>
                      <button 
                        onClick={() => handleDelete(s.id)}
                        style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #440000', backgroundColor: 'transparent', color: '#ff4444', cursor: 'pointer' }}
                        title="Delete Student"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredStudents.length === 0 && (
            <div style={{ padding: '4rem', textAlign: 'center', color: '#555' }}>
              No students found matching your search.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
