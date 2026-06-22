'use client';

import { useEffect, useState } from 'react';
import { API_BASE } from '../../../lib/api';

interface Student {
  id: string;
  name: string;
  roll_no: string;
  class_name: string;
  section: string;
  parent_name: string;
  parent_phone: string;
  address: string;
  total_fees: number;
  status: string;
}

interface ApiClass {
  id: string;
  name: string;
  section: string;
  division: string;
}

export default function StudentManagement() {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ApiClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAdmissionForm, setShowAdmissionForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const [newStudent, setNewStudent] = useState<Partial<Student>>({
    name: '',
    roll_no: '',
    class_name: '',
    section: '',
    parent_name: '',
    parent_phone: '',
    address: '',
    total_fees: 25000,
    status: 'ACTIVE'
  });

  useEffect(() => {
    fetchStudents();
    fetchClasses();
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewStudent(prev => ({ ...prev, [name]: value }));
  };

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedClassId = e.target.value;
    if (selectedClassId) {
      const selectedClass = classes.find(c => c.id === selectedClassId);
      if (selectedClass) {
        setNewStudent(prev => ({
          ...prev,
          class_name: selectedClass.name,
          section: selectedClass.section,
          division: selectedClass.division
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newStudent.name || !newStudent.roll_no || !newStudent.class_name || !newStudent.parent_name || !newStudent.parent_phone) {
      alert('Please fill all required fields');
      return;
    }
    
    try {
      const csrfToken = document.cookie.split('; ').find(row => row.startsWith('csrf_token='))?.split('=')[1] || '';
      const res = await fetch(`${API_BASE}/api/students`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'X-CSRF-Token': csrfToken
        },
        credentials: 'include',
        body: JSON.stringify(newStudent)
      });
      
      if (res.ok) {
        const data = await res.json();
        setStudents([...students, data]);
        alert('🎉 Student admitted successfully!');
        setShowAdmissionForm(false);
        setNewStudent({
          name: '',
          roll_no: '',
          class_name: '',
          section: '',
          parent_name: '',
          parent_phone: '',
          address: '',
          total_fees: 25000,
          status: 'ACTIVE'
        });
      } else {
        const error = await res.json();
        alert('Error: ' + (error.detail || 'Failed to admit student'));
      }
    } catch (err) {
      alert('Error connecting to server.');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    try {
      const res = await fetch(`${API_BASE}/api/students/${editingStudent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('access_token')}` },
        body: JSON.stringify({ name: editingStudent.name })
      });
      if (res.ok) {
        setEditingStudent(null);
        fetchStudents();
      } else {
        alert('Failed to update student');
      }
    } catch (err) {}
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.roll_no.toLowerCase().includes(search.toLowerCase())
  );

  const groupedClasses = classes.reduce((acc, classItem) => {
    if (!acc[classItem.division]) {
      acc[classItem.division] = [];
    }
    acc[classItem.division].push(classItem);
    return acc;
  }, {} as Record<string, ApiClass[]>);

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
            <button 
              onClick={() => setShowAdmissionForm(!showAdmissionForm)}
              style={{ backgroundColor: '#fff', color: 'black', padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: 600 }}
            >
              {showAdmissionForm ? 'Cancel' : '+ Admit Student'}
            </button>
        </div>
      </div>

      {showAdmissionForm && (
        <div style={{ backgroundColor: '#111', borderRadius: '12px', border: '1px solid #222', padding: '2rem', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>New Student Admission</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888', fontSize: '0.875rem' }}>Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={newStudent.name}
                  onChange={handleInputChange}
                  placeholder="E.g. Rahul Sharma"
                  style={{ width: '100%', padding: '0.75rem', backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '6px', color: 'white' }}
                  required
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888', fontSize: '0.875rem' }}>Roll Number *</label>
                <input
                  type="text"
                  name="roll_no"
                  value={newStudent.roll_no}
                  onChange={handleInputChange}
                  placeholder="E.g. 2026-01"
                  style={{ width: '100%', padding: '0.75rem', backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '6px', color: 'white' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888', fontSize: '0.875rem' }}>Class *</label>
                <select
                  name="class_id"
                  onChange={handleClassChange}
                  style={{ width: '100%', padding: '0.75rem', backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '6px', color: 'white' }}
                  required
                >
                  <option value="">-- Select Class --</option>
                  {Object.entries(groupedClasses).map(([division, classList]) => (
                    <optgroup key={division} label={division}>
                      {classList.map(classItem => (
                        <option key={classItem.id} value={classItem.id}>
                          {classItem.name} - {classItem.section}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888', fontSize: '0.875rem' }}>Parent Name *</label>
                <input
                  type="text"
                  name="parent_name"
                  value={newStudent.parent_name}
                  onChange={handleInputChange}
                  placeholder="Mr. Name / Mrs. Name"
                  style={{ width: '100%', padding: '0.75rem', backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '6px', color: 'white' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888', fontSize: '0.875rem' }}>Parent Phone *</label>
                <input
                  type="tel"
                  name="parent_phone"
                  value={newStudent.parent_phone}
                  onChange={handleInputChange}
                  placeholder="+91 00000 00000"
                  style={{ width: '100%', padding: '0.75rem', backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '6px', color: 'white' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888', fontSize: '0.875rem' }}>Annual Fee (₹)</label>
                <input
                  type="number"
                  name="total_fees"
                  value={newStudent.total_fees}
                  onChange={handleInputChange}
                  min="0"
                  style={{ width: '100%', padding: '0.75rem', backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '6px', color: 'white' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888', fontSize: '0.875rem' }}>Address</label>
              <textarea
                name="address"
                value={newStudent.address}
                onChange={handleInputChange}
                placeholder="Full residential address..."
                rows={3}
                style={{ width: '100%', padding: '0.75rem', backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '6px', color: 'white', resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                type="submit"
                style={{
                  backgroundColor: '#10b981',
                  color: 'white',
                  padding: '0.75rem 2rem',
                  borderRadius: '8px',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Authorize Admission
              </button>
              <button
                type="button"
                onClick={() => setShowAdmissionForm(false)}
                style={{
                  backgroundColor: '#ef4444',
                  color: 'white',
                  padding: '0.75rem 2rem',
                  borderRadius: '8px',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

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
                <th style={{ padding: '1rem' }}>Section</th>
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
                  <td style={{ padding: '1rem', color: '#888' }}>{s.section}</td>
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
                        onClick={() => setEditingStudent(s)}
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

      {editingStudent && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
            <div style={{ width: '100%', maxWidth: '400px', backgroundColor: '#111', border: '1px solid #333', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', color: 'white' }}>Edit Student</h2>
                <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', color: '#888', marginBottom: '0.5rem' }}>Name *</label>
                        <input required type="text" value={editingStudent.name} onChange={e => setEditingStudent({...editingStudent, name: e.target.value})} style={{ width: '100%', backgroundColor: '#1a1a1a', border: '1px solid #333', color: 'white', padding: '0.75rem', borderRadius: '0.5rem', outline: 'none' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                        <button type="button" onClick={() => setEditingStudent(null)} style={{ backgroundColor: 'transparent', border: '1px solid #333', color: 'white', padding: '0.5rem 1.5rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 500 }}>Cancel</button>
                        <button type="submit" style={{ backgroundColor: '#10b981', border: 'none', color: 'white', padding: '0.5rem 1.5rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 500 }}>Save</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}
