import { ReactNode } from "react";
import { UserProvider } from "@/config/userProvider";
import "@/styles/globals.css";

export const metadata = {
  title: "GameSpheres",
  description: "yes",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html>
      <body>
        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  );
}
