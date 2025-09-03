import { UserProvider } from "@/config/userProvider";
import { SidebarProvider } from "@/config/sidebarProvider";
import { GameSpheresProvider } from "@/config/gameSpheresContext";
import SidebarWrapper from "@/components/sidebar/sidebarWrapper";
import "@/styles/globals.css";
import AuthGuard from "@/config/authGuard";
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
        <SidebarProvider>
          <GameSpheresProvider>
            <body className="flex">
              <SidebarWrapper />
              <main
                className="flex-1 h-screen overflow-y-auto transition-all duration-300 ease-in-out"
                style={{ marginLeft: "var(--sidebar-width, 0px)" }}
              >
                <AuthGuard>
                  <div className="px-6 py-4">{children}</div>
                </AuthGuard>
              </main>
            </body>
          </GameSpheresProvider>
        </SidebarProvider>
      </UserProvider>
    </html>
  );
}
