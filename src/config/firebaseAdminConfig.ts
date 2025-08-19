import * as admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.ADMIN_PROJECT_ID,
      clientEmail: process.env.CLIENT_EMAIL,
      privateKey: process.env.ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n")
    })
  });
}

const db = admin.firestore();
const auth = admin.auth();

export { db, auth };