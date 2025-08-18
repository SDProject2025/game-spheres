"use client";
import { useUser } from "@/config/userProvider";

import Sidebar from "./sidebar";

export default function SidebarWrapper() {
    const { user, loading } = useUser();

    if (!user) return null;
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-black text-white">
      <Sidebar />
    </aside>
  );
}
