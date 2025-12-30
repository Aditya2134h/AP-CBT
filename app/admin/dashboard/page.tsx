'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';
import { AdminLayout } from '../../../components/dashboard/AdminLayout';
import { StatsCard } from '../../../components/dashboard/StatsCard';
import { RecentActivity } from '../../../components/dashboard/RecentActivity';

export default function AdminDashboard() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/auth/login');
    } else if (session?.user.role !== 'admin') {
      redirect('/');
    }
  }, [session, status]);

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Users"
            value="1,250"
            trend="up"
            trendValue="5.2%"
            icon="users"
          />
          <StatsCard
            title="Active Tests"
            value="42"
            trend="down"
            trendValue="2.1%"
            icon="test"
          />
          <StatsCard
            title="Classes"
            value="18"
            trend="up"
            trendValue="12.5%"
            icon="classes"
          />
          <StatsCard
            title="Security Alerts"
            value="3"
            trend="up"
            trendValue="200%"
            icon="alert"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              System Overview
            </h2>
            <div className="h-64 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <p className="text-gray-500 dark:text-gray-400">Analytics chart will be displayed here</p>
            </div>
          </div>

          <RecentActivity />
        </div>
      </div>
    </AdminLayout>
  );
}