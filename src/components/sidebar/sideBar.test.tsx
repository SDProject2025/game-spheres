/** 
 * @jest-environment jsdom
 */

import { screen, render, fireEvent } from "@testing-library/react";
import Sidebar from "./sidebar";
import { useSidebar } from "@/config/sidebarProvider";
import { GoogleAuthProvider } from "firebase/auth/web-extension";
import { useContext } from "react";
import { usePathname, useRouter } from "next/navigation";

jest.mock("@firebase/auth", () => ({
    getAuth: jest.fn(),
    GoogleAuthProvider: jest.fn(),
}));

jest.mock("@/config/sidebarProvider", () => ({
    useContext: jest.fn(),
    useSidebar: jest.fn(),
}));

jest.mock("next/navigation", () => ({
    useRouter: jest.fn(),
    usePathname: jest.fn(),
}));

describe("SideBar Component", () => {
    it("renders all sidebar components correctly", () => {
        const { useSidebar } = require("@/config/sidebarProvider");

        useSidebar.mockReturnValue({ 
            isExpanded: true, //sidebar is expanded
        });



        render(<Sidebar />);

        expect(screen.getByTestId('home')).toBeInTheDocument();
        expect(screen.getByTestId('gamespheres')).toBeInTheDocument();
        expect(screen.getByTestId('uploadclip')).toBeInTheDocument();
        expect(screen.getByTestId('searchusers')).toBeInTheDocument();
        expect(screen.getByTestId('chat')).toBeInTheDocument();
        expect(screen.getByTestId('inbox')).toBeInTheDocument();
        expect(screen.getByTestId('settings')).toBeInTheDocument();
    });
});