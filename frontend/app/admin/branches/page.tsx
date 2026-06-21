'use client';

import { Plus, Filter, Download } from 'lucide-react';

export default function branchesPage() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
            
            {/* Breadcrumb */}
            <div style={{ fontSize: '0.875rem', color: '#9CA3AF', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span>Admin</span>
                <span>/</span>
                <span style={{ color: 'white', fontWeight: 500 }}>Branches</span>
            </div>

            {/* Header & Action Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 800 }}>Branches</h1>
                
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <Filter size={16} /> Filter
                    </button>
                    <button style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <Download size={16} /> Export
                    </button>
                    <button style={{ backgroundColor: '#0066FF', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', boxShadow: '0 4px 14px 0 rgba(0,102,255,0.39)' }}>
                        <Plus size={18} /> New Entry
                    </button>
                </div>
            </div>

            {/* Content Placeholder */}
            <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem', color: '#9CA3AF' }}>
                <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B', padding: '0.5rem 1rem', borderRadius: '999px', fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem' }}>
                    Module Under Implementation
                </div>
                <p style={{ textAlign: 'center', maxWidth: '400px' }}>
                    This layout structure includes the premium UX action bar and header. Data integration will occur in Backend Phase 2.
                </p>
            </div>

        </div>
    );
}
