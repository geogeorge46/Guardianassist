import React from 'react';

const LightSensor = ({ light }) => {
  // Assume a darker environment has lower light values, e.g., < 200 means dark
  const threshold = 200;
  const isDark = light < threshold;
  
  return (
    <div className="glass-card">
      <h2>💡 Light Sensor (LDR)</h2>
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '2rem 0' }}>
        <div style={{ 
            width: '120px', 
            height: '120px', 
            borderRadius: '50%', 
            border: `6px solid ${isDark ? 'var(--bg-tertiary)' : 'var(--accent-yellow)'}`,
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center',
            boxShadow: isDark ? 'none' : '0 0 30px rgba(245, 158, 11, 0.4)'
        }}>
          <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{light}</span>
        </div>
      </div>
      
      <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Automated LED Status</p>
        {isDark ? (
          <span style={{ color: 'var(--accent-yellow)', fontWeight: 600, fontSize: '1.2rem' }}>🌕 ON (Dark Env.)</span>
        ) : (
          <span style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '1.2rem' }}>🌑 OFF (Bright Env.)</span>
        )}
      </div>
    </div>
  );
};

export default LightSensor;
