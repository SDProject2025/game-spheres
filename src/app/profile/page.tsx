"use client";
import ProfilePage from "@/components/profile/profilePage";

export default function Profile() {
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

  return (
    <ProfilePage profile={profile} />
  );
}
