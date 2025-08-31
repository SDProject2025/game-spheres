import { useUser } from "@/config/userProvider";
import { useState, useEffect } from "react";
import { auth } from "@/config/firebaseConfig";
import { FiUser } from "react-icons/fi";
import { useRouter } from "next/navigation";

import ProfilePicture from "../profilePicture";
import FollowButton from "../followButton";
import ProfileStat from "../profileStats";
//import VideoGrid from "./videoGrid";

export type ProfileType = {
  uid: string;
  displayName: string;
  username: string;
  bio: string;
  following: string[];
  followers: string[];
  posts: number;
  photoURL: string;
  //posts: { id: number; thumbnail: string }[];
};

export default function UserDetail({
  profile,
}: {
  profile: ProfileType | null;
}) {
  const router = useRouter();
  const { user, loading } = useUser();
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    if (profile?.followers.includes(user?.uid ? user.uid : "")) {
      setIsFollowing(true);
    } else {
      setIsFollowing(false);
    }
  }, [isFollowing]);

  function viewUserProfile() {
    router.push(`/profile/${profile?.uid}`);
  }

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
      let message = error instanceof Error ? error.message : "Failed to follow";
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
      let message = error instanceof Error ? error.message : "Failed to follow";
      console.log(message);
    }
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#111] text-white flex items-center justify-center">
        <p className="text-gray-400">No profile found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111] text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col gap-8 items-center">
          <ProfilePicture src={profile.photoURL} />

          <div className="flex-1">
            {/* Name and Button Row */}
            <div className="flex items-end gap-4">
              <div>
                <h1 className="text-3xl font-bold leading-tight">
                  {profile.displayName}
                </h1>
                <p className="text-lg">{profile.bio}</p>
                <h2 className="text-lg text-gray-400">@{profile.username}</h2>
              </div>
            </div>

            <div className="flex gap-8 mt-2">
              <ProfileStat
                stat={profile?.following?.length ?? 0}
                type="Following"
              />
              <ProfileStat
                stat={profile?.followers?.length ?? 0}
                type="Followers"
              />
            </div>
          </div>
          {/*TODO: add featured gamesphere/active gamespheres*/}
          <FollowButton
            isFollowing={isFollowing}
            handleFollowClick={sendFollow}
            handleUnfollowClick={sendUnfollow}
          />
          <button
            type="button"
            onClick={() => viewUserProfile()}
            className="mt-6 px-6 py-2 rounded-md font-semibold text-[#111] bg-[#00ffc3] shadow-[0_0_15px_#00ffc3] hover:bg-[#00e6b3] transition flex items-center gap-2"
          >
            <FiUser /> View Profile
          </button>
        </div>
      </div>
    </div>
  );
}
