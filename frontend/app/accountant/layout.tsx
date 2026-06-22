'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BaseLayout from '@/components/shared/BaseLayout';
import { LayoutDashboard, AlertCircle, PieChart, ReceiptText, IndianRupee, Wallet } from 'lucide-react';

export default function AccountantLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const userRole = localStorage.getItem('user_role');
    if (!userRole || userRole !== 'ACCOUNTANT') {
      router.push('/login');
    } else {
      setAuthorized(true);
    }
  }, [router]);

  if (!authorized) return null;

  const navGroups = [
    {
      title: 'Main',
      items: [{ name: 'Dashboard', path: '/accountant', icon: <LayoutDashboard size={18} /> }]
    },
    {
      title: 'Finance',
      items: [
        { name: 'Fee Structure', path: '/accountant/fee-structure', icon: <Wallet size={18} /> },\n        { name: 'Collections', path: '/accountant/collections', icon: <IndianRupee size={18} /> },\n        { name: 'Receipts', path: '/accountant/receipts', icon: <ReceiptText size={18} /> },\n        { name: 'Dues', path: '/accountant/dues', icon: <AlertCircle size={18} /> }
      ]
    },
    {
      title: 'Analytics',
      items: [
        { name: 'Reports', path: '/accountant/reports', icon: <PieChart size={18} /> }
      ]
    },
  ];

  return (
    <BaseLayout navGroups={navGroups} basePath="/accountant" roleName="Accountant">
      {children}
    </BaseLayout>
  );
}
