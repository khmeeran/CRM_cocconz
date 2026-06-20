'use client';

import { useEffect, useState } from 'react';
import { API_BASE } from '../../../lib/api';

interface Staff {
  id: string;
  name: string;
  role: string;
  phone: string;
  email?: string;
  join_date?: string;
  created_at: string;
}

interface SalaryHistory {
  id: string;
  staff_id: string;
  amount_paid: number;
  for_month: string;
  paid_on: string;
  payment_mode: string;
}

export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [salaryHistory, setSalaryHistory] = useState<SalaryHistory[]>([]);
  const [payAmount, setPayAmount] = useState('');
  const [payMonth, setPayMonth] = useState(new Date().toISOString().slice(0, 7));
  const [payMode, setPayMode] = useState('Cash');
  const [paying, setPaying] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    role: 'TEACHER',
    phone: '',
    email: '',
    join_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/staff`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setStaff(data);
      }
    } catch (err) {
      console.error('Failed to fetch staff', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSalaryHistory = async (staffId: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/staff/salary/history/${staffId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setSalaryHistory(data);
      }
    } catch (err) {
      console.error('Failed to fetch salary history', err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');

    try {
      const res = await fetch(`${API_BASE}/api/staff`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'X-CSRF-Token': document.cookie.split('; ').find(row => row.startsWith('csrf_token='))?.split('=')[1] || ''
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setMessage('Staff added successfully!');
        setShowAddForm(false);
        setFormData({ name: '', role: 'TEACHER', phone: '', email: '', join_date: new Date().toISOString().split('T')[0] });
        fetchStaff();
      } else {
        const error = await res.json();
        setMessage('Error: ' + (error.detail || 'Failed to add staff'));
      }
    } catch (err) {
      setMessage('Error connecting to server.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSalaryPay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff || !payAmount) return;

    setPaying(true);
    setMessage('');

    try {
      const res = await fetch(`${API_BASE}/api/staff/salary/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'X-CSRF-Token': document.cookie.split('; ').find(row => row.startsWith('csrf_token='))?.split('=')[1] || ''
        },
        body: JSON.stringify({
          staff_id: selectedStaff.id,
          amount_paid: parseFloat(payAmount),
          for_month: payMonth,
          payment_mode: payMode
        })
      });

      if (res.ok) {
        setMessage('Salary paid successfully!');
        setPayAmount('');
        fetchSalaryHistory(selectedStaff.id);
      } else {
        const error = await res.json();
        setMessage('Error: ' + (error.detail || 'Failed to process salary'));
      }
    } catch (err) {
      setMessage('Error connecting to server.');
    } finally {
      setPaying(false);
    }
  };

  const handleViewSalaryHistory = async (staffMember: Staff) => {
    setSelectedStaff(staffMember);
    await fetchSalaryHistory(staffMember.id);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Super Admin': return '#7c3aed';
      case 'Branch Admin': return '#2563eb';
      case 'Accountant': return '#059669';
      case 'Teacher': return '#d97706';
      default: return '#6b7280';
    }
  };

  return (
    <div style={{ padding: '2rem', color: 'white', backgroundColor: '#0a0a0a', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Staff Management</h1>
          <p style={{ color: '#888' }}>Manage staff members and salary payments.</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          style={{ backgroundColor: '#fff', color: 'black', padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: 600 }}
        >
          {showAddForm ? 'Cancel' : '+ Add Staff'}
        </button>
      </div>

      {showAddForm && (
        <div style={{ backgroundColor: '#111', borderRadius: '12px', border: '1px solid #222', padding: '2rem', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>New Staff Member</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888', fontSize: '0.875rem' }}>Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="E.g. Priya Sharma"
                  style={{ width: '100%', padding: '0.75rem', backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '6px', color: 'white' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888', fontSize: '0.875rem' }}>Role *</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '0.75rem', backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '6px', color: 'white' }}
                  required
                >
                  <option value="TEACHER">Teacher</option>
                  <option value="ACCOUNTANT">Accountant</option>
                  <option value="OFFICE">Office Staff</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888', fontSize: '0.875rem' }}>Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+91 00000 00000"
                  style={{ width: '100%', padding: '0.75rem', backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '6px', color: 'white' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888', fontSize: '0.875rem' }}>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="staff@cocoonz.com"
                  style={{ width: '100%', padding: '0.75rem', backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '6px', color: 'white' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888', fontSize: '0.875rem' }}>Join Date *</label>
                <input
                  type="date"
                  name="join_date"
                  value={formData.join_date}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '0.75rem', backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '6px', color: 'white' }}
                  required
                />
              </div>
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
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting ? 0.6 : 1
                }}
              >
                {submitting ? 'Adding...' : 'Add Staff Member'}
              </button>
            </div>
          </form>
        </div>
      )}

      {message && (
        <div style={{ padding: '1rem', borderRadius: '6px', marginBottom: '1rem', backgroundColor: message.includes('Error') ? '#7f1d1d' : '#065f46', color: 'white' }}>
          {message}
        </div>
      )}

      {selectedStaff && (
        <div style={{ backgroundColor: '#111', borderRadius: '12px', border: '1px solid #222', padding: '2rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Salary Payment - {selectedStaff.name}</h2>
            <button
              onClick={() => setSelectedStaff(null)}
              style={{ backgroundColor: '#ef4444', color: 'white', padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
            >
              Close
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <p style={{ color: '#888', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Staff Member</p>
              <p style={{ fontWeight: 600 }}>{selectedStaff.name}</p>
            </div>
            <div>
              <p style={{ color: '#888', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Role</p>
              <span style={{ padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', backgroundColor: getRoleBadgeColor(selectedStaff.role), color: 'white' }}>
                {selectedStaff.role}
              </span>
            </div>
          </div>

          <form onSubmit={handleSalaryPay} style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888', fontSize: '0.875rem' }}>Amount (₹) *</label>
                <input
                  type="number"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  style={{ width: '100%', padding: '0.75rem', backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '6px', color: 'white' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888', fontSize: '0.875rem' }}>For Month *</label>
                <input
                  type="month"
                  value={payMonth}
                  onChange={(e) => setPayMonth(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '6px', color: 'white' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888', fontSize: '0.875rem' }}>Payment Mode *</label>
                <select
                  value={payMode}
                  onChange={(e) => setPayMode(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '6px', color: 'white' }}
                  required
                >
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={paying}
              style={{
                backgroundColor: '#10b981',
                color: 'white',
                padding: '0.75rem 2rem',
                borderRadius: '8px',
                fontWeight: 600,
                border: 'none',
                cursor: paying ? 'not-allowed' : 'pointer',
                opacity: paying ? 0.6 : 1
              }}
            >
              {paying ? 'Processing...' : 'Pay Salary'}
            </button>
          </form>

          {salaryHistory.length > 0 && (
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Payment History</h3>
              <div style={{ backgroundColor: '#1a1a1a', borderRadius: '8px', border: '1px solid #333', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead style={{ backgroundColor: '#222', borderBottom: '1px solid #333' }}>
                    <tr>
                      <th style={{ padding: '0.75rem' }}>Month</th>
                      <th style={{ padding: '0.75rem' }}>Amount</th>
                      <th style={{ padding: '0.75rem' }}>Mode</th>
                      <th style={{ padding: '0.75rem' }}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salaryHistory.map((record) => (
                      <tr key={record.id} style={{ borderBottom: '1px solid #222' }}>
                        <td style={{ padding: '0.75rem' }}>{record.for_month}</td>
                        <td style={{ padding: '0.75rem' }}>₹{record.amount_paid.toLocaleString()}</td>
                        <td style={{ padding: '0.75rem' }}>{record.payment_mode}</td>
                        <td style={{ padding: '0.75rem', color: '#888' }}>{new Date(record.paid_on).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      <div style={{ backgroundColor: '#111', borderRadius: '12px', border: '1px solid #222', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: '#1a1a1a', borderBottom: '1px solid #222' }}>
            <tr>
              <th style={{ padding: '1rem' }}>Name</th>
              <th style={{ padding: '1rem' }}>Role</th>
              <th style={{ padding: '1rem' }}>Phone</th>
              <th style={{ padding: '1rem' }}>Email</th>
              <th style={{ padding: '1rem' }}>Join Date</th>
              <th style={{ padding: '1rem' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((s) => (
              <tr key={s.id} style={{ borderBottom: '1px solid #222' }}>
                <td style={{ padding: '1rem', fontWeight: 600 }}>{s.name}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', backgroundColor: getRoleBadgeColor(s.role), color: 'white' }}>
                    {s.role}
                  </span>
                </td>
                <td style={{ padding: '1rem', color: '#888' }}>{s.phone}</td>
                <td style={{ padding: '1rem', color: '#888' }}>{s.email || '-'}</td>
                <td style={{ padding: '1rem', color: '#888' }}>{s.join_date ? new Date(s.join_date).toLocaleDateString() : '-'}</td>
                <td style={{ padding: '1rem' }}>
                  <button
                    onClick={() => handleViewSalaryHistory(s)}
                    style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #333', backgroundColor: 'transparent', color: 'white', cursor: 'pointer', fontSize: '0.875rem' }}
                  >
                    View Salary
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: '#555' }}>Loading staff...</div>
        ) : staff.length === 0 && (
          <div style={{ padding: '4rem', textAlign: 'center', color: '#555' }}>
            No staff members found. Click "+ Add Staff" to create one.
          </div>
        )}
      </div>
    </div>
  );
}
