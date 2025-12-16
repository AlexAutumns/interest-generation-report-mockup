// app/routes/app-layout.tsx
import { Outlet } from "react-router";
import type { Route } from "./+types/app-layout";
import { Navbar } from "../components/Navbar";
import { Sidebar } from "../components/Sidebar";

export function meta({}: Route.MetaArgs) {
    return [
        { title: "Interest Generation – Report Generator" },
        {
            name: "description",
            content:
                "Interest generation report generator and preview workspace.",
        },
    ];
}

export default function AppLayout() {
    return (
        <div className="flex min-h-screen flex-col bg-[#F5F5F5]">
            <Navbar />
            <div className="flex flex-1 min-h-0">
                <Sidebar />
                <main className="flex-1 overflow-auto bg-[#F5F5F5] p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
