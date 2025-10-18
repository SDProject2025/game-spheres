"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { CgMoreVertical } from "react-icons/cg";
import { useUser } from "@/config/userProvider";
import { useSidebar } from "@/config/sidebarProvider";
import {
  ChevronLeft,
  ChevronRight,
  Home,
  User,
  GamepadIcon,
  Settings,
  SquarePlus,
  X,
} from "lucide-react";
import ChatIcon from "../chat/messageCounter";
import InboxIcon from "../notifications/notificationCounter";
import UserMenu from "../UserMenu";

type SidebarProps = {
  hideToggle?: boolean;
  onMobileClose?: () => void;
};

export default function Sidebar({ hideToggle, onMobileClose }: SidebarProps) {
  const [isMoreClicked, setIsMoreClicked] = useState(false);
  const { user } = useUser();
  const { isExpanded, toggleSidebar } = useSidebar();
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { icon: Home, name: "Home", href: "/home" },
    { icon: GamepadIcon, name: "GameSpheres", href: "/gameSpheres" },
    { icon: SquarePlus, name: "Upload Clip", href: "/uploadClip" },
    { icon: User, name: "Find Friends", href: "/searchUsers" },
    { icon: ChatIcon, name: "Chat", href: "/chat" },
    { icon: InboxIcon, name: "Inbox", href: "/inbox" },
    { icon: Settings, name: "Settings", href: "/settings/userFeedback" },
  ];

  // Close more menu when clicking outside
  useEffect(() => {
    if (isMoreClicked) {
      const handleClick = () => setIsMoreClicked(false);
      document.addEventListener("click", handleClick);
      return () => document.removeEventListener("click", handleClick);
    }
  }, [isMoreClicked]);

  const handleNavClick = (href: string) => {
    router.push(href);
    // Close mobile menu after navigation
    if (onMobileClose) {
      onMobileClose();
    }
  };

  // Force expanded when hideToggle is true (mobile overlay)
  const shouldShowExpanded = hideToggle ? true : isExpanded;

  return (
    <nav className="h-full flex flex-col bg-black border-r border-gray-800 shadow-sm">
      {/* Header */}
      <div className="p-4 flex justify-between items-center border-b border-gray-800">
        {shouldShowExpanded && (
          <h1 className="font-bold text-white text-lg">GameSpheres</h1>
        )}

        {/* Show close button on mobile, chevron on desktop */}
        {hideToggle ? (
          <button
            onClick={onMobileClose}
            className="p-1.5 rounded-lg bg-[#2b2a2a] hover:bg-[#3d3c3c] transition-colors ml-auto"
            aria-label="Close menu"
          >
            <X className="text-white w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={toggleSidebar}
            className={`p-1.5 rounded-lg bg-[#2b2a2a] hover:bg-[#3d3c3c] transition-colors ${
              !isExpanded ? "mx-auto" : ""
            }`}
            aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
          >
            {isExpanded ? (
              <ChevronLeft className="text-white w-5 h-5" />
            ) : (
              <ChevronRight className="text-white w-5 h-5" />
            )}
          </button>
        )}
      </div>

      {/* Navigation Items */}
      <div className="px-2 pb-2 pt-4 flex flex-col gap-1 flex-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <button
              key={item.name}
              onClick={() => handleNavClick(item.href)}
              className={`
                flex items-center gap-3 p-3 rounded-md hover:bg-[#3d3c3c] transition-colors text-left w-full
                ${isActive ? "bg-[#3d3c3c]" : ""}
                ${!shouldShowExpanded ? "justify-center" : ""}
              `}
              aria-label={item.name}
              title={!shouldShowExpanded ? item.name : undefined}
            >
              <item.icon
                className={`w-5 h-5 flex-shrink-0 ${
                  isActive ? "text-[#00ffd5]" : "text-white"
                }`}
              />
              {shouldShowExpanded && (
                <span
                  className={`text-sm font-medium overflow-hidden text-ellipsis whitespace-nowrap ${
                    isActive ? "text-[#00ffd5]" : "text-white"
                  }`}
                >
                  {item.name}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* User Profile Section */}
      <div className="border-t border-gray-700 mt-auto">
        {shouldShowExpanded ? (
          <div className="flex p-3 items-center">
            <img
              src={user?.photoURL || "/pfp.jpg"}
              alt="User avatar"
              className="w-10 h-10 rounded-md bg-[#222] object-cover cursor-pointer hover:ring-2 hover:ring-gray-600 transition-all flex-shrink-0"
              onClick={() => {
                router.push("/profile");
                if (onMobileClose) onMobileClose();
              }}
            />

            <div className="flex justify-between items-center w-full ml-3 min-w-0">
              <div
                className="leading-4 cursor-pointer flex-1 min-w-0"
                onClick={() => {
                  router.push("/profile");
                  if (onMobileClose) onMobileClose();
                }}
              >
                <h4 className="font-semibold text-white text-sm truncate">
                  {user?.displayName}
                </h4>
                <span className="text-xs text-gray-400 truncate block">
                  {user?.email}
                </span>
              </div>

              <div className="relative ml-2 flex-shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMoreClicked((p) => !p);
                  }}
                  className="p-1 cursor-pointer text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
                  aria-label="User menu"
                  aria-expanded={isMoreClicked}
                >
                  <CgMoreVertical className="w-5 h-5" />
                </button>
                {isMoreClicked && (
                  <div className="absolute bottom-full right-0 mb-2">
                    <UserMenu onClose={() => setIsMoreClicked(false)} />
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center p-3">
            <div className="relative">
              <img
                src={user?.photoURL || "/pfp.jpg"}
                alt="User avatar"
                className="w-10 h-10 rounded-md bg-[#222] object-cover cursor-pointer hover:ring-2 hover:ring-gray-600 transition-all"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMoreClicked((p) => !p);
                }}
                title="User menu"
              />
              {isMoreClicked && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/8 mb-2">
                  <UserMenu onClose={() => setIsMoreClicked(false)} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
