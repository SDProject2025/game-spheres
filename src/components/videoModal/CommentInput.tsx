import { useState, FormEvent } from "react";

export default function CommentInput({
  onAdd,
}: {
  onAdd: (text: string) => void;
}) {
  const [newComment, setNewComment] = useState("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newComment.trim() === "") return;
    onAdd(newComment);
    setNewComment("");
  };

  return (
    <form
      className="p-3 border-t border-gray-700 flex gap-2"
      onSubmit={handleSubmit}
    >
      <input
        type="text"
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        placeholder="Add a comment..."
        className="flex-1 rounded-lg bg-[#222] text-white p-2 text-sm outline-none"
      />
      <button
        type="submit"
        disabled={!newComment.trim()}
        className="px-3 py-1 bg-[#00ffd5] text-black font-medium rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Send
      </button>
    </form>
  );
}
