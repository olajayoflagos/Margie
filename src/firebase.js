import { initializeApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getFunctions } from "firebase/functions";

// Firebase config for Spark plan (replace with your project details)
const firebaseConfig = {
  apiKey: "AIzaSyCRlOlAYLgKxC8yaYWn6y0k0SzDKYiDTnM",
  authDomain: "margies.firebaseapp.com",
  projectId: "margies",
  storageBucket: "margies.firebasestorage.app",
  messagingSenderId: "659149044191",
  appId: "1:659149044191:web:c593cbb2d334dec8d5ec6a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const db = getFirestore(app);
const auth = getAuth(app);
const functions = getFunctions(app);

// Enable offline persistence for Firestore to reduce reads (Spark plan: 125K reads/month)
enableIndexedDbPersistence(db).catch(err => {
  console.warn("Offline persistence failed:", err);
});

export { app, db, auth, functions };