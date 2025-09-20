"use client";
import { useUser } from "@/config/userProvider";
import { useSidebar } from "@/config/sidebarProvider";
import Sidebar from "./sidebar";
import { useEffect, useState } from "react";

export default function SidebarWrapper() {
  const { user } = useUser();
  const { isExpanded } = useSidebar();

  const [isMobile, setIsMobile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Detect mobile
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!user || !user.emailVerified) return null;

  // MOBILE: small button and overlay sidebar
  if (isMobile) {
    return (
      <>
        {/* Small mobile button */}
        <div className="fixed top-4 left-4 z-50">
          <button
            className="p-2 bg-gray-800 text-white rounded-md"
            onClick={() => setMobileOpen(true)}
          >
            ☰
          </button>
        </div>

        {/* Mobile overlay */}
        {mobileOpen && (
          <>
            {/* Semi-transparent background */}
            <div
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setMobileOpen(false)}
            />

            {/* Sidebar overlay */}
            <aside className="fixed left-0 top-0 h-screen w-64 bg-black text-white z-50 transition-all duration-300">
              {/* Close button */}
              <div className="flex justify-end p-2">
                <button
                  className="text-white text-xl font-bold"
                  onClick={() => setMobileOpen(false)}
                >
                  ✕
                </button>
              </div>

              {/* Sidebar content without expand/collapse */}
              <Sidebar hideToggle />
            </aside>
          </>
        )}
      </>
    );
  }
  // DESKTOP: full sidebar
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
