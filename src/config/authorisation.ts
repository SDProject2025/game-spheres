import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/config/firebaseConfig";

export async function withProvider(provider: GoogleAuthProvider) {
    try {
        const result = await signInWithPopup(auth, provider);
        return result;
    } catch (e) {
        console.error("Could not sign in with Google:", e);
    }
}

export async function authFetch(path: string, options: RequestInit = {}) {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error("User is not authenticated");
  }

  const token = await currentUser.getIdToken();

  const headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
  };

  return fetch(path, { ...options, headers });
}