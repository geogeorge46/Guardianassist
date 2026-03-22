import { useState, useEffect, useRef } from 'react';
import { ref, onValue, set } from 'firebase/database';
import { db } from '../firebase';

export const useFirebaseData = () => {
  const [data, setData] = useState({
    distance: 0,
    fall: false,
    light: 0,
    manualAlert: false,
    accel: { x: 0, y: 0, z: 0 },
    gyro: { x: 0, y: 0, z: 0 },
    lastAlert: "",
    steps: 0,
    findMe: false,
    led_manual: false,
    heartbeat: 0,
    location: null // Will store { latitude, longitude, timestamp }
  });
  const [isConnected, setIsConnected] = useState(false);
  
  const lastHeartbeatTimeRef = useRef(Date.now());
  const currentHeartbeatRef = useRef(0);

  useEffect(() => {
    const stickRef = ref(db, 'stick');
    const locationRef = ref(db, 'guardianlocation');
    
    // Subscribe to sensor changes
    const unsubscribeStick = onValue(stickRef, (snapshot) => {
      if (snapshot.exists()) {
        const newData = snapshot.val();
        setData(prevData => ({ ...prevData, ...newData }));
        
        if (newData.heartbeat && newData.heartbeat !== currentHeartbeatRef.current) {
            currentHeartbeatRef.current = newData.heartbeat;
            lastHeartbeatTimeRef.current = Date.now();
            setIsConnected(true);
        }
      } else {
        setIsConnected(false);
      }
    });

    // Subscribe to GPS location changes
    const unsubscribeLocation = onValue(locationRef, (snapshot) => {
      if (snapshot.exists()) {
        const loc = snapshot.val();
        setData(prev => ({ 
            ...prev, 
            location: {
                latitude: loc.latitude,
                longitude: loc.longitude,
                timestamp: Date.now() // Track exactly when we received it
            }
        }));
      }
    });
    
    // Safety checker timer
    const intervalId = setInterval(() => {
        if (Date.now() - lastHeartbeatTimeRef.current > 5000) {
            setIsConnected(false);
        }
    }, 2000);

    return () => {
        unsubscribeStick();
        unsubscribeLocation();
        clearInterval(intervalId);
    };
  }, []);

  // Update specific node values (like findMe or led_manual)
  const updateFirebaseNode = (nodePath, value) => {
    const nodeRef = ref(db, `stick/${nodePath}`);
    set(nodeRef, value).catch(err => console.error("Error writing to Firebase:", err));
  };

  return { data, isConnected, updateFirebaseNode };
};
