"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/config/firebaseConfig";
import EditProfileForm from "@/components/profile/EditProfileForm";
import { onAuthStateChanged } from "firebase/auth";
import { Toaster, toast } from "react-hot-toast";

export default function EditProfilePage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        setLoading(false);
      } else {
        toast.error("You must be signed in to edit your profile.");
        router.replace("/auth"); 
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="relative flex justify-center w-full h-full pt-20">
      {userId && (
        <EditProfileForm
          userId={userId}
          onSave={() => {
            toast.success("Profile updated successfully!");
            router.push("/profile"); 
          }}
        />
      )}
      <Toaster />
    </div>
  );
}
