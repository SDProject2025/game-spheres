import ProfilePicture from "./profilePicture";
import ProfileButton from "./profileButton";
import ProfileInfo from "./profileInfo";
import ProfileStat from "./profileStats";
import VideoGrid from "./videoGrid";

export type ProfileType = {
    name: string;
    username: string;
    bio: string;
    following: number;
    followers: number;
    isOwner: boolean;
    posts: {id: number; thumbnail: string}[];
};

export default function ProfilePage({ profile }: { profile: ProfileType }) {
    return (
        <div className="min-h-screen bg-[#111] text-white flex flex-col items-center py-10">
            <ProfilePicture src= "pfp.jpg" />
            <ProfileInfo name={profile.name} username={profile.username} bio={profile.bio} />
            <div className="flex gap-8 mt-4">
                {ProfileStat(profile.following, "Following")}
                {ProfileStat(profile.followers, "Followers")}
            </div>
            <ProfileButton isOwner={profile.isOwner} />

            <div className="grid grid-cols-3 gap-0 mt-8 max-w-md w-full">
                <VideoGrid posts={profile.posts} />
            </div>
        </div>
    )
}