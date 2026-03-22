import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default Leaflet marker icons not loading in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to handle smooth auto-panning
const MapUpdater = ({ coords }) => {
  const map = useMap();
  useEffect(() => {
    if (coords && coords.latitude && coords.longitude) {
      map.flyTo([coords.latitude, coords.longitude], 16, { duration: 1.5 });
    }
  }, [coords, map]);
  return null;
};

const GPSMap = ({ location }) => {
  const [secondsAgo, setSecondsAgo] = useState(0);

  // Update "seconds ago" timer
  useEffect(() => {
    if (!location?.timestamp) return;
    
    const interval = setInterval(() => {
      setSecondsAgo(Math.floor((Date.now() - location.timestamp) / 1000));
    }, 1000);
    
    // Immediate calculation for first render
    setSecondsAgo(Math.floor((Date.now() - location.timestamp) / 1000));
    
    return () => clearInterval(interval);
  }, [location?.timestamp]);

  // If we haven't received a GPS ping in 30 seconds, mark as offline/searching
  const isOffline = secondsAgo > 30;
  
  // Default coordinates fallback
  const defaultCenter = [0, 0];
  const center = location && location.latitude && location.longitude 
    ? [location.latitude, location.longitude] 
    : defaultCenter;

  const handleGoogleMapsRedirect = () => {
    if (location && location.latitude && location.longitude) {
      window.open(`https://www.google.com/maps?q=${location.latitude},${location.longitude}`, '_blank');
    }
  };

  return (
    <div className="glass-card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Header Bar */}
      <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-card)', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            📍 Live Location
          </h2>
          <div style={{ 
            marginTop: '0.8rem',
            fontSize: '0.85rem', 
            fontWeight: 600,
            display: 'inline-block',
            padding: '4px 8px',
            borderRadius: '4px',
            backgroundColor: !location ? 'var(--bg-tertiary)' : (isOffline ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)'),
            color: !location ? 'var(--text-muted)' : (isOffline ? 'var(--accent-red)' : 'var(--accent-green)')
          }}>
            {!location ? 'Awaiting Data...' : (isOffline ? '⚠️ Offline / Searching GPS' : `🟢 Active (Updated ${secondsAgo}s ago)`)}
          </div>
        </div>
        
        <button 
          onClick={handleGoogleMapsRedirect}
          disabled={!location || !location.latitude}
          className="btn btn-primary"
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            opacity: (location && location.latitude) ? 1 : 0.5,
            cursor: (location && location.latitude) ? 'pointer' : 'not-allowed'
          }}
        >
          🗺️ Open in Google Maps
        </button>
      </div>

      {/* Map Container */}
      <div style={{ height: '400px', width: '100%', position: 'relative', backgroundColor: '#e5e7eb' }}>
        {location && location.latitude && location.longitude ? (
          <MapContainer 
            center={center} 
            zoom={16} 
            style={{ height: '100%', width: '100%', zIndex: 1 }}
            zoomControl={true}
          >
            <TileLayer
              attribution='&amp;copy <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={center}>
              <Popup>Guardian Stick Current Location</Popup>
            </Marker>
            <MapUpdater coords={location} />
          </MapContainer>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#6b7280', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ fontSize: '2rem' }}>📡</div>
            <p style={{ fontWeight: 600 }}>Waiting for GPS signal coordinates...</p>
            <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>Make sure the mobile app is sending data to /guardianlocation</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GPSMap;
