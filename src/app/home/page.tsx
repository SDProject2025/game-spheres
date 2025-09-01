'use client'
import { auth } from "@/config/firebaseConfig"
import { useRouter } from "next/navigation";

export default function Home() {
    const router = useRouter();

    return (
        <div className="flex flex-col justify-center items-center">
            <p>Welcome! Matcha pilates in bali before a labubu rave</p>
            <button type="button" onClick={() => {
                auth.signOut();
                router.replace("/");
            }}>Sign out</button>
            <button type="button" onClick={() => router.push("/profile")}>
                Profile
            </button>
        </div>
    );
}