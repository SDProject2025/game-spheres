"use client";
import { MdArrowLeft } from "react-icons/md";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CgMoreVertical } from "react-icons/cg";
import { useState } from "react";
import UserMenu from "../UserMenu";
import { useRouter } from "next/navigation";
import { useUser } from "@/config/userProvider";
import { useSidebar } from "@/config/sidebarProvider";
import {
  ChevronLeft,
  ChevronRight,
  Home,
  User,
  GamepadIcon,
} from "lucide-react";

export default function Sidebar() {
  const [isMoreClicked, setIsMoreClicked] = useState(false);

  const { user, loading } = useUser();
  const { isExpanded, toggleSidebar } = useSidebar();

  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { icon: Home, name: "Home", href: "/home" },
    { icon: GamepadIcon, name: "GameSpheres", href: "/gameSpheres" },
  ];

  return (
    <nav
      className={`h-full flex flex-col bg-black border-r shadow-sm ${
        isExpanded ? "" : "sidebar-collapsed"
      }`}
    >
      {/* Header */}
      <div className="p-4 pb flex justify-between items-center border-b">
        {isExpanded && <h1 className="font-bold text-white">GameSpheres</h1>}
        <button
          onClick={toggleSidebar}
          className={`p-1.5 rounded-lg bg-[#2b2a2a] hover:bg-[#3d3c3c] transition-colors ${
            !isExpanded ? "mx-auto" : ""
          }`}
        >
          {isExpanded ? (
            <ChevronLeft className="text-white w-5 h-5" />
          ) : (
            <ChevronRight className="text-white w-5 h-5" />
          )}
        </button>
      </div>

      {/* Navigation Items */}
      <div className="px-2 pb-2 pt-4 flex flex-col gap-1 mt-5">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                sidebar-item flex items-center gap-3 p-3 rounded-md hover:bg-[#3d3c3c] transition-colors
                ${isActive ? "bg-[#3d3c3c]" : ""}
                ${!isExpanded ? "justify-center" : ""}
              `}
              data-label={item.name}
            >
              <item.icon className="w-5 h-5 flex-shrink-0 text-white" />
              {isExpanded && (
                <span className="text-sm font-medium text-white overflow-hidden">
                  {item.name}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* User Profile Section */}
      <div className="border-t border-gray-700 mt-auto">
        {isExpanded ? (
          // Expanded view
          <div className="flex p-3 items-center">
            <img
              src={user?.photoURL || "/pfp.jpg"}
              alt="Avatar"
              className="w-8 h-8 rounded-md overflow-hidden bg-[#222] object-cover cursor-pointer"
              onClick={() => router.replace("/profile")}
            />

            <div className="flex justify-between items-center w-full ml-3">
              <div
                className="leading-4 cursor-pointer flex-1 min-w-0"
                onClick={() => router.replace("/profile")}
              >
                <h4 className="font-semibold text-white text-sm truncate">
                  {user?.displayName}
                </h4>
                <span className="text-xs text-gray-400 truncate block">
                  {user?.email}
                </span>
              </div>

              <div className="relative ml-2">
                <CgMoreVertical
                  onClick={() => setIsMoreClicked((p) => !p)}
                  className="cursor-pointer text-gray-400 hover:text-white transition-colors flex-shrink-0"
                />
                {isMoreClicked && (
                  <div className="absolute bottom-full right-0 mb-2">
                    <UserMenu onClose={() => setIsMoreClicked(false)} />
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          // Collapsed view
          <div className="flex justify-center p-3">
            <div className="relative">
              <img
                src={user?.photoURL || "/pfp.jpg"}
                alt="Avatar"
                className="w-8 h-8 rounded-md overflow-hidden bg-[#222] object-cover cursor-pointer hover:ring-2 hover:ring-gray-600 transition-all"
                onClick={() => setIsMoreClicked((p) => !p)}
                title="User menu"
              />
              {isMoreClicked && (
                <div className="absolute bottom-full">
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
