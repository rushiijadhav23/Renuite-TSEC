import { Fragment } from 'react';
import { Transition } from '@headlessui/react';

function NotificationPanel({ notifications, onClose }) {
  return (
    <Transition
      show={true}
      as={Fragment}
      enter="transform transition ease-in-out duration-500 sm:duration-700"
      enterFrom="translate-x-full"
      enterTo="translate-x-0"
      leave="transform transition ease-in-out duration-500 sm:duration-700"
      leaveFrom="translate-x-0"
      leaveTo="translate-x-full"
    >
      <div className="fixed inset-0 overflow-hidden z-50">
        <div className="absolute inset-0 overflow-hidden">
          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
            <div className="pointer-events-auto w-screen max-w-md">
              <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                <div className="bg-gray-50 px-4 py-6 sm:px-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-medium text-gray-900">Notifications</h2>
                    <button
                      type="button"
                      className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                      onClick={onClose}
                    >
                      <span className="sr-only">Close panel</span>
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                <ul className="flex-1 divide-y divide-gray-200 overflow-y-auto">
                  {notifications.map((notification) => (
                    <li key={notification.id} className="p-4 hover:bg-gray-50">
                      <div className="flex flex-col space-y-1">
                        <p className="font-medium text-gray-900">{notification.title}</p>
                        <p className="text-sm text-gray-500">{notification.message}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(notification.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  );
}

export default NotificationPanel;