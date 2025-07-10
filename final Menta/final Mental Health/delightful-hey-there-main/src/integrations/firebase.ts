// Firebase initialization and export
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// TODO: Replace with your Firebase project config
const firebaseConfig = {
  apiKey: "AIzaSyBSUNQp9PrtrBwLNH0R_8DUM_msdUwrr08",
  authDomain: "novo-wellness-9b522.firebaseapp.com",
  projectId: "novo-wellness-9b522",
  storageBucket: "novo-wellness-9b522.firebasestorage.app",
  messagingSenderId: "494347442970",
  appId: "1:494347442970:web:4f8ad8b5cc6e6b3c4feaa3",
  measurementId: "G-LQ510H41EF"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
