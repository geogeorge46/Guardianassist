import React from 'react';

const StepCounter = ({ steps }) => {
  // A simple calculation: assume an average step length of 0.762 meters
  const distanceWalked = (steps * 0.762).toFixed(1);
  const caloriesBurned = (steps * 0.04).toFixed(1); // Rough estimate

  return (
    <div className="glass-card">
      <h2>👟 Step Counter</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '1.5rem 0' }}>
        <div style={{ 
            fontSize: '3.5rem', 
            fontWeight: 800, 
            color: 'var(--accent-purple)',
            lineHeight: 1,
            textShadow: '0 0 20px rgba(139, 92, 246, 0.3)'
        }}>
          {steps || 0}
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', marginTop: '0.5rem' }}>
          Total Steps Walked
        </div>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{distanceWalked} m</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Distance</div>
        </div>
        <div style={{ width: '1px', backgroundColor: 'var(--border-color)' }}></div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: 'var(--accent-yellow)', fontWeight: 600 }}>{caloriesBurned} kcal</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Calories</div>
        </div>
      </div>
    </div>
  );
};

export default StepCounter;
