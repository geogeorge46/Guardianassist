import React, { useState, useEffect } from 'react';

const EventHistory = ({ data }) => {
  const [logs, setLogs] = useState([]);
  
  // Create a log entry whenever a significant event occurs
  useEffect(() => {
    if (data.fall) {
      addLog("🚨 Fall Detected", "var(--accent-red)");
    }
  }, [data.fall]);

  useEffect(() => {
    if (data.manualAlert) {
      addLog("🆘 Manual SOS Button Pressed", "var(--accent-red)");
    }
  }, [data.manualAlert]);

  useEffect(() => {
    if (data.distance < 25 && data.distance > 0) {
      // Only log distance alerts occasionally or debounce them, but for this demo:
      addLog(`⚠️ Obstacle extremely close (${Number(data.distance).toFixed(1)} cm)`, "var(--accent-yellow)");
    }
  }, [Math.floor(data.distance / 5)]); // simplistic way to throttle log spam

  useEffect(() => {
    if (data.lastAlert && data.lastAlert !== "") {
      addLog(`✉️ System Msg: ${data.lastAlert}`, "var(--accent-blue)");
    }
  }, [data.lastAlert]);

  const addLog = (message, color) => {
    const newLog = {
      id: Date.now() + Math.random(),
      time: new Date().toLocaleTimeString(),
      message,
      color
    };
    setLogs(prev => [newLog, ...prev].slice(0, 50)); // keep last 50 logs
  };

  return (
    <div className="glass-card col-span-2">
      <h2>📜 Event History / Alert Log</h2>
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: '8px',
        padding: '1rem',
        height: '250px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
      }}>
        {logs.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: 'auto', marginBottom: 'auto' }}>
            No recent events.
          </div>
        ) : (
          logs.map(log => (
            <div key={log.id} style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>[{log.time}]</span>
              <span style={{ color: log.color, fontWeight: 500 }}>{log.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EventHistory;
