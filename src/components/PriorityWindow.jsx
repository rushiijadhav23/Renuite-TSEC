const priorities = {
    high: [
      { id: 1, name: 'John Doe', age: 12, location: 'Andheri East', time: '2 hours ago' },
      { id: 2, name: 'Jane Smith', age: 15, location: 'Bandra West', time: '3 hours ago' }
    ],
    medium: [
      { id: 3, name: 'Mike Johnson', age: 17, location: 'Dadar', time: '5 hours ago' }
    ],
    low: [
      { id: 4, name: 'Sarah Williams', age: 14, location: 'Colaba', time: '8 hours ago' }
    ]
  };
  
  export default function PriorityWindow() {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Priority Cases</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-red-600">High Priority</h3>
            {priorities.high.map(person => (
              <div key={person.id} className="border-l-4 border-red-500 pl-2 my-2 py-1">
                <p className="font-medium">{person.name}, {person.age}</p>
                <p className="text-sm text-gray-600">{person.location} - {person.time}</p>
              </div>
            ))}
          </div>
  
          <div>
            <h3 className="font-semibold text-yellow-600">Medium Priority</h3>
            {priorities.medium.map(person => (
              <div key={person.id} className="border-l-4 border-yellow-500 pl-2 my-2 py-1">
                <p className="font-medium">{person.name}, {person.age}</p>
                <p className="text-sm text-gray-600">{person.location} - {person.time}</p>
              </div>
            ))}
          </div>
  
          <div>
            <h3 className="font-semibold text-green-600">Low Priority</h3>
            {priorities.low.map(person => (
              <div key={person.id} className="border-l-4 border-green-500 pl-2 my-2 py-1">
                <p className="font-medium">{person.name}, {person.age}</p>
                <p className="text-sm text-gray-600">{person.location} - {person.time}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }