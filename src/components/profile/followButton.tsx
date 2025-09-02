import { FiUserPlus, FiUserMinus } from "react-icons/fi";
import { useState } from "react";
import Link from "next/link";

interface FollowButtonProps {
  isFollowing: boolean;
  handleFollowClick: () => void;
  handleUnfollowClick: () => void;
}

export default function FollowButton({
  isFollowing,
  handleFollowClick,
  handleUnfollowClick,
}: FollowButtonProps) {
  if (isFollowing) {
    return (
      <button
        type="button"
        onClick={handleUnfollowClick}
        className="mt-6 px-6 py-2 rounded-md font-semibold text-[#111] bg-[#00ffc3] shadow-[0_0_15px_#00ffc3] hover:bg-[#00e6b3] transition flex items-center gap-2"
      >
        <FiUserMinus /> Unfollow
      </button>
    );
  } else {
    return (
      <button
        type="button"
        onClick={handleFollowClick}
        className="mt-6 px-6 py-2 rounded-md font-semibold text-[#111] bg-[#00ffc3] shadow-[0_0_15px_#00ffc3] hover:bg-[#00e6b3] transition flex items-center gap-2"
      >
        <FiUserPlus /> Follow
      </button>
    );
  }
}
