// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAAB9dXWrymvyJSrE8Qg3Op4vXQMEtv2hw",
  authDomain: "aashish-properties.firebaseapp.com",
  projectId: "aashish-properties",
  storageBucket: "aashish-properties.firebasestorage.app",
  messagingSenderId: "1074799820866",
  appId: "1:1074799820866:web:60035a614911eb876faddb",
  measurementId: "G-WJS8TWNW00"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Analytics (only in production and if supported)
let analytics: any = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported && process.env.NODE_ENV === 'production') {
      analytics = getAnalytics(app);
    }
  });
}

export { analytics };

// Enable offline persistence for Firestore
if (typeof window !== 'undefined') {
  import("firebase/firestore").then(({ enableNetwork, disableNetwork }) => {
    // You can enable/disable network as needed
  });
}

// Development mode: Connect to emulators if available
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  // Only connect to emulators if they're running and not already connected
  try {
    // Uncomment these lines if you're using Firebase emulators in development
    // connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    // connectFirestoreEmulator(db, 'localhost', 8080);
  } catch (error) {
    console.log('Firebase emulators not available in development mode');
  }
}

export default app;
