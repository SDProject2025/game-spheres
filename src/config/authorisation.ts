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

export async function createUser(email: string, password: string) {
    
}