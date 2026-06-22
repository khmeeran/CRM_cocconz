'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { API_BASE } from '@/lib/api';
import { Search, Menu, X, LogOut, ChevronRight, Bell } from 'lucide-react';

export default function BaseLayout({ children, navGroups, basePath, roleName }: { children: React.ReactNode, navGroups: any[], basePath: string, roleName: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Command Palette Logic
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsCommandPaletteOpen((open) => !open);
      }
      if (e.key === 'Escape') {
        setIsCommandPaletteOpen(false);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleLogout = async () => {
    try {
        await fetch(`${API_BASE}/api/logout`, { method: 'POST', credentials: 'include' });
    } catch (e) {}
    localStorage.removeItem('user_role');
    router.push('/login');
  };

  const allRoutes = navGroups.flatMap((g: any) => g.items);
  const filteredRoutes = allRoutes.filter((r: any) => r.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: '#0A1128', color: 'white', overflow: 'hidden', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 40, backdropFilter: 'blur(4px)' }}
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside style={{
        position: 'relative',
        zIndex: 50,
        width: '260px',
        backgroundColor: 'rgba(255,255,255,0.02)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.3s ease-in-out',
        ...(typeof window !== 'undefined' && window.innerWidth < 768 ? {
            position: 'fixed',
            height: '100%',
            transform: isMobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)'
        } : {})
      }}>
        <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: '0.05em' }}>
            COCOONZ <span style={{ color: '#0066FF' }}>ERP</span>
          </h2>
          <button style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', display: typeof window !== 'undefined' && window.innerWidth < 768 ? 'block' : 'none' }} onClick={() => setIsMobileMenuOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 0' }}>
          {navGroups.map((group, idx) => (
            <div key={idx} style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ padding: '0 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
                {group.title}
              </h4>
              <ul style={{ listStyle: 'none', padding: '0 0.75rem', margin: 0 }}>
                {group.items.map((item: any) => {
                  const isActive = pathname === item.path;
                  return (
                    <li key={item.path} style={{ marginBottom: '0.25rem' }}>
                      <Link 
                        href={item.path} 
                        onClick={() => setIsMobileMenuOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          padding: '0.6rem 1rem',
                          borderRadius: '0.75rem',
                          fontSize: '0.875rem',
                          fontWeight: isActive ? 600 : 500,
                          textDecoration: 'none',
                          color: isActive ? 'white' : '#9ca3af',
                          backgroundColor: isActive ? '#0066FF' : 'transparent',
                          boxShadow: isActive ? '0 0 15px rgba(0,102,255,0.4)' : 'none',
                          transition: 'all 0.2s'
                        }}
                      >
                        {item.icon}
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
           <button 
             onClick={handleLogout} 
             style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%', padding: '0.6rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '0.75rem', cursor: 'pointer', fontWeight: 600, transition: 'background-color 0.2s' }}
           >
             <LogOut size={18} /> Logout
           </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
        
        {/* Top Header */}
        <header style={{ height: '64px', borderBottom: '1px solid rgba(255,255,255,0.05)', backgroundColor: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem', zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', display: typeof window !== 'undefined' && window.innerWidth < 768 ? 'block' : 'none' }} onClick={() => setIsMobileMenuOpen(true)}>
              <Menu size={24} />
            </button>
            <div 
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 1rem', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '999px', cursor: 'pointer', fontSize: '0.875rem', color: '#9ca3af' }}
              onClick={() => setIsCommandPaletteOpen(true)}
            >
              <Search size={14} />
              <span>Search...</span>
              <kbd style={{ marginLeft: '1rem', padding: '0.1rem 0.4rem', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '4px', fontSize: '0.75rem' }}>Ctrl+K</kbd>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#9CA3AF' }}>{roleName}</span>
            <button style={{ position: 'relative', background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>
              <Bell size={20} />
              <span style={{ position: 'absolute', top: '2px', right: '2px', width: '8px', height: '8px', backgroundColor: '#ef4444', borderRadius: '50%', border: '1px solid #0A1128' }}></span>
            </button>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(to top right, #0066FF, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 700, border: '1px solid rgba(255,255,255,0.2)' }}>
              {roleName.substring(0, 2).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', background: 'linear-gradient(to bottom, #0A1128, #050814)' }}>
          {children}
        </main>
      </div>

      {/* Command Palette Modal */}
      {isCommandPaletteOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '10vh', paddingLeft: '1rem', paddingRight: '1rem', backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={() => setIsCommandPaletteOpen(false)}>
          <div 
            style={{ width: '100%', maxWidth: '600px', backgroundColor: '#101D42', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', overflow: 'hidden' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <Search size={20} color="#9ca3af" style={{ marginRight: '0.75rem' }} />
              <input 
                autoFocus
                type="text" 
                placeholder="Jump to..." 
                style={{ flex: 1, backgroundColor: 'transparent', border: 'none', outline: 'none', color: 'white', fontSize: '1rem' }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer' }} onClick={() => setIsCommandPaletteOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <div style={{ maxHeight: '60vh', overflowY: 'auto', padding: '0.5rem' }}>
              {filteredRoutes.length === 0 ? (
                <div style={{ padding: '1rem', textAlign: 'center', color: '#6b7280', fontSize: '0.875rem' }}>No results found</div>
              ) : (
                filteredRoutes.map((route: any) => (
                  <button
                    key={route.path}
                    onClick={() => {
                      router.push(route.path);
                      setIsCommandPaletteOpen(false);
                      setSearchQuery('');
                    }}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', borderRadius: '0.75rem', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ color: '#0066FF' }}>{route.icon}</span>
                      <span style={{ fontWeight: 500, color: '#e5e7eb' }}>{route.name}</span>
                    </div>
                    <ChevronRight size={16} color="#4b5563" />
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
