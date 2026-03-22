import React from 'react';
import { useFirebaseData } from './hooks/useFirebaseData';
import AlertBanner from './components/AlertBanner';
import DistanceSensors from './components/DistanceSensors';
import LightSensor from './components/LightSensor';
import StepCounter from './components/StepCounter';
import GPSMap from './components/GPSMap';
import MotionCharts from './components/MotionCharts';
import RemoteControls from './components/RemoteControls';
import EventHistory from './components/EventHistory';
import './index.css';

function App() {
  const { data, isConnected, updateFirebaseNode } = useFirebaseData();

  return (
    <div className="dashboard-container">
      <header className="header">
        <div>
          <h1>Guardian Assist</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Real-time Smart Blind Stick Monitor</p>
        </div>
        <div className="connection-status">
          <div className={`status-dot ${isConnected ? 'online' : 'offline'}`}></div>
          {isConnected ? 'LIVE' : 'DISCONNECTED'}
        </div>
      </header>

      {/* Renders global alerts based on /stick/fall or /stick/manualAlert */}
      <AlertBanner data={data} />

      <main className="grid-layout">
        {/* ROW 1 */}
        <DistanceSensors distance={data.distance} />
        <LightSensor light={data.light} />
        <StepCounter steps={data.steps} />
        <RemoteControls 
          findMe={data.findMe} 
          ledManual={data.led_manual} 
          updateFirebaseNode={updateFirebaseNode} 
        />
        
        {/* ROW 2 */}
        <MotionCharts accel={data.accel} gyro={data.gyro} />
        
        {/* ROW 3 */}
        <div style={{ gridColumn: '1 / -1' }}>
          <EventHistory data={data} />
        </div>
        
        {/* Full Width Map Row */}
        <div style={{ gridColumn: '1 / -1' }}>
          <GPSMap location={data.location} />
        </div>
      </main>
    </div>
  );
}

export default App;
