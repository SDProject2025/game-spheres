import { initializeApp, credential } from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
var serviceAccount = require("./game-spheres-firebase-adminsdk-fbsvc-7d1a8bbbc1.json");

const app = initializeApp({
  credential: credential.cert(serviceAccount)
});

export const db = getFirestore(app);