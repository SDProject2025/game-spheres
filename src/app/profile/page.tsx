"use client";
import { useState, useEffect } from "react";
import { FiEdit2 } from "react-icons/fi";
import { HiMiniPlay } from "react-icons/hi2";

export default function ProfilePage() {
  const [isOwner] = useState(true);
{/* kinda went with tiktok style profile view, we can mess around with it though. */}
  const profile = {
    username: "@cs2isbetterthanval",
    name: "Im a Bot",
    bio: "what the helly???????????????",
    following: 0,
    followers: 0,
    posts: Array.from({ length: 12 }, (_, i) => ({
      id: i,
      thumbnail: "/holder.jpg"
    })),
  };

  useEffect(() => {
    async function fetchUserData() {
      const res = await fetch(`/api/profile?uid=${uid}`)
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#111] text-white flex flex-col items-center py-10">
      {/* pfp - add rings around it possibly??? */}
      <div className="relative w-32 h-32 rounded-full overflow-hidden bg-[#222]">
        <img
          src="/pfp.jpg"
          alt="Avatar"
          className="w-full h-full object-cover"
        />
      </div>
      <h1 className="mt-4 text-2xl font-bold">{profile.name}</h1>
      <h2 className="text-sm text-gray-400 mt-1">{profile.username}</h2>
      <p className="text-center max-w-xs mt-2">{profile.bio}</p>

      {/* follows info idk if we should have likes as well or gamespheres followed */}
      <div className="flex gap-8 mt-4">
        <div className="text-center">
          <p className="font-bold text-lg">{profile.following}</p>
          <p className="text-gray-400 text-sm">Following</p>
        </div>
        <div className="text-center">
          <p className="font-bold text-lg">{profile.followers}</p>
          <p className="text-gray-400 text-sm">Followers</p>
        </div>
      </div>

      <button className="mt-6 px-6 py-2 rounded-md font-semibold text-[#111] bg-[#00ffc3] shadow-[0_0_15px_#00ffc3] hover:bg-[#00e6b3] transition flex items-center gap-2">
        {isOwner ? (
          <>
            <FiEdit2 /> Edit Profile
          </>
        ) : (
          "Follow"
        )}
      </button>{/* switches between edit profile or follow depending who user is...also need to check if following/friends */}

      {/* videogrid which is like 16:9 aspect ratio for poreview- grid column amount would have to depemd onn videos posted */}
      <div className="grid grid-cols-3 gap-0 mt-8 max-w-md w-full">
        {profile.posts.map((post) => (
          <div key={post.id} className="relative aspect-[9/16] overflow-hidden">
            <img
              src={post.thumbnail}
              alt="hm"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition">
              <HiMiniPlay className="w-8 h-8" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
