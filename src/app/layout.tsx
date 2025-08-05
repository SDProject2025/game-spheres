import { ReactNode } from "react";
import "@/styles/globals.css"
export const metadata = {
    title: "GameSpheres",
    description: "yes",
};

export default function RootLayout({children}: {children: ReactNode}) {
    return(
        <html>
            <body>
                {children}
            </body>
        </html>
    );
}