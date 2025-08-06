// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
//import { getAnalytics } from "firebase/analytics";

import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();