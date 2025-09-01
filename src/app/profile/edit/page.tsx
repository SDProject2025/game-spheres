"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import EditProfileForm from "@/components/profile/forms/EditProfileForm";
import { Toaster, toast } from "react-hot-toast";
import { useUser } from "@/config/userProvider";

export default function EditProfilePage() {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      setLoading(false);
    } else {
      toast.error("You must be signed in to edit your profile.");
      router.replace("/auth");
    }
  }, [router, user]);

  async function updateProfile(
    displayName: string,
    username: string,
    bio: string,
    photoURL: string
  ) {
    try {
      const res = await fetch("/api/profile/update", {
        method: "POST",
        body: JSON.stringify({
          uid: user?.uid,
          displayName,
          username,
          bio,
          photoURL,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (res.ok) router.replace("/profile");
    } catch (e) {
      alert("Ya done fucked it");
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="relative flex justify-center w-full h-full pt-20">
      {user?.uid && <EditProfileForm userId={user.uid} onSave={updateProfile} />}
      <Toaster />
    </div>
  );
}
