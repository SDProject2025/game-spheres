'use client'
import { auth } from "@/config/firebaseConfig"
import { useRouter } from "next/navigation";
import { updateCurrentUser, updateProfile } from "firebase/auth";
import { useUser } from "@/config/userProvider";

export default function Home() {
    const router = useRouter();
    const { user, loading } = useUser();
    

    if (user){
            updateProfile(user, {
              photoURL: "https://firebasestorage.googleapis.com/v0/b/game-spheres.firebasestorage.app/o/profilePhotos%2Fdefault_avatar.png?alt=media&token=e9eb0302-6064-4757-9c81-227a32f45b54"
            });
          }else{
            console.log("User not found");
          }
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