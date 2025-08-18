"use client";
import ProfilePage from "@/components/profile/profilePage";
import { useState, useEffect } from "react";
import { FiEdit2 } from "react-icons/fi";
import { HiMiniPlay } from "react-icons/hi2";

import { useUser } from "@/config/userProvider";

export default function Profile() {
  const [isOwner, setIsOwner] = useState(true);
{/* kinda went with tiktok style profile view, we can mess around with it though. */}
  const profile = {
    name: "Im a Bot",
    username: "@cs2isbetterthanval",
    bio: "what the helly???????????????",
    following: 0,
    followers: 0,
    isOwner: true,
    posts: Array.from({ length: 12 }, (_, i) => ({
      id: i,
      thumbnail: "/holder.jpg"
    })),
  };
  const { user, loading } = useUser();

  useEffect(() => {
    async function fetchUserData() {
      const res = await fetch(`/api/profile?uid=${user?.uid}`);
      if (res.ok) {
        const data = await res.json();
        console.log(data);
      } else
        // TODO: change this message later
        console.error("Fucked it")
    }

    fetchUserData();
  }, []);

  return (
    <ProfilePage profile={profile} />
  );
}
