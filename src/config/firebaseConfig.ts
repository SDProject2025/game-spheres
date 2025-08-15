import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyC-tFX8jVZB9RLjjTkexgrbdUgfaGlxags",
  authDomain: "game-spheres.firebaseapp.com",
  projectId: "game-spheres",
  storageBucket: "game-spheres.firebasestorage.app",
  messagingSenderId: "66611692051",
  appId: "1:66611692051:web:6734f5c818d6af1cf535e6",
  measurementId: "G-YPPJCBLSXD"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
export const storage = getStorage(app);