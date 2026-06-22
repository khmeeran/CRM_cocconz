'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BaseLayout from '@/components/shared/BaseLayout';
import { LayoutDashboard, Building2, GraduationCap, AlertCircle, PieChart, UserPlus, Users, Bell, IndianRupee, ReceiptText, Wallet, ShieldAlert } from 'lucide-react';

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const userRole = localStorage.getItem('user_role');
    if (!userRole || userRole !== 'ADMIN') {
      router.push('/login');
    } else {
      setAuthorized(true);
    }
  }, [router]);

  if (!authorized) return null;

  const navGroups = [
    {
      title: 'Main',
      items: [{ name: 'Dashboard', path: '/super-admin', icon: <LayoutDashboard size={18} /> }]
    },
    {
      title: 'Organization',
      items: [
        { name: 'Branches', path: '/super-admin/branches', icon: <Building2 size={18} /> },        { name: 'Classes', path: '/super-admin/classes', icon: <GraduationCap size={18} /> }
      ]
    },
    {
      title: 'Academic',
      items: [
        { name: 'Admissions', path: '/super-admin/admissions', icon: <UserPlus size={18} /> },        { name: 'Students', path: '/super-admin/students', icon: <Users size={18} /> }
      ]
    },
    {
      title: 'Finance',
      items: [
        { name: 'Fee Structure', path: '/super-admin/fee-structure', icon: <Wallet size={18} /> },        { name: 'Collections', path: '/super-admin/collections', icon: <IndianRupee size={18} /> },        { name: 'Receipts', path: '/super-admin/receipts', icon: <ReceiptText size={18} /> },        { name: 'Dues', path: '/super-admin/dues', icon: <AlertCircle size={18} /> }
      ]
    },
    {
      title: 'Analytics',
      items: [
        { name: 'Reports', path: '/super-admin/reports', icon: <PieChart size={18} /> }
      ]
    },
    {
      title: 'Administration',
      items: [
        { name: 'Users', path: '/super-admin/users', icon: <ShieldAlert size={18} /> },        { name: 'Notifications', path: '/super-admin/notifications', icon: <Bell size={18} /> }
      ]
    },
  ];

  return (
    <BaseLayout navGroups={navGroups} basePath="/super-admin" roleName="Super Admin">
      {children}
    </BaseLayout>
  );
}
