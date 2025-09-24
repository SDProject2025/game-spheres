export default function CommentsList({
  comments,
  userId,
  uploaderId,
  onDelete,
}: {
  comments: any[];
  userId?: string;
  uploaderId?: string;
  onDelete: (id: string, userId: string) => void;
}) {
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
            <span className="font-semibold">{c.displayName}</span>: {c.text}
          </p>
          <p className="text-xs text-gray-500">
            {c.createdAt?.toDate?.().toLocaleString?.() || "just now"}
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
