import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

// Firebase configuration fetched directly from your project
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAbfM4rWobhW3y7g5qe8I4tFMiLn3lgdJ0",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "guardianassist-e4e62.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://guardianassist-e4e62-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "guardianassist-e4e62",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "guardianassist-e4e62.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "276768090297",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:276768090297:web:efb8e300ed51869f5b9368",
  measurementId: "G-TCWXYCTDJX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
