// app/routes/app-layout.tsx
import { Outlet } from "react-router";
import type { Route } from "./+types/app-layout";
import { Navbar } from "../components/Navbar";
import { Sidebar } from "../components/Sidebar";
import { Toaster } from "sonner";

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
        <div className="h-screen overflow-hidden bg-[#F5F5F5]">
            <div className="flex h-full flex-col">
                <div className="shrink-0">
                    <Navbar />
                </div>

                {/* Body */}
                <div className="flex min-h-0 flex-1">
                    <aside className="shrink-0">
                        <Sidebar />
                    </aside>

                    {/* Only outlet area scrolls */}
                    <main className="min-w-0 flex-1 overflow-auto bg-[#F5F5F5] p-6">
                        <Outlet />
                    </main>
                </div>
            </div>

            {/* Global toast notifications */}
            <Toaster position="top-right" richColors closeButton />
        </div>
    );
}
