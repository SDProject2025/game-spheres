"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import EditProfileForm from "@/components/profile/forms/EditProfileForm";
import { Toaster, toast } from "react-hot-toast";
import { useUser } from "@/config/userProvider";
import { authFetch } from "@/config/authorisation";

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
      const checkRes = await authFetch(`/api/profile/checkUsername?username=${username}`);

      if (checkRes.ok) {
        try {
          const updateRes = await authFetch("/api/profile/update", {
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
          if (updateRes.ok) router.replace("/profile");
        } catch (e) {
          alert("Ya done fucked it");
        }
      } else {
        alert("Username already taken");
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "Error checking username";
      console.error(message);
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
      {user?.uid && (
        <EditProfileForm userId={user.uid} onSave={updateProfile} />
      )}
      <Toaster />
    </div>
  );
}
