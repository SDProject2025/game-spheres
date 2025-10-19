import { UserProvider } from "@/config/userProvider";
import { SidebarProvider } from "@/config/sidebarProvider";
import { GameSpheresProvider } from "@/config/gameSpheresContext";
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/next"
import AuthGuard from "@/config/authGuard";
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
      <body className="flex">
        <UserProvider>
          <SidebarProvider>
            <GameSpheresProvider>
              <SidebarWrapper />
              <main
                className="flex-1 h-screen overflow-y-auto transition-[margin-left] duration-300 ease-in-out"
                style={{ marginLeft: "var(--sidebar-width, 0px)" }}
              >
                <AuthGuard>
                  <div className="h-full w-full px-6 py-6 pb-10 flex flex-col">{children}</div>
                </AuthGuard>
              </main>
            </GameSpheresProvider>
          </SidebarProvider>
        </UserProvider>
        <SpeedInsights/>
        <Analytics/>
      </body>
    </html>
  );
}