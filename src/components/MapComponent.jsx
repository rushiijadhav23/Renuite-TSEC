// src/components/MapComponent.js

import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

// Set default icon for markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

const MapComponent = ({ onLocationSelect }) => {
  const [position, setPosition] = useState([19.0699797, 72.8397202]); // Default center position

  const eventHandlers = {
    dragend(e) {
      const marker = e.target;
      const { lat, lng } = marker.getLatLng();
      setPosition([lat, lng]);
      onLocationSelect(lat, lng); // Call the function passed as prop
    },
  };

  return (
    <MapContainer center={position} zoom={12} style={{ height: '400px', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker position={position} draggable eventHandlers={eventHandlers}>
        <Popup>Drag me to select location</Popup>
      </Marker>
    </MapContainer>
  );
};
MapComponent.propTypes = {
  onLocationSelect: PropTypes.func.isRequired,
};

export default MapComponent;
