'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BaseLayout from '@/components/shared/BaseLayout';
import { LayoutDashboard, Building2, GraduationCap, PieChart, UserPlus, Users, Bell } from 'lucide-react';

export default function BranchAdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const userRole = localStorage.getItem('user_role');
    if (!userRole || userRole !== 'OFFICE') {
      router.push('/login');
    } else {
      setAuthorized(true);
    }
  }, [router]);

  if (!authorized) return null;

  const navGroups = [
    {
      title: 'Main',
      items: [{ name: 'Dashboard', path: '/branch-admin', icon: <LayoutDashboard size={18} /> }]
    },
    {
      title: 'Organization',
      items: [
        { name: 'Branches', path: '/branch-admin/branches', icon: <Building2 size={18} /> },        { name: 'Classes', path: '/branch-admin/classes', icon: <GraduationCap size={18} /> }
      ]
    },
    {
      title: 'Academic',
      items: [
        { name: 'Admissions', path: '/branch-admin/admissions', icon: <UserPlus size={18} /> },        { name: 'Students', path: '/branch-admin/students', icon: <Users size={18} /> }
      ]
    },
    {
      title: 'Analytics',
      items: [
        { name: 'Reports', path: '/branch-admin/reports', icon: <PieChart size={18} /> }
      ]
    },
    {
      title: 'Administration',
      items: [
        { name: 'Notifications', path: '/branch-admin/notifications', icon: <Bell size={18} /> }
      ]
    },
  ];

  return (
    <BaseLayout navGroups={navGroups} basePath="/branch-admin" roleName="Branch Admin">
      {children}
    </BaseLayout>
  );
}
