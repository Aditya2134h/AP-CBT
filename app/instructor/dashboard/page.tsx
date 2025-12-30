'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';
import { InstructorLayout } from '../../../components/dashboard/InstructorLayout';
import { StatsCard } from '../../../components/dashboard/StatsCard';
import { TestList } from '../../../components/tests/TestList';

export default function InstructorDashboard() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/auth/login');
    } else if (session?.user.role !== 'instructor') {
      redirect('/');
    }
  }, [session, status]);

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // Mock test data
  const tests = [
    {
      id: '1',
      title: 'Mathematics Final Exam',
      subject: 'Mathematics',
      duration: 120,
      startDate: new Date(Date.now() + 86400000), // Tomorrow
      endDate: new Date(Date.now() + 172800000), // Day after tomorrow
      status: 'published',
      studentCount: 25,
      submissionCount: 12,
    },
    {
      id: '2',
      title: 'Science Midterm',
      subject: 'Science',
      duration: 90,
      startDate: new Date(Date.now() + 259200000), // 3 days from now
      endDate: new Date(Date.now() + 345600000), // 4 days from now
      status: 'draft',
      studentCount: 0,
      submissionCount: 0,
    },
    {
      id: '3',
      title: 'History Quiz',
      subject: 'History',
      duration: 60,
      startDate: new Date(Date.now() - 3600000), // 1 hour ago
      endDate: new Date(Date.now() + 3600000), // 1 hour from now
      status: 'active',
      studentCount: 18,
      submissionCount: 8,
    },
  ];

  return (
    <InstructorLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Instructor Dashboard</h1>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Tests"
            value={tests.length.toString()}
            trend="up"
            trendValue="15%"
            icon="test"
          />
          <StatsCard
            title="Active Tests"
            value={tests.filter(t => t.status === 'active').length.toString()}
            trend="down"
            trendValue="5%"
            icon="test"
          />
          <StatsCard
            title="Submissions"
            value={tests.reduce((sum, test) => sum + test.submissionCount, 0).toString()}
            trend="up"
            trendValue="25%"
            icon="submission"
          />
          <StatsCard
            title="Students"
            value="42"
            trend="up"
            trendValue="8%"
            icon="users"
          />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Your Tests
          </h2>
          <TestList tests={tests} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Test Performance
            </h2>
            <div className="h-64 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <p className="text-gray-500 dark:text-gray-400">Performance chart will be displayed here</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Student Progress
            </h2>
            <div className="h-64 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <p className="text-gray-500 dark:text-gray-400">Student progress chart will be displayed here</p>
            </div>
          </div>
        </div>
      </div>
    </InstructorLayout>
  );
}