'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';
import { StudentLayout } from '../../../components/dashboard/StudentLayout';
import { TestCard } from '../../../components/tests/TestCard';

export default function StudentDashboard() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/auth/login');
    } else if (session?.user.role !== 'student') {
      redirect('/');
    }
  }, [session, status]);

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // Mock test data
  const upcomingTests = [
    {
      id: '1',
      title: 'Mathematics Final Exam',
      subject: 'Mathematics',
      duration: 120,
      startDate: new Date(Date.now() + 86400000), // Tomorrow
      endDate: new Date(Date.now() + 172800000), // Day after tomorrow
      status: 'upcoming',
    },
    {
      id: '2',
      title: 'Science Midterm',
      subject: 'Science',
      duration: 90,
      startDate: new Date(Date.now() + 259200000), // 3 days from now
      endDate: new Date(Date.now() + 345600000), // 4 days from now
      status: 'upcoming',
    },
  ];

  const availableTests = [
    {
      id: '3',
      title: 'History Quiz',
      subject: 'History',
      duration: 60,
      startDate: new Date(Date.now() - 3600000), // 1 hour ago
      endDate: new Date(Date.now() + 3600000), // 1 hour from now
      status: 'available',
    },
  ];

  const completedTests = [
    {
      id: '4',
      title: 'English Composition',
      subject: 'English',
      duration: 90,
      startDate: new Date(Date.now() - 86400000), // Yesterday
      endDate: new Date(Date.now() - 43200000), // Half day ago
      status: 'completed',
      score: 85,
      grade: 'B',
    },
  ];

  return (
    <StudentLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome, {session?.user.name}</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Here's your learning progress and available tests</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Learning Progress
            </h2>
            <div className="h-48 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <p className="text-gray-500 dark:text-gray-400">Progress chart will be displayed here</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Performance Summary
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Average Score</span>
                <span className="font-semibold text-gray-900 dark:text-white">82.5%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Tests Taken</span>
                <span className="font-semibold text-gray-900 dark:text-white">15</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Pass Rate</span>
                <span className="font-semibold text-gray-900 dark:text-white">93%</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Quick Stats
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Upcoming Tests</span>
                <span className="font-semibold text-gray-900 dark:text-white">{upcomingTests.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Available Tests</span>
                <span className="font-semibold text-gray-900 dark:text-white">{availableTests.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Completed Tests</span>
                <span className="font-semibold text-gray-900 dark:text-white">{completedTests.length}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {upcomingTests.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Upcoming Tests
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {upcomingTests.map((test) => (
                  <TestCard key={test.id} test={test} />
                ))}
              </div>
            </div>
          )}

          {availableTests.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Available Tests
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableTests.map((test) => (
                  <TestCard key={test.id} test={test} />
                ))}
              </div>
            </div>
          )}

          {completedTests.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Recent Results
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {completedTests.map((test) => (
                  <TestCard key={test.id} test={test} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </StudentLayout>
  );
}