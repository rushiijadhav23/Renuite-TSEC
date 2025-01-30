import { BellIcon } from '@heroicons/react/24/outline';

const notifications = [
  {
    id: 1,
    title: 'New Missing Person Report',
    description: 'A new case has been reported in your jurisdiction.',
    time: '5 minutes ago'
  },
  {
    id: 2,
    title: 'Update on Case #2341',
    description: 'New evidence has been submitted.',
    time: '1 hour ago'
  },
  {
    id: 3,
    title: 'High Priority Alert',
    description: 'Multiple cases reported in sector B-12.',
    time: '2 hours ago'
  }
];

export default function NotificationPanel() {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <div className="flex items-center mb-4">
        <BellIcon className="h-6 w-6 text-gray-500" />
        <h2 className="text-xl font-bold ml-2">Notifications</h2>
      </div>
      <div className="space-y-4">
        {notifications.map((notification) => (
          <div key={notification.id} className="border-b pb-2">
            <h3 className="font-semibold">{notification.title}</h3>
            <p className="text-gray-600">{notification.description}</p>
            <span className="text-sm text-gray-400">{notification.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}