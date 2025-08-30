import ProfilePicture from "./profilePicture";
import FollowButton from "./followButton";
import ProfileButton from "./profileButton";
import ProfileStat from "./profileStats";
import { useUser } from "@/config/userProvider";
import { useState, useEffect } from "react";
import { getIdToken } from "firebase/auth";
import { auth } from "@/config/firebaseConfig";
//import VideoGrid from "./videoGrid";

export type ProfileType = {
  uid: string;
  displayName: string;
  username: string;
  bio: string;
  following: string[];
  followers: string[];
  posts: number;
  //posts: { id: number; thumbnail: string }[];
};

export default function UserDetail({
  profile,
}: {
  profile: ProfileType | null;
}) {
  const { user, loading } = useUser();
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    if (profile?.followers.includes(user?.uid ? user.uid : "")) {
      setIsFollowing(true);
    } else {
      setIsFollowing(false);
    }
  }, [isFollowing]);

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
        if (user?.uid) profile.followers.splice(profile.followers.indexOf(user.uid), 1);
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
          <ProfilePicture src="pfp.jpg" />

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
          <ProfileButton isOwner={false} />
        </div>
      </div>
    </div>
  );
}
