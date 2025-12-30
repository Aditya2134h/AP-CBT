'use client';

import { Button } from '../common/Button';
import { ClockIcon, CheckCircleIcon, XCircleIcon, CalendarIcon } from '@heroicons/react/24/outline';

export interface TestCardProps {
  test: {
    id: string;
    title: string;
    subject: string;
    duration: number;
    startDate: Date;
    endDate: Date;
    status: 'upcoming' | 'available' | 'completed';
    score?: number;
    grade?: string;
  };
}

export function TestCard({ test }: TestCardProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = () => {
    switch (test.status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'available':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'completed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getStatusText = () => {
    switch (test.status) {
      case 'upcoming':
        return 'Upcoming';
      case 'available':
        return 'Available';
      case 'completed':
        return 'Completed';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
              {test.title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              {test.subject}
            </p>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>

        <div className="mt-4 flex items-center text-sm text-gray-500 dark:text-gray-400">
          <ClockIcon className="h-4 w-4 mr-1" />
          <span>{test.duration} minutes</span>
        </div>

        <div className="mt-4 flex items-center text-sm text-gray-500 dark:text-gray-400">
          <CalendarIcon className="h-4 w-4 mr-1" />
          <span>
            {formatDate(test.startDate)} - {formatDate(test.endDate)}
          </span>
        </div>

        <div className="mt-4 flex items-center text-sm text-gray-500 dark:text-gray-400">
          <ClockIcon className="h-4 w-4 mr-1" />
          <span>
            {formatTime(test.startDate)} - {formatTime(test.endDate)}
          </span>
        </div>

        {test.status === 'completed' && test.score !== undefined && (
          <div className="mt-4 flex items-center">
            <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
            <span className="font-medium text-gray-900 dark:text-white">
              Score: {test.score}% {test.grade && `(${test.grade})`}
            </span>
          </div>
        )}

        <div className="mt-6">
          {test.status === 'available' ? (
            <Button variant="primary" className="w-full">
              Start Test
            </Button>
          ) : test.status === 'completed' ? (
            <Button variant="secondary" className="w-full">
              View Results
            </Button>
          ) : (
            <Button variant="secondary" className="w-full" disabled>
              Not Available Yet
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}