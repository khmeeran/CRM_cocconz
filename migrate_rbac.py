import os
import shutil
import re

base_dir = r"E:\CRM_Cocoonz\frontend"
admin_dir = os.path.join(base_dir, "app", "admin")
components_dir = os.path.join(base_dir, "components")
modules_dir = os.path.join(components_dir, "modules")
shared_dir = os.path.join(components_dir, "shared")

os.makedirs(modules_dir, exist_ok=True)
os.makedirs(shared_dir, exist_ok=True)

modules = [
    "branches", "classes", "admissions", "students", 
    "fee-structure", "collections", "receipts", "dues", 
    "reports", "users", "notifications"
]

# 1. Move modules and fix imports
for mod in modules:
    src_page = os.path.join(admin_dir, mod, "page.tsx")
    if not os.path.exists(src_page):
        continue
        
    with open(src_page, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Fix lib/api relative imports
    content = re.sub(r"(['\"])\.\.\/\.\.\/\.\.\/lib\/api(['\"])", r"\1@/lib/api\2", content)
    
    # Capitalize component name (e.g., branches -> BranchesView)
    comp_name = "".join([p.capitalize() for p in mod.split('-')]) + "View"
    
    dest_page = os.path.join(modules_dir, f"{comp_name}.tsx")
    with open(dest_page, 'w', encoding='utf-8') as f:
        f.write(content)

# 2. Create BaseLayout.tsx
base_layout_content = """'use client';

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

  const allRoutes = navGroups.flatMap(g => g.items);
  const filteredRoutes = allRoutes.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()));

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
                {group.items.map(item => {
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
                filteredRoutes.map((route) => (
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
"""

with open(os.path.join(shared_dir, "BaseLayout.tsx"), 'w', encoding='utf-8') as f:
    f.write(base_layout_content)

# 3. Create role folders and routes
roles_config = {
    "super-admin": {
        "role_id": "ADMIN",
        "modules": modules, # All modules
        "title": "Super Admin"
    },
    "branch-admin": {
        "role_id": "OFFICE",
        "modules": ["branches", "classes", "admissions", "students", "reports", "notifications"],
        "title": "Branch Admin"
    },
    "accountant": {
        "role_id": "ACCOUNTANT",
        "modules": ["fee-structure", "collections", "receipts", "dues", "reports"],
        "title": "Accountant"
    },
    "teacher": {
        "role_id": "TEACHER",
        "modules": ["classes", "students", "notifications"],
        "title": "Teacher"
    }
}

nav_icons_map = {
    "branches": "Building2",
    "classes": "GraduationCap",
    "admissions": "UserPlus",
    "students": "Users",
    "fee-structure": "Wallet",
    "collections": "IndianRupee",
    "receipts": "ReceiptText",
    "dues": "AlertCircle",
    "reports": "PieChart",
    "users": "ShieldAlert",
    "notifications": "Bell"
}

def get_nav_group(mod):
    if mod in ["branches", "classes"]: return "Organization"
    if mod in ["admissions", "students"]: return "Academic"
    if mod in ["fee-structure", "collections", "receipts", "dues"]: return "Finance"
    if mod in ["users", "notifications"]: return "Administration"
    if mod in ["reports"]: return "Analytics"
    return "Other"

for role, config in roles_config.items():
    role_dir = os.path.join(base_dir, "app", role)
    os.makedirs(role_dir, exist_ok=True)
    
    # Generate layout.tsx
    layout_content = f"""'use client';

import {{ useState, useEffect }} from 'react';
import {{ useRouter }} from 'next/navigation';
import BaseLayout from '@/components/shared/BaseLayout';
import {{ LayoutDashboard, {", ".join(set([nav_icons_map[m] for m in config["modules"]]))} }} from 'lucide-react';

export default function {config["title"].replace(' ', '')}Layout({{ children }}: {{ children: React.ReactNode }}) {{
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {{
    const userRole = localStorage.getItem('user_role');
    if (!userRole || userRole !== '{config["role_id"]}') {{
      router.push('/login');
    }} else {{
      setAuthorized(true);
    }}
  }}, [router]);

  if (!authorized) return null;

  const navGroups = [
    {{
      title: 'Main',
      items: [{{ name: 'Dashboard', path: '/{role}', icon: <LayoutDashboard size={{18}} /> }}]
    }},
"""
    groups = {}
    for mod in config["modules"]:
        g = get_nav_group(mod)
        if g not in groups: groups[g] = []
        name = " ".join([p.capitalize() for p in mod.split('-')])
        icon = nav_icons_map[mod]
        groups[g].append(f"{{ name: '{name}', path: '/{role}/{mod}', icon: <{icon} size={{18}} /> }}")
        
    for g, items in groups.items():
        joined_items = ",\\n        ".join(items)
        layout_content += f"""    {{
      title: '{g}',
      items: [
        {joined_items}
      ]
    }},
"""
    
    layout_content += f"""  ];

  return (
    <BaseLayout navGroups={{navGroups}} basePath="/{role}" roleName="{config["title"]}">
      {{children}}
    </BaseLayout>
  );
}}
"""
    with open(os.path.join(role_dir, "layout.tsx"), 'w', encoding='utf-8') as f:
        f.write(layout_content)
        
    # Generate dashboard page (page.tsx)
    # We will reuse the AdminDashboard logic from before, but simplified for the specific role
    with open(os.path.join(admin_dir, "page.tsx"), 'r', encoding='utf-8') as f:
        dashboard_content = f.read()
    
    # We strip out the role checks from the dashboard since layout already enforces it
    dashboard_content = dashboard_content.replace("{(userRole === 'ADMIN' || userRole === 'OFFICE') && (", "{true && (")
    dashboard_content = dashboard_content.replace("{(userRole === 'ADMIN' || userRole === 'OFFICE' || userRole === 'ACCOUNTANT') && (", "{true && (")
    dashboard_content = dashboard_content.replace("{(userRole === 'ADMIN' || userRole === 'ACCOUNTANT') && (", "{true && (")
    
    # Only show what is applicable for this role. For simplicity, we can let the role check fail by hardcoding userRole to config['role_id']
    dashboard_content = re.sub(r"const \[userRole, setUserRole\] = useState<string \| null>\(null\);", f"const userRole = '{config['role_id']}';", dashboard_content)
    dashboard_content = dashboard_content.replace("setUserRole(localStorage.getItem('user_role'));", "")
    
    # Replace router.push('/admin/admissions') with router.push('/{role}/admissions')
    dashboard_content = dashboard_content.replace("'/admin/admissions'", f"'/{role}/admissions'")
    
    dashboard_content = dashboard_content.replace("Good Morning, Admin", f"Good Morning, {config['title']}")
    
    with open(os.path.join(role_dir, "page.tsx"), 'w', encoding='utf-8') as f:
        f.write(dashboard_content)
        
    # Generate module pages
    for mod in config["modules"]:
        mod_dir = os.path.join(role_dir, mod)
        os.makedirs(mod_dir, exist_ok=True)
        comp_name = "".join([p.capitalize() for p in mod.split('-')]) + "View"
        page_content = f"""'use client';
import {comp_name} from '@/components/modules/{comp_name}';

export default function Page() {{
    return <{comp_name} />;
}}
"""
        with open(os.path.join(mod_dir, "page.tsx"), 'w', encoding='utf-8') as f:
            f.write(page_content)

print("Migration scripts created successfully.")
