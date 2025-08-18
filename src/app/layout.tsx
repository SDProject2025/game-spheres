import { UserProvider } from "@/config/userProvider";
import { SidebarProvider } from "@/config/sidebarProvider";
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
        <SidebarProvider>
          <body className="flex">
            <SidebarWrapper />
            <main
              className="flex-1 h-screen overflow-y-auto transition-all duration-300 ease-in-out"
              style={{ marginLeft: "var(--sidebar-width, 0px)" }}
            >
              <div className="px-6 py-4">{children}</div>
            </main>
          </body>
        </SidebarProvider>
      </UserProvider>
    </html>
  );
}
