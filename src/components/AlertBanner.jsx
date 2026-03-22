import React, { useEffect, useRef } from 'react';
import '../index.css';

const AlertBanner = ({ data }) => {
  const { fall, manualAlert } = data;
  const permissionRequested = useRef(false);

  // Request browser notification permission on mount
  useEffect(() => {
    if (!permissionRequested.current && "Notification" in window) {
      if (Notification.permission !== "granted" && Notification.permission !== "denied") {
        Notification.requestPermission();
      }
      permissionRequested.current = true;
    }
  }, []);

  // Dispatch push notifications when alerts trigger
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "granted") {
      if (fall) {
        new Notification("🚨 CRITICAL ALERT: FALL DETECTED", {
          body: "Guardian Assist has detected a sudden fall.",
          icon: "/vite.svg" // fallback icon mapping
        });
      }
      if (manualAlert) {
        new Notification("🆘 SOS ALERT: MANUAL HELP REQUESTED", {
          body: "The user has pressed the manual SOS button on the stick.",
          icon: "/vite.svg"
        });
      }
    }
  }, [fall, manualAlert]);

  if (!fall && !manualAlert) return null;

  return (
    <div className="alert-container">
      {fall && (
        <div className="alert-banner fall-alert">
          <span className="alert-icon">🚨</span>
          <div>
            <h3>CRITICAL: FALL DETECTED</h3>
            <p>Immediate attention may be required.</p>
          </div>
        </div>
      )}
      
      {manualAlert && (
        <div className="alert-banner sos-alert">
          <span className="alert-icon">🆘</span>
          <div>
            <h3>SOS: MANUAL ALERT TRIGGERED</h3>
            <p>The user has requested emergency assistance.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertBanner;
