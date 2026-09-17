import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const DEFAULT_CENTER = [6.9271, 79.8612];

function ClickHandler({ onPick }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}


function AutoInvalidateSize() {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();
    const observer = new ResizeObserver(() => {
      map.invalidateSize();
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [map]);

  return null;
}

export default function LocationPicker({ onChange }) {
  const [position, setPosition] = useState(null);
  const [geoError, setGeoError] = useState(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMapReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by this browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition([latitude, longitude]);
        onChange(latitude, longitude);
      },
      () => {
        setGeoError('Location permission denied — click on the map to set your location.');
      }
    );
    
  }, []);

  const handlePick = (lat, lng) => {
    setPosition([lat, lng]);
    setGeoError(null);
    onChange(lat, lng);
  };

  return (
    <div className="w-full">
      {geoError && <p className="text-sm text-amber-600 mb-2">{geoError}</p>}
      
      <div className="w-full h-[300px] sm:h-[360px] rounded-lg overflow-hidden border border-gray-200">
        {mapReady && (
          <MapContainer
            center={position || DEFAULT_CENTER}
            zoom={position ? 14 : 8}
            className="w-full h-full"
            scrollWheelZoom
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <AutoInvalidateSize />
            <ClickHandler onPick={handlePick} />
            {position && <Marker position={position} />}
          </MapContainer>
        )}
      </div>
      <p className="text-xs text-gray-500 mt-1">
        {position
          ? `Selected: ${position[0].toFixed(5)}, ${position[1].toFixed(5)}`
          : 'Click on the map to set your delivery location.'}
      </p>
    </div>
  );
}