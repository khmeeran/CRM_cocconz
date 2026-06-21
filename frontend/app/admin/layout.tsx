'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { API_BASE } from '../../lib/api';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
        await fetch(`${API_BASE}/api/logout`, { method: 'POST', credentials: 'include' });
    } catch (e) {}
    localStorage.removeItem('user_role');
    router.push('/login');
  };

  const navGroups = [
    {
      title: 'Main',
      items: [
        { name: 'Dashboard', path: '/admin' }
      ]
    },
    {
      title: 'Organization',
      items: [
        { name: 'Branches', path: '/admin/branches' },
        { name: 'Classes', path: '/admin/classes' }
      ]
    },
    {
      title: 'Academic',
      items: [
        { name: 'Students', path: '/admin/students' },
        { name: 'Admissions', path: '/admin/admissions' }
      ]
    },
    {
      title: 'Finance',
      items: [
        { name: 'Fee Structure', path: '/admin/fee-structure' },
        { name: 'Collections', path: '/admin/collections' },
        { name: 'Receipts', path: '/admin/receipts' },
        { name: 'Dues', path: '/admin/dues' }
      ]
    },
    {
      title: 'Administration',
      items: [
        { name: 'Users', path: '/admin/users' },
        { name: 'Notifications', path: '/admin/notifications' }
      ]
    },
    {
      title: 'Analytics',
      items: [
        { name: 'Reports', path: '/admin/reports' }
      ]
    },
    {
      title: 'System',
      items: [
        { name: 'Settings', path: '/admin/settings' }
      ]
    }
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--deep-navy, #0A1128)', color: 'white' }}>
      {/* Sidebar */}
      <aside style={{ width: '260px', backgroundColor: 'rgba(255,255,255,0.03)', borderRight: '1px solid rgba(255,255,255,0.05)', padding: '2rem 1rem', display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: '2rem', padding: '0 1rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '1px' }}>COCOONZ <span style={{ color: 'var(--electric-blue, #0066FF)' }}>ERP</span></h2>
        </div>

        <nav style={{ flex: 1, overflowY: 'auto' }}>
          {navGroups.map((group, idx) => (
            <div key={idx} style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ color: 'var(--gray-400, #9CA3AF)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem', padding: '0 1rem' }}>
                {group.title}
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {group.items.map(item => {
                  const isActive = pathname === item.path;
                  return (
                    <li key={item.path}>
                      <Link href={item.path} style={{
                        display: 'block',
                        padding: '0.75rem 1rem',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        color: isActive ? 'white' : 'var(--gray-300, #D1D5DB)',
                        backgroundColor: isActive ? 'var(--electric-blue, #0066FF)' : 'transparent',
                        fontWeight: isActive ? 600 : 400,
                        transition: 'background-color 0.2s'
                      }}>
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div style={{ marginTop: 'auto', padding: '1rem' }}>
           <button onClick={handleLogout} style={{ width: '100%', padding: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger-red, #EF4444)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
             Logout
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
        {children}
      </main>
    </div>
  );
}
