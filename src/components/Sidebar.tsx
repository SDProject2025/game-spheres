"use client";
import { BiChevronLeft } from "react-icons/bi";
import { MdPerson } from "react-icons/md";
import { MdArrowLeft } from "react-icons/md";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CgMoreVertical } from "react-icons/cg";
import { useState } from "react";
import UserMenu from "./UserMenu";

export default function Sidebar() {
  const [isMoreClicked, setIsMoreClicked] = useState(false);

  const pathname = usePathname();

  const navItems = [
    { name: "Home", href: "/home" },
    { name: "GameSpheres", href: "/gamespheres" },
  ];

  return (
    <aside className="h-screen w-64">
      <nav className="h-full flex flex-col bg-black border-r shadow-sm">
        <div className="p-4 pb-2 flex justify-between items-center">
          <h1 className="font-bold w-32">GameSpheres</h1>
          <button className="p-1.5 rounded-lg bg-gray-700 hover:bg-gray-100">
            <MdArrowLeft className="text-black w-5 h-5" />
          </button>
        </div>
        <div className="p-4 pb-2 flex flex-col justify-between">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 p-2 rounded-md hover:bg-gray-800 transition ${
                  isActive ? "bg-gray-800" : ""
                }`}
              >
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
        <div className="border-t flex p-3 mt-auto">
          <img
            src="/pfp.jpg"
            alt="Avatar"
            className="w-8 h-8 rounded-md overflow-hidden bg-[#222] object-cover"
          />
          <div className={`flex justify-between items-center w-full ml-3`}>
            <div className="leading-4 pl-2">
              <h4 className="font-semibold">Username</h4>
              <span className="text-xs text-gray-600">user.name@email.com</span>
            </div>
            <CgMoreVertical
              onClick={() => setIsMoreClicked((prev) => !prev)}
              className="cursor-pointer"
            />
          </div>
          {/* Extra Context Dropdown (Log Out etc.) */}
          {isMoreClicked && (
            <UserMenu onClose={() => setIsMoreClicked(false)} />
          )}
        </div>
      </nav>
    </aside>
  );
}
