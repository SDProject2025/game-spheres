"use client";
import { useUser } from "@/config/userProvider";
import { useSidebar } from "@/config/sidebarProvider";
import Sidebar from "./sidebar";
import { useEffect } from "react";

export default function SidebarWrapper() {
  const { user, loading } = useUser();
  const { isExpanded } = useSidebar();

  useEffect(() => {
    if (!user) {
      document.documentElement.style.setProperty("--sidebar-width", "0px");
    }
  }, [user]);

  if (!user) return null;

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-black text-white z-10 transition-all duration-300 ease-in-out ${
        isExpanded ? "w-64" : "w-16"
      }`}
    >
      <Sidebar />
    </aside>
  );
}
