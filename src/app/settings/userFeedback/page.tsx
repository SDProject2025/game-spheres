"use client";

import { useState } from "react";
import MessageBody from "@/components/userFeedback/messageBody";
import NeonButton from "../../../components/neonButton";
import { Toaster, toast } from "react-hot-toast";

export default function FeedbackForm() {
  const [message, setMessage] = useState("");

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
      <form
        onSubmit={handleSubmit}
        className="max-w-2xl mx-auto p-4 border rounded-x1 shadow-md"
      >
        <h2 className="text-x1 font semibold mb-4">
          We&apos;d love your feedback!
        </h2>
        <MessageBody value={message} onChange={setMessage} />
        <NeonButton type="submit">SUBMIT</NeonButton>
      </form>
    </>
  );
}
