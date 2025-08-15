"use client";

import { auth } from "@/config/firebaseConfig";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function UserMenu({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  return (
    <div className="absolute bottom-12 right-0 bg-gray-800 rounded-md shadow-lg text-white w-40 z-50">
      <button
        className="rounded-md w-full text-left px-4 py-2 hover:bg-gray-700"
        onClick={() => {
          auth.signOut();
          router.replace("/");
          onClose();
        }}
      >
        Sign Out
      </button>
    </div>
  );
}
