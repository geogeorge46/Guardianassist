import React from 'react';

const DistanceSensors = ({ distance }) => {
  // Let's assume 'distance' is the closest one, or we can handle front/side via distance.front etc.
  // The schema says: /stick/distance: Float (Either front or side sensor, can show proximity)
  
  // Determine color based on proximity threshold (< 25 cm is critical red)
  const isCritical = distance < 25;
  const isWarning = distance >= 25 && distance <= 50;
  
  let statusColor = "var(--accent-green)";
  let statusText = "Safe Distance";
  
  if (isCritical) {
    statusColor = "var(--accent-red)";
    statusText = "TOO CLOSE";
  } else if (isWarning) {
    statusColor = "var(--accent-yellow)";
    statusText = "Approaching Obstacle";
  }

  // Simple progress bar calculating percentage (assuming 0 to 200cm range)
  const maxDistance = 200;
  const percentage = Math.min((distance / maxDistance) * 100, 100);

  return (
    <div className="glass-card">
      <h2>📏 Distance Sensor (Front/Side)</h2>
      <div className="distance-info">
        <div style={{ fontSize: '3rem', fontWeight: 700, color: statusColor, display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
          {Number(distance).toFixed(1)} <span style={{ fontSize: '1.25rem', color: "var(--text-muted)" }}>cm</span>
        </div>
        <div style={{ color: statusColor, fontWeight: 600, marginBottom: '1rem' }}>
          {statusText}
        </div>
        
        {/* Progress Bar Gauge */}
        <div style={{ width: '100%', height: '12px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '6px', overflow: 'hidden' }}>
          <div style={{ 
            height: '100%', 
            width: `${percentage}%`, 
            backgroundColor: statusColor,
            transition: 'width 0.3s ease, background-color 0.3s ease'
          }}></div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
          <span>0 cm</span>
          <span>Max Range</span>
        </div>
      </div>
    </div>
  );
};

export default DistanceSensors;
