"use client";
import { useEffect } from "react";
export default function ResetMessages() {
  useEffect(() => {
    async function reset() {
      try {
        const res = await fetch("/api/messageReset");
        if (!res.ok) console.error("Reset failed");
      } catch (err) {
        console.error(err);
      }
    }

    reset();
  }, []);

  return null;
}
