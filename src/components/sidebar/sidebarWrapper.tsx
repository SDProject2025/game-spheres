"use client";
import { useUser } from "@/config/userProvider";
import { useSidebar } from "@/config/sidebarProvider";
import Sidebar from "./sidebar";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";

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

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen && isMobile) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen, isMobile]);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileOpen) {
        setMobileOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [mobileOpen]);

  if (!user || !user.emailVerified) return null;

  // Mobile
  if (isMobile) {
    return (
      <>
        {!mobileOpen && (
          <button
            className="fixed top-4 left-4 z-[60] p-2.5 bg-gray-900 text-white rounded-lg shadow-lg hover:bg-gray-800 transition-colors border border-gray-700"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        )}

        {/* Mobile overlay */}
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />

            {/* Sidebar overlay */}
            <aside
              className="fixed left-0 top-0 h-full w-64 bg-black text-white z-50 shadow-2xl transition-transform duration-300 ease-out"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
            >
              <Sidebar hideToggle onMobileClose={() => setMobileOpen(false)} />
            </aside>
          </>
        )}
      </>
    );
  }

  // Desktop
  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-black text-white z-10 transition-all duration-300 ease-in-out ${
        isExpanded ? "w-64" : "w-16"
      }`}
      aria-label="Main navigation"
    >
      <Sidebar />
    </aside>
  );
}
