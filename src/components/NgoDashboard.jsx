import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ngos from '../organizations/ngo.json';
import NotificationPanel from './NotificationPanel';
import PriorityList from './PriorityList';

function NgoDashboard() {
  const { id } = useParams();
  const [dashboardData, setDashboardData] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const ngo = ngos.find(n => n.id === parseInt(id));

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/organization/ngo/${id}/dashboard`, {
          params: {
            lat: ngo.latitude,
            lng: ngo.longitude
          }
        });
        setDashboardData(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    if (ngo) {
      fetchDashboardData();
    }
  }, [id, ngo]);

  if (!ngo) {
    return <div className="p-8">NGO not found</div>;
  }

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{ngo.name} Dashboard</h1>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-gray-600 hover:text-gray-900"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {dashboardData?.notifications?.length > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full h-5 w-5 text-xs flex items-center justify-center">
                {dashboardData.notifications.length}
              </span>
            )}
          </button>
        </div>

        {showNotifications && (
          <NotificationPanel 
            notifications={dashboardData.notifications}
            onClose={() => setShowNotifications(false)}
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Total Missing Persons</h2>
            <p className="text-3xl font-bold text-blue-600">{dashboardData.total_missing_persons}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">High Priority Cases</h2>
            <p className="text-3xl font-bold text-red-600">{dashboardData.high_priority_cases.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Location</h2>
            <p className="text-gray-600">Lat: {ngo.latitude}</p>
            <p className="text-gray-600">Long: {ngo.longitude}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <PriorityList
            title="High Priority Cases"
            cases={dashboardData.high_priority_cases}
            className="bg-red-50"
          />
          <PriorityList
            title="Medium Priority Cases"
            cases={dashboardData.medium_priority_cases}
            className="bg-yellow-50"
          />
          <PriorityList
            title="Low Priority Cases"
            cases={dashboardData.low_priority_cases}
            className="bg-green-50"
          />
        </div>
      </div>
    </div>
  );
}

export default NgoDashboard;