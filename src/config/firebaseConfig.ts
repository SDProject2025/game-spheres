import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_CLIENT_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_CLIENT_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_CLIENT_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_CLIENT_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_CLIENT_MESSAGE_ID,
  appId: process.env.NEXT_PUBLIC_CLIENT_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_CLIENT_MEASUREMENT_ID
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
export const storage = getStorage(app);