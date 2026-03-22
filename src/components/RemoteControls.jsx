import React from 'react';

const RemoteControls = ({ findMe, ledManual, updateFirebaseNode }) => {
  
  return (
    <div className="glass-card">
      <h2>🎮 Remote Controls</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
        Trigger actions on the stick from your phone or desktop.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        
        {/* Find Me Toggle */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px' }}>
          <div>
            <div style={{ fontWeight: 600 }}>Find My Stick</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Activates buzzer & vibration</div>
          </div>
          <button 
            className={`btn ${findMe ? 'btn-danger' : 'btn-primary'}`}
            onClick={() => updateFirebaseNode('findMe', !findMe)}
          >
            {findMe ? '🔊 STOP BUZZER' : 'SEARCH'}
          </button>
        </div>

        {/* LED Override */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px' }}>
          <div>
            <div style={{ fontWeight: 600 }}>Force LED</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Overrides auto-LDR</div>
          </div>
          <button 
            className={`btn ${ledManual ? 'btn-primary' : ''}`}
            style={{ backgroundColor: ledManual ? 'var(--accent-yellow)' : 'var(--bg-tertiary)', color: ledManual ? '#000' : '#fff' }}
            onClick={() => updateFirebaseNode('led_manual', !ledManual)}
          >
            {ledManual ? '🔦 LED ON' : 'TURN ON'}
          </button>
        </div>

        {/* Call Emergency Contact */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px' }}>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--accent-red)' }}>Emergency Call</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Dial +919446543476 instantly</div>
          </div>
          <a 
            href="tel:+919446543476"
            className="btn btn-danger"
            style={{ textDecoration: 'none', padding: '0.5rem 1rem' }}
          >
            📞 CALL NOW
          </a>
        </div>

      </div>
    </div>
  );
};

export default RemoteControls;
