import ProfilePicture from "../profilePicture";
import ProfileButton from "../profileButton";
import FollowButton from "../followButton";
import ProfileStat from "../profileStats";
import FollowList from "./followList";
import VideoGrid from "../videoGrid";
import { useState, useEffect } from "react";
import { useUser } from "@/config/userProvider";
import { auth } from "@/config/firebaseConfig";

import type { Profile } from "@/types/Profile";

export default function ProfilePage({ profile }: { profile: Profile | null }) {
  const { user, loading } = useUser();
  const [openType, setOpenType] = useState<null | "followers" | "following">(
    null
  );
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    if (profile?.followers.includes(user?.uid ?? "")) {
      setIsFollowing(true);
    } else {
      setIsFollowing(false);
    }
  }, [profile, user]);

  async function sendFollow() {
    if (!profile?.uid) return false;

    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`/api/profile/${profile.uid}/follow`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        if (user?.uid) profile.followers.push(user.uid);
        setIsFollowing(true);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to follow";
      console.log(message);
    }
  }

  async function sendUnfollow() {
    if (!profile?.uid) return false;

    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`/api/profile/${profile.uid}/unfollow`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        if (user?.uid)
          profile.followers.splice(profile.followers.indexOf(user.uid), 1);
        setIsFollowing(false);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to follow";
      console.log(message);
    }
  }

  async function fetchFollowData(type: "followers" | "following") {
    if (!profile) return [];
    try {
      const res = await fetch(`/api/profile/${profile.uid}/${type}`);
      if (!res.ok) throw new Error("Failed to fetch follow data");
      const data = await res.json();
      return data.users; // matches the API response
    } catch (err) {
      console.error(err);
      return [];
    }
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#111] text-white flex items-center justify-center">
        <p className="text-gray-400">No profile found</p>
      </div>
    );
  }

  const isOwner = user?.uid === profile.uid;

  return (
    <div className="min-h-screen bg-[#111] text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex gap-8 items-start">
          <ProfilePicture src={profile.photoURL} />

          <div className="flex-1">
            {/* Name and Button Row */}
            <div className="flex items-end gap-4">
              <div>
                <h1 className="text-3xl font-bold leading-tight">
                  {profile.displayName}
                </h1>
                <h2 className="text-lg text-gray-400">@{profile.username}</h2>
              </div>
            </div>

            <div className="flex gap-8 mt-2">
              <ProfileStat
                stat={profile.following.length}
                type="Following"
                onClick={() => setOpenType("following")}
              />
              <ProfileStat
                stat={profile.followers.length}
                type="Followers"
                onClick={() => setOpenType("followers")}
              />
            </div>

            <p className="mt-4 max-w-xl">{profile.bio}</p>
          </div>

          {isOwner ? (
            <ProfileButton />
          ) : (
            <FollowButton
              isFollowing={isFollowing}
              handleFollowClick={sendFollow}
              handleUnfollowClick={sendUnfollow}
            />
          )}
        </div>

        {/* TODO: add tab changing */}
        <div className="flex border-b border-gray-700 mt-8">
          <button className="px-4 py-3 font-medium border-b-2 border-white">
            Videos
          </button>
          <button className="px-4 py-3 font-medium text-gray-400">Saved</button>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-4">
          No Videos Posted
          {/* <VideoGrid posts={profile.posts} /> */}
        </div>
      </div>

      {openType && (
        <FollowList
          type={openType}
          count={
            openType === "followers"
              ? profile.followers.length
              : profile.following.length
          }
          isOpen={true}
          onClose={() => setOpenType(null)}
          onFetchData={fetchFollowData}
        />
      )}
    </div>
  );
}
