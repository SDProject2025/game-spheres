import * as admin from "firebase-admin";

const serviceAccount = require("./game-spheres-firebase-adminsdk-fbsvc-7d1a8bbbc1.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

export { db };