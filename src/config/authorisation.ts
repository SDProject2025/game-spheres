import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/config/firebaseConfig";

export async function withProvider(provider: GoogleAuthProvider) {
    const result = await signInWithPopup(auth, provider);
}