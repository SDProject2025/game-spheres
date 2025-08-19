import ProfilePicture from "./profilePicture";
import ProfileButton from "./profileButton";
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
    <div className="min-h-screen bg-[#111] text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex gap-8 items-start">
          <ProfilePicture src="pfp.jpg" />

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
                stat={profile?.following?.length ?? 0}
                type="Following"
              />
              <ProfileStat
                stat={profile?.followers?.length ?? 0}
                type="Followers"
              />
            </div>

            <p className="mt-4 max-w-xl">{profile.bio}</p>
          </div>
           {/*TODO: add featured gamesphere/active gamespheres*/}
          <ProfileButton isOwner={true} />
        </div>

 {/*TODO: add tab changing*/}
        <div className="flex border-b border-gray-700 mt-8">
          <button className="px-4 py-3 font-medium border-b-2 border-white">
            Videos
          </button>
          <button className="px-4 py-3 font-medium text-gray-400">Saved</button>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-4">
          No Videos Posted
          {/*<VideoGrid posts={profile.posts} />*/}
        </div>
      </div>
    </div>
  );
}
