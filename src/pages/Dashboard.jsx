import Graph from '../components/Graph';
import NotificationPanel from '../components/NotificationPanel';
import PriorityWindow from '../components/PriorityWindow';
import { useParams } from 'react-router-dom';
import policeData from '../organizations/police.json';
import ngoData from '../organizations/ngo.json';

export default function Dashboard() {
  const { type, id } = useParams();
  const data = type === 'police' ? policeData : ngoData;
  const organization = data.find(org => org.id === parseInt(id));

  if (!organization) {
    return <div>Organization not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-6">{organization.name} Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Graph />
        </div>
        <div>
          <NotificationPanel />
        </div>
        <div className="lg:col-span-3">
          <PriorityWindow />
        </div>
      </div>
    </div>
  );
}