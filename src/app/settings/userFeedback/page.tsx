"use client";

import { useState } from "react";
import { useGameSpheresContext } from "@/config/gameSpheresContext";
import MessageBody from "@/components/userFeedback/messageBody";
import NeonButton from "@/components/neonButton";
import { Toaster, toast } from "react-hot-toast";

export default function SettingsPage() {
  const { refreshGameSpheres } = useGameSpheresContext();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [message, setMessage] = useState("");

  const handleClearCache = async () => {
    try {
      setIsRefreshing(true);
      localStorage.removeItem("gameSpheresCache");
      await refreshGameSpheres();
      toast.success("Cache cleared and refreshed!");
    } catch (err) {
      console.error("Error refreshing GameSpheres:", err);
      toast.error("Failed to refresh GameSpheres");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message) {
      await toast.promise(
        fetch("/api/settings/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message }),
        }),
        {
          loading: "Sending feedback...",
          success: "Feedback sent! Thank you 😊",
          error: "Failed to send feedback. Please try again.",
        }
      );
    }
    setMessage("");
  };

  return (
    <>
      <Toaster position="top-center" />
      <div className="max-w-2xl mx-auto p-4 space-y-8">
        {/* Cache Clear Section */}
        <section className="p-4 border rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">Cache Management</h2>
          <NeonButton onClick={handleClearCache} disabled={isRefreshing}>
            {isRefreshing ? "Refreshing..." : "Clear Cache"}
          </NeonButton>
        </section>

        {/* Feedback Section */}
        <section className="p-4 border rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">
            We&apos;d love your feedback!
          </h2>
          <form onSubmit={handleSubmit}>
            <MessageBody value={message} onChange={setMessage} />
            <div className="mt-4">
              <NeonButton type="submit">Submit</NeonButton>
            </div>
          </form>
        </section>
      </div>
    </>
  );
}
