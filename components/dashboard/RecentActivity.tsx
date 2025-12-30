export function RecentActivity() {
  const activities = [
    { id: 1, user: 'John Doe', action: 'created a new test', time: '2 hours ago' },
    { id: 2, user: 'Jane Smith', action: 'published test results', time: '5 hours ago' },
    { id: 3, user: 'Admin', action: 'updated system settings', time: '1 day ago' },
    { id: 4, user: 'Mike Johnson', action: 'added new students', time: '2 days ago' },
    { id: 5, user: 'Sarah Williams', action: 'created a new class', time: '3 days ago' },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Recent Activity
      </h2>
      <div className="flow-root">
        <ul className="-mb-8">
          {activities.map((activity, index) => (
            <li key={activity.id}>
              <div className="relative pb-8">
                {index !== activities.length - 1 ? (
                  <span
                    className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700"
                    aria-hidden="true"
                  />
                ) : null}
                <div className="relative flex space-x-3">
                  <div>
                    <span className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-medium">
                      {activity.user.charAt(0)}
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-1 justify-between space-x-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {activity.user} <span className="font-medium text-gray-900 dark:text-white">{activity.action}</span>
                      </p>
                    </div>
                    <div className="whitespace-nowrap text-right text-sm text-gray-500 dark:text-gray-400">
                      <time dateTime={activity.time}>{activity.time}</time>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-6">
        <a
          href="#"
          className="flex w-full items-center justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600"
        >
          View all activity
        </a>
      </div>
    </div>
  );
}