import { Comment } from "@/types/Comment";
import { useRouter } from "next/navigation";

export default function CommentsList({
  comments,
  userId,
  uploaderId,
  onDelete,
}: {
  comments: Comment[];
  userId?: string;
  uploaderId?: string;
  onDelete: (id: string, userId: string) => void;
}) {
  const router = useRouter();

  const formatTimeSinceUpload = (date: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
    if (diff < 2592000) return `${Math.floor(diff / 604800)} weeks ago`;
    if (diff < 31536000) return `${Math.floor(diff / 2592000)} months ago`;
    return `${Math.floor(diff / 31536000)} years ago`;
  };
  return comments.length === 0 ? (
    <p className="text-gray-400 text-sm">No comments yet. Be the first!</p>
  ) : (
    comments.map((c) => (
      <div key={c.id} className="flex items-start gap-2 w-full group">
        {c.photoURL && (
          <img
            src={c.photoURL}
            alt={c.displayName}
            className="w-8 h-8 rounded-full object-cover shrink-0"
          />
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm text-white break-words whitespace-pre-wrap">
            <span
              className="font-semibold hover:text-gray-400 cursor-pointer"
              onClick={() => router.replace(`/profile/${c.userId}`)}
            >
              {c.displayName}
            </span>
            : {c.text}
          </p>
          <p className="text-xs text-gray-500">
            {formatTimeSinceUpload(c.createdAt)}
          </p>
        </div>
        {(userId === c.userId || userId === uploaderId) && (
          <button
            onClick={() => onDelete(c.id, c.userId)}
            className="text-xs text-red-500 hover:underline opacity-0 group-hover:opacity-100 transition"
          >
            Delete
          </button>
        )}
      </div>
    ))
  );
}
