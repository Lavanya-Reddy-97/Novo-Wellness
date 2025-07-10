// firebase.ts (or firebaseConfig.ts)

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyBSUNQp9PrtrBwLNH0R_8DUM_msdUwrr08",
  authDomain: "novo-wellness-9b522.firebaseapp.com",
  projectId: "novo-wellness-9b522",
  storageBucket: "novo-wellness-9b522.appspot.com",
  messagingSenderId: "494347442970",
  appId: "1:494347442970:web:4f8ad8b5cc6e6b3c4feaa3",
  measurementId: "G-LQ510H41EF"
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Authentication and export
export const auth = getAuth(app);

// Initialize Firestore database and export
export const db = getFirestore(app);

// Initialize Analytics and export (optional)
export const analytics = getAnalytics(app);
