'use client'
import { auth } from "@/config/firebaseConfig"
import { useRouter } from "next/navigation";

export default function Home() {
    const router = useRouter();
    return (
        <div>
            <p>Welcome! Matcha pilates in bali before a labubu rave</p>
            <button type="button" onClick={() => {
                auth.signOut();
                router.replace("/");
            }}>Sign out</button>
        </div>
    );
}