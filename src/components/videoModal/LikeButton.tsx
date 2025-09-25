import { Heart } from "lucide-react";

export default function LikeButton({
  isLiked,
  likesCount,
  onClick,
  disabled,
}: {
  isLiked: boolean;
  likesCount: number;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`flex items-center gap-1 text-white transition ${
        disabled ? "opacity-50 cursor-not-allowed" : "hover:text-[#00ffd5]"
      }`}
    >
      {isLiked ? (
        <Heart className="text-[#00ffd5] fill-[#00ffd5]" />
      ) : (
        <Heart className="text-[#00ffd5]" />
      )}
      <span className="text-sm">{likesCount}</span>
    </button>
  );
}
