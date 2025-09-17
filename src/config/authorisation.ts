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


export async function authFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("No authenticated user");
  }

  const token = await user.getIdToken();

  const headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  return fetch(url, {
    ...options,
    headers,
  });
}