import React, { useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config/api"; // Importing the base API URL

const MissingPerson = () => {
  useEffect(() => {
    // Function to fetch missing persons data
    const fetchMissingPersons = async () => {
      try {
        // Fetch data using axios
        const response = await axios.get(`${API_BASE_URL}/missing`);
        console.log("API Response:", response.data); // Log the response to the console
      } catch (err) {
        console.error("Error fetching missing persons:", err.message);
      }
    };

    fetchMissingPersons(); // Call the function when the component loads
  }, []); // Empty dependency array ensures this runs only once

  return (
    <div className="space-y-6">
      {/* Static UI */}
      <PersonCard />
    </div>
  );
};

const PersonCard = () => {
  return (
    <div className="border-2 border-gray-300 p-6 rounded-lg shadow-lg w-full max-w-7xl mx-auto bg-white">
      <h2 className="text-xl font-bold text-center mb-4 text-[#A294F9]">
        Missing Person Details
      </h2>

      <div className="flex gap-6 items-center rounded-xl shadow-sm bg-gray-50 p-4">
        {/* Image Boxes */}
        <div className="w-40 h-40 border-2 border-gray-300 rounded-lg flex items-center justify-center">
          <span className="text-gray-400">No Image</span>
        </div>
        <div className="w-40 h-40 border-2 border-gray-300 rounded-lg flex items-center justify-center">
          <span className="text-gray-400">No Image</span>
        </div>

        {/* Information Section */}
        <div className="flex-grow grid grid-cols-3 gap-6 p-4">
          <div className="p-4 rounded-lg">
            <strong className="block text-gray-700">Missing Person:</strong>
            Unknown
            <br />
            <strong className="block text-gray-700">Informer:</strong>
            Unknown
          </div>
          <div className="p-4 rounded-lg">
            <strong className="block text-gray-700">Missing Date:</strong>
            N/A
            <br />
            <strong className="block text-gray-700">Missing Place:</strong>
            N/A
          </div>
          <div className="p-4 rounded-lg">
            <strong className="block text-gray-700">Contact:</strong>
            N/A
            <br />
            <strong className="block text-gray-700">Email:</strong>
            N/A
          </div>
        </div>

        {/* Status Button */}
        <button
          className={`px-6 py-3 rounded-lg text-white font-bold shadow-md transition-all bg-red-500 hover:bg-red-600`}
        >
          Not Found
        </button>
      </div>
    </div>
  );
};

export default MissingPerson;
