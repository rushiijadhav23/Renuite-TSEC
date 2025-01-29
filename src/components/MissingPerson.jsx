import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config/api";

const MissingPerson = () => {
  const [missingPersons, setMissingPersons] = useState([]);

  useEffect(() => {
    const fetchMissingPersons = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/missing`);
        setMissingPersons(response.data.missing);
      } catch (err) {
        console.error("Error fetching missing persons:", err.message);
      }
    };

    fetchMissingPersons();
  }, []);

  return (
    <div className="space-y-6">
      {missingPersons.map((person) => (
        <PersonCard key={person.missingid} person={person} />
      ))}
    </div>
  );
};

const PersonCard = ({ person }) => {
  return (
    <div className="border-2 border-gray-300 p-6 rounded-lg shadow-lg w-full max-w-7xl mx-auto bg-white">
      <h2 className="text-xl font-bold text-center mb-4 text-[#A294F9]">
        Missing Person Details
      </h2>

      <div className="flex gap-6 items-center rounded-xl shadow-sm bg-gray-50 p-4">
        <div className="w-40 h-40 border-2 border-gray-300 rounded-lg">
          {person.missingphoto ? (
            <img 
              src={`${API_BASE_URL}/image?img=${person.missingphoto}`}
              alt="Missing Person"
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-gray-400">No Image</span>
            </div>
          )}
        </div>
        <div className="w-40 h-40 border-2 border-gray-300 rounded-lg">
          {person.missingphoto ? (
            <img 
              src={`${API_BASE_URL}/image?img=${person.missingphoto}`}
              alt="Missing Person"
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-gray-400">No Image</span>
            </div>
          )}
        </div>

        <div className="flex-grow grid grid-cols-3 gap-6 p-4">
          <div className="p-4 rounded-lg">
            <strong className="block text-gray-700">Missing Person:</strong>
            {person.missing_person || 'Unknown'}
            <br />
            <strong className="block text-gray-700">Informer:</strong>
            {person.informer || 'Unknown'}
          </div>
          <div className="p-4 rounded-lg">
            <strong className="block text-gray-700">Missing Date:</strong>
            {new Date(person.missingdate).toLocaleDateString()}
            <br />
            <strong className="block text-gray-700">Missing Place:</strong>
            {person.missingplace || 'N/A'}
          </div>
          <div className="p-4 rounded-lg">
            <strong className="block text-gray-700">Contact:</strong>
            {person.contactno || 'N/A'}
            <br />
            <strong className="block text-gray-700">Email:</strong>
            {person.email || 'N/A'}
          </div>
        </div>

        <button
          className={`px-6 py-3 rounded-lg text-white font-bold shadow-md transition-all ${
            person.status === 'active' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
          }`}
        >
          {person.status === 'active' ? 'Not Found' : 'Found'}
        </button>
      </div>
    </div>
  );
};

export default MissingPerson;
