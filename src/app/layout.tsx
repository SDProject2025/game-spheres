import { ReactNode } from "react";
import { UserProvider } from "@/config/userProvider";

import "@/styles/globals.css";
import Sidebar from "@/components/Sidebar";
export const metadata = {
  title: "GameSpheres",
  description: "yes",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <UserProvider>
        <body className="flex">
          {/* Fix sidebar so its unaffected by scroll*/}
          <aside className="fixed left-0 top-0 h-screen w-64 bg-black text-white">
            <Sidebar />
          </aside>
          {/* main pane of content can scroll */}
          <main className="ml-64 flex-1 h-screen overflow-y-auto">
            {children}
          </main>
        </body>
      </UserProvider>
    </html>
  );
}
