import { useState } from "react";
import { FormEvent } from "react";

type Props = {
  onSendMessage: (message: string) => void;
};

export default function ChatInput({ onSendMessage }: Props) {
  const [newMessage, setNewMessage] = useState("");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!newMessage.trim()) return;
    onSendMessage(newMessage);
    setNewMessage("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 p-3 border-t bg-gray-50 dark:bg-neutral-800"
    >
      <input
        type="text"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        placeholder="Type a message..."
        className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 dark:bg-neutral-900 dark:text-white"
      />
      <button
        type="submit"
        disabled={!newMessage.trim()}
        className="px-4 py-2 bg-teal-300 text-white rounded-lg text-sm font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Send
      </button>
    </form>
  );
}
