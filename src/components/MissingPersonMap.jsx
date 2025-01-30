import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import { API_BASE_URL } from '../config/api'; // Ensure API_BASE_URL is set correctly
import axios from "axios";
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MissingPersonMap = () => {
  const [lastSeen, setLastSeen] = useState({ 
    lat: 19.0760, 
    lng: 72.8777, 
    timeElapsed: 60,
    age: 25, 
    gender: "Male" 
  });
  
  const [probabilityZones, setProbabilityZones] = useState([]);

  const fetchSearchZones = async () => {
    try {
      const params = {
        lat: lastSeen.lat,
        lng: lastSeen.lng,
        timeElapsed: lastSeen.timeElapsed > 0 ? lastSeen.timeElapsed : 60, // Default to 60 mins
        age: lastSeen.age,
        gender: lastSeen.gender
      };

      console.log(params);
      
      const response = await axios.get(`${API_BASE_URL}/api/search_zones`, { params });
      console.log(response.data);
      // Access the 'zones' property from response data
      setProbabilityZones(response.data || []); // Fallback to empty array
    } catch (error) {
      console.error("Error fetching search zones:", error);
      setProbabilityZones([]); // Reset on error
    }
  };

  return (
    <div className="text-[#A294F9] p-6 bg-gradient-to-b from-[#CDC1FF]">
      <h2 className="text-2xl font-bold mb-4 text-center">Missing Person Locator</h2>

      {/* Form Section */}
      <div className="bg-transparent p-4 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Latitude */}
          <div className="flex flex-col">
            <label className="font-semibold">Last Seen Latitude:</label>
            <input 
              className="border-2 border-[#A294F9] p-2 rounded-md text-black"
              type="number" 
              value={lastSeen.lat} 
              onChange={(e) => setLastSeen({ ...lastSeen, lat: parseFloat(e.target.value) })}
            />
          </div>

          {/* Longitude */}
          <div className="flex flex-col">
            <label className="font-semibold">Last Seen Longitude:</label>
            <input 
              className="border-2 border-[#A294F9] p-2 rounded-md text-black"
              type="number" 
              value={lastSeen.lng} 
              onChange={(e) => setLastSeen({ ...lastSeen, lng: parseFloat(e.target.value) })}
            />
          </div>

          {/* Time Elapsed */}
          <div className="flex flex-col">
            <label className="font-semibold">Time Elapsed (mins):</label>
            <input 
              className="border-2 border-[#A294F9] p-2 rounded-md text-black"
              type="number" 
              value={lastSeen.timeElapsed} 
              onChange={(e) => setLastSeen({ ...lastSeen, timeElapsed: parseInt(e.target.value) })}
            />
          </div>

          {/* Age */}
          <div className="flex flex-col">
            <label className="font-semibold">Age:</label>
            <input 
              className="border-2 border-[#A294F9] p-2 rounded-md text-black"
              type="number" 
              value={lastSeen.age} 
              onChange={(e) => setLastSeen({ ...lastSeen, age: parseInt(e.target.value) })}
            />
          </div>

          {/* Gender */}
          <div className="flex flex-col">
            <label className="font-semibold">Gender:</label>
            <select 
              className="border-2 border-[#A294F9] p-2 rounded-md text-black"
              value={lastSeen.gender}
              onChange={(e) => setLastSeen({ ...lastSeen, gender: e.target.value })}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
        </div>

        {/* Button */}
        <div className="flex justify-center mt-4">
          <button 
            className="bg-[#A294F9] text-white px-6 py-2 rounded-md font-semibold hover:bg-[#8b7dfb] transition"
            onClick={fetchSearchZones}
          >
            Find Probable Locations
          </button>
        </div>
      </div>

      {/* Map Section */}
      <div className="mt-6 border rounded-md shadow-md" style={{ height: "500px", width: "100%" }}>
        <MapContainer 
          center={[lastSeen.lat, lastSeen.lng]} 
          zoom={13} 
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[lastSeen.lat, lastSeen.lng]}>
            <Popup>Last Seen Location</Popup>
          </Marker>
          {probabilityZones?.map((zone, index) => ( // Add optional chaining
            <Circle 
              key={index} 
              center={[lastSeen.lat, lastSeen.lng]} 
              radius={zone.radius} 
              pathOptions={{ color: zone.color }}
            />
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default MissingPersonMap;