import { useState } from "react";

export default function CommentInput({ onAdd }: { onAdd: (text: string) => void }) {
  const [newComment, setNewComment] = useState("");

  const handleSubmit = () => {
    onAdd(newComment);
    setNewComment("");
  };

  return (
    <div className="p-3 border-t border-gray-700 flex gap-2">
      <input
        type="text"
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        placeholder="Add a comment..."
        className="flex-1 rounded-lg bg-[#222] text-white p-2 text-sm outline-none"
      />
      <button
        onClick={handleSubmit}
        className="px-3 py-1 bg-[#00ffd5] text-black font-medium rounded-lg hover:opacity-90"
      >
        Send
      </button>
    </div>
  );
}
