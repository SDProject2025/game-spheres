"use client";
import { useContext, createContext, useState, useEffect } from "react";

interface SidebarContextType {
  isExpanded: boolean;
  toggleSidebar: () => void;
  collapsedWidth: number;
  expandedWidth: number;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isExpanded, setIsExpanded] = useState(true);

  const expandedWidth = 64;
  const collapsedWidth = 16;

  const toggleSidebar = () => setIsExpanded((prev) => !prev);

  useEffect(() => {
    const width = isExpanded ? expandedWidth : collapsedWidth;
    document.documentElement.style.setProperty("--sidebar-width", `${width}px`);
  }, [isExpanded, expandedWidth, collapsedWidth]);

  //keyobard shortcut
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "/") {
        event.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar]);

  return (
    <SidebarContext.Provider
      value={{
        isExpanded,
        toggleSidebar,
        collapsedWidth,
        expandedWidth,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used withing SidebarProvider");
  }
  return context;
};
