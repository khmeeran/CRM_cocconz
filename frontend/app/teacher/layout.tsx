'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BaseLayout from '@/components/shared/BaseLayout';
import { LayoutDashboard, GraduationCap, Bell, Users } from 'lucide-react';

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const userRole = localStorage.getItem('user_role');
    if (!userRole || userRole !== 'TEACHER') {
      router.push('/login');
    } else {
      setAuthorized(true);
    }
  }, [router]);

  if (!authorized) return null;

  const navGroups = [
    {
      title: 'Main',
      items: [{ name: 'Dashboard', path: '/teacher', icon: <LayoutDashboard size={18} /> }]
    },
    {
      title: 'Organization',
      items: [
        { name: 'Classes', path: '/teacher/classes', icon: <GraduationCap size={18} /> }
      ]
    },
    {
      title: 'Academic',
      items: [
        { name: 'Students', path: '/teacher/students', icon: <Users size={18} /> }
      ]
    },
    {
      title: 'Administration',
      items: [
        { name: 'Notifications', path: '/teacher/notifications', icon: <Bell size={18} /> }
      ]
    },
  ];

  return (
    <BaseLayout navGroups={navGroups} basePath="/teacher" roleName="Teacher">
      {children}
    </BaseLayout>
  );
}
