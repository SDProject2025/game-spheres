import { FiEdit2, FiUser } from "react-icons/fi";
import Link from "next/link";

interface ProfileButtonProps {
  isOwner: boolean;
  
}

export default function ProfileButton({ isOwner }: ProfileButtonProps) {
  if (isOwner) {
    
    return (
      <Link href="/profile/edit">
        <button className="mt-6 px-6 py-2 rounded-md font-semibold text-[#111] bg-[#00ffc3] shadow-[0_0_15px_#00ffc3] hover:bg-[#00e6b3] transition flex items-center gap-2">
          <FiEdit2 /> Edit Profile
        </button>
      </Link>
    );
  } else {
    return (
      <button type="button" className="mt-6 px-6 py-2 rounded-md font-semibold text-[#111] bg-[#00ffc3] shadow-[0_0_15px_#00ffc3] hover:bg-[#00e6b3] transition flex items-center gap-2">
        <FiUser/> View Profile
      </button>
    )
  }


}
