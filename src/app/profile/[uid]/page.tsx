"use client";
import ProfilePage from "@/components/profile/forms/profilePage";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

import type { Profile } from "@/types/Profile";

export default function ViewProfile() {
  {
    /* kinda went with tiktok style profile view, we can mess around with it though. */
  }
  const [profile, setProfile] = useState<null | Profile>(null);

  const params = useParams();
  const uid = params.uid as string;
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    async function fetchUserData() {
      try {
        const res = await fetch(`/api/profile?uid=${uid}`);
        if (res.ok) {
          const data = await res.json();
          setProfile(data.userData ?? null);
        } else {
          console.error("Error fetching profile");
          setProfile(null);
        }
      } catch (err) {
        console.error(err);
        setProfile(null);
      } finally {
        setLoadingProfile(false);
      }
    }

    fetchUserData();
  }, []);

  if (loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Loading profile...
      </div>
    );
  }

  return <ProfilePage profile={profile} />;
}
