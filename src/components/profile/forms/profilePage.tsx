import ProfilePicture from "../profilePicture";
import ProfileButton from "../profileButton";
import FollowButton from "../followButton";
import ProfileStat from "../profileStats";
import FollowList from "./followList";
import GameSphereFilter from "@/components/clips/gameSphereFilter";
import ClipGrid from "@/components/clips/ClipGrid";
import { useState, useEffect } from "react";
import { useUser } from "@/config/userProvider";
import { auth } from "@/config/firebaseConfig";

import type { Profile } from "@/types/Profile";
import { authFetch } from "@/config/authorisation";

export default function ProfilePage({ profile }: { profile: Profile | null }) {
  const { user, loading } = useUser();
  const [openType, setOpenType] = useState<null | "followers" | "following">(
    null
  );
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState<"videos" | "saved">("videos");
  const [selectedGameSphere, setSelectedGameSphere] = useState("");

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
      const res = await authFetch(`/api/profile/${profile.uid}/update/follow`, {
        method: "POST",
      });

      if (res.ok) {
        if (user?.uid) profile.followers.push(user.uid);
        setIsFollowing(true);
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to follow";
      console.log(message);
    }
  }

  async function sendUnfollow() {
    if (!profile?.uid) return false;

    try {
      const res = await authFetch(
        `/api/profile/${profile.uid}/update/unfollow`,
        {
          method: "POST",
        }
      );

      if (res.ok) {
        if (user?.uid)
          profile.followers.splice(profile.followers.indexOf(user.uid), 1);
        setIsFollowing(false);
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to follow";
      console.log(message);
    }
  }

  async function fetchFollowData(type: "followers" | "following") {
    if (!profile) return [];
    try {
      const res = await fetch(`/api/profile/${profile.uid}/${type}`);
      if (!res.ok) throw new Error("Failed to fetch follow data");
      const data = await res.json();
      return data.users;
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
      <div className="w-full max-w-5xl mx-auto py-8 ml-64">
        <div className="flex gap-8 items-start">
          <ProfilePicture src={profile.photoURL} />

          <div className="flex-1">
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

        {/* Tabs */}
        <div className="flex border-b border-gray-700 mt-8">
          <button
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === "videos"
                ? "border-white text-white"
                : "border-transparent text-gray-400 hover:text-gray-300"
            }`}
            onClick={() => setActiveTab("videos")}
          >
            Clips
          </button>
          <button
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === "saved"
                ? "border-white text-white"
                : "border-transparent text-gray-400 hover:text-gray-300"
            }`}
            onClick={() => setActiveTab("saved")}
          >
            Saved
          </button>
        </div>

        {/* Content */}
        <div className="mt-6">
          {activeTab === "videos" && (
            <>
              {/* Filter Controls */}
              <div className="mb-6 flex justify-end items-center">
                <div className="flex flex-col items-end">
                  <GameSphereFilter
                    selectedGameSphere={selectedGameSphere}
                    onGameSphereChange={setSelectedGameSphere}
                    className="w-full"
                  />
                  {selectedGameSphere && (
                    <button
                      onClick={() => setSelectedGameSphere("")}
                      className="mt-1 text-sm text-blue-400 hover:text-blue-300"
                    >
                      Clear filter
                    </button>
                  )}
                </div>
              </div>

              {/* Use ClipsGrid with filter options */}
              <ClipGrid
                gameSphereFilter={selectedGameSphere}
                profileFilter={profile.uid}
                key={`${profile.uid}-${selectedGameSphere}`}
              />
            </>
          )}

          {activeTab === "saved" && (
            <ClipGrid
              savedClips={true}
              profileFilter={profile.uid}
              key={`${profile.uid}`}
            />
          )}
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
