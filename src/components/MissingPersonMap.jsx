import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
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
  const [lastSeen, setLastSeen] = useState({ lat: 19.0760, lng: 72.8777, timeElapsed: 60 });
  const [probabilityZones, setProbabilityZones] = useState([]);

  const fetchSearchZones = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:5000/api/search_zones`, {
        params: lastSeen
      });
      setProbabilityZones(response.data);
    } catch (error) {
      console.error("Error fetching search zones:", error);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Missing Person Locator</h2>
      <div style={{ marginBottom: '20px' }}>
        <label>Last Seen Latitude: </label>
        <input 
          type="number" 
          value={lastSeen.lat} 
          onChange={(e) => setLastSeen({ ...lastSeen, lat: parseFloat(e.target.value) })}
          style={{ marginRight: '10px' }}
        />
        <label>Last Seen Longitude: </label>
        <input 
          type="number" 
          value={lastSeen.lng} 
          onChange={(e) => setLastSeen({ ...lastSeen, lng: parseFloat(e.target.value) })}
          style={{ marginRight: '10px' }}
        />
        <label>Time Elapsed (mins): </label>
        <input 
          type="number" 
          value={lastSeen.timeElapsed} 
          onChange={(e) => setLastSeen({ ...lastSeen, timeElapsed: parseInt(e.target.value) })}
          style={{ marginRight: '10px' }}
        />
        <button onClick={fetchSearchZones}>Find Probable Locations</button>
      </div>

      <div style={{ height: "500px", width: "100%", border: '1px solid #ccc' }}>
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
          {probabilityZones.map((zone, index) => (
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