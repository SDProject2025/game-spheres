"use client";
import ProfilePage from "@/components/profile/forms/profilePage";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

export default function ViewProfile() {
  {
    /* kinda went with tiktok style profile view, we can mess around with it though. */
  }
  const [profile, setProfile] = useState<null | {
    uid: string;
    displayName: string;
    username: string;
    bio: string;
    following: string[];
    followers: string[];
    //profile pic
    //posts: { id: number; thumbnail: string }[];
  }>(null);

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

  return <ProfilePage profile={profile}/>;
}
