import React from 'react';

function PriorityList({ title, cases, className }) {
  return (
    <div className={`p-6 rounded-lg shadow ${className}`}>
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <div className="space-y-4">
        {cases.map((case_) => (
          <div key={case_.id} className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold">{case_.name}</h3>
            <div className="text-sm text-gray-600">
              <p>Age: {case_.age}</p>
              <p>Gender: {case_.gender}</p>
              <p>Missing for: {case_.time_elapsed} hours</p>
              <p>Last seen: {new Date(case_.last_seen).toLocaleString()}</p>
              <p className="text-xs mt-2">{case_.description}</p>
            </div>
          </div>
        ))}
        {cases.length === 0 && (
          <p className="text-gray-500 text-center">No cases in this category</p>
        )}
      </div>
    </div>
  );
}

export default PriorityList;