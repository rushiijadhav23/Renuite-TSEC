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
    <div className="border-2 border-gray-300 p-6 rounded-lg shadow-lg w-100%  mx-auto bg-gradient-to-b from-[#CDC1FF]">
      <h2 className="text-xl font-bold text-center mb-4 text-[#A294F9]">
        Missing Person Details
      </h2>

      <div className="flex gap-6 items-center rounded-xl shadow-sm bg-gray-50 p-4">
        {/* Image Containers */}
        <div className="w-50 h-40 aspect-square border-2 border-gray-300 rounded-lg overflow-hidden flex items-center justify-center bg-gray-100">
          {person.missingphoto ? (
            <img 
              src={`${API_BASE_URL}/image?img=${person.missingphoto}`}
              alt="Missing Person"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-gray-400">No Image</span>
          )}
        </div>

        <div className="w-50 h-40 aspect-square border-2 border-gray-300 rounded-lg overflow-hidden flex items-center justify-center bg-gray-100">
          {person.aadhaarphoto ? (
            <img 
              src={`${API_BASE_URL}/image?img=${person.aadhaarphoto}`}
              alt="Aadhaar"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-gray-400">No Image</span>
          )}
        </div>

        {/* Details Section */}
        <div className="flex-grow grid grid-cols-3 gap-6 p-4">
          <div className="p-4 rounded-lg">
            <strong className="block text-gray-700">Missing Person:</strong>
            {person.aadhaarname || 'Unknown'}
            <br />
            <strong className="block text-gray-700">Informer:</strong>
            {person.informername || 'Unknown'}
          </div>
          <div className="p-4 rounded-lg">
            <strong className="block text-gray-700">Missing Date:</strong>
            {new Date(person.missingdate).toLocaleDateString()}
            <br />
            <strong className="block text-gray-700">Missing Place:</strong>
            {person.missingplace || 'N/A'}
            {person.status === 'sighted' && (
              <>
                <strong className="block text-gray-700">Sighted Place:</strong>
                <span>{person.sigtedplace || 'N/A'}</span>
              </>
            )}
          </div>
          
          <div className="p-4 rounded-lg">
            <strong className="block text-gray-700">Contact:</strong>
            {person.contactno || 'N/A'}
            <br />
            <strong className="block text-gray-700">Email:</strong>
            {person.email || 'N/A'}
          </div>
        </div>

        {/* Status Button */}
        <button
          className={`px-6 py-3 rounded-lg text-white font-bold shadow-md transition-all ${
            person.status === 'missing' 
              ? 'bg-red-500 hover:bg-red-600' 
              : person.status === 'sighted'
                ? 'bg-yellow-500 hover:bg-yellow-600'
                : 'bg-green-500 hover:bg-green-600'
          }`}
        >
          {person.status === 'missing' ? 'Missing' : person.status === 'sighted' ? 'Sighted' : 'Found'}
        </button>
      </div>
    </div>
  );
};

export default MissingPerson;
