"use client";

import { auth } from "@/config/firebaseConfig";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function UserMenu({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  return (
    <div className="bg-[#1c1b1b] rounded-md shadow-lg text-white w-40 z-50">
      <Link
        className="block px-4 py-2 hover:bg-[#3d3c3c]"
        href={"/profile"}
        onClick={onClose}
      >
        Profile
      </Link>
      <button
        className="block w-full text-left px-4 py-2 hover:bg-[#3d3c3c]"
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
