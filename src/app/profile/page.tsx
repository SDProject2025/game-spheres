"use client";
import ProfilePage from "@/components/profile/profilePage";
import { useState, useEffect } from "react";

import { useUser } from "@/config/userProvider";

export default function Profile() {
  {
    /* kinda went with tiktok style profile view, we can mess around with it though. */
  }
  const [profile, setProfile] = useState<null | {
    displayName: string;
    username: string;
    bio: string;
    following: string[];
    followers: string[];
    //posts: { id: number; thumbnail: string }[];
  }>(null);

  const { user, loading } = useUser();

  useEffect(() => {
    async function fetchUserData() {
      const res = await fetch(`/api/profile?uid=${user?.uid}`);
      if (res.ok) {
        const data = await res.json();
        setProfile(data.userData);
        console.log(data);
      }
      // TODO: change this message later
      else console.error("Fucked it");
    }

    fetchUserData();
  }, []);

  return <ProfilePage profile={profile} />;
}
