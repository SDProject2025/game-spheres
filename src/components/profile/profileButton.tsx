import { FiEdit2 } from "react-icons/fi";

interface ProfileButtonProps {
    isOwner: boolean;
}

export default function ProfileButton({ isOwner }: ProfileButtonProps) {
    return (
        <button className="mt-6 px-6 py-2 rounded-md font-semibold text-[#111] bg-[#00ffc3] shadow-[0_0_15px_#00ffc3] hover:bg-[#00e6b3] transition flex items-center gap-2">
                {isOwner ? (
                  <>
                    <FiEdit2 /> Edit Profile
                  </>
                ) : (
                  "Follow"
                )}
        </button> /*switches between edit profile or follow depending who user is...also need to check if following/friends*/
    );
}