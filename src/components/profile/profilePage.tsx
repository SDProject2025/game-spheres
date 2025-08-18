import ProfilePicture from "./profilePicture";
import ProfileButton from "./profileButton";
import ProfileInfo from "./profileInfo";
import ProfileStat from "./profileStats";
import VideoGrid from "./videoGrid";

export type ProfileType = {
  displayName: string;
  username: string;
  bio: string;
  following: string[];
  followers: string[];
  //posts: { id: number; thumbnail: string }[];
};

export default function ProfilePage({
  profile,
}: {
  profile: ProfileType | null;
}) {
  if (!profile) {
    return (
      <div className="min-h-screen bg-[#111] text-white flex items-center justify-center">
        <p className="text-gray-400">No profile found</p>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-[#111] text-white flex flex-col items-center py-10">
      <ProfilePicture src="pfp.jpg" />
      <ProfileInfo
        name={profile.displayName}
        username={profile.username}
        bio={profile.bio}
      />
      <div className="flex gap-8 mt-4">
        <ProfileStat stat={profile?.following?.length ?? 0} type="Following"/>
        <ProfileStat stat={profile?.followers?.length ?? 0} type="Followers"/>
      </div>
      <ProfileButton isOwner={true} />

      {/* <div className="grid grid-cols-3 gap-0 mt-8 max-w-md w-full">
        <VideoGrid posts={profile.posts} />
      </div> */}
    </div>
  );
}
