import { UserProvider } from "@/config/userProvider";
import SidebarWrapper from "@/components/sidebar/sidebarWrapper";
import "@/styles/globals.css";
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
          <SidebarWrapper/>
          {/* main pane of content can scroll */}
          <main className="ml-64 flex-1 h-screen overflow-y-auto">
            {children}
          </main>
        </body>
      </UserProvider>
    </html>
  );
}
