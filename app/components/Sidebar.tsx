// app/components/Sidebar.tsx
import { NavLink } from "react-router";
import type { ComponentType, SVGProps } from "react";
import {
    Home,
    Archive,
    FilePlus2,
    FileText,
    Gauge,
    Megaphone,
    TrendingUp,
    FileWarning,
} from "lucide-react";

type NavItem = {
    label: string;
    to: string;
    icon?: ComponentType<SVGProps<SVGSVGElement>>;
};

type NavSection = {
    title?: string;
    items: NavItem[];
};

const mainSection: NavSection = {
    items: [
        { label: "Home", to: "/", icon: Home },
        { label: "Report Archive", to: "/archive", icon: Archive },
        { label: "Generate Report", to: "/generate", icon: FilePlus2 },
    ],
};

const previewSection: NavSection = {
    title: "Report Preview",
    items: [
        {
            label: "Executive Summary",
            to: "/preview/executive-summary",
            icon: FileText,
        },
        {
            label: "KPI Overview",
            to: "/preview/kpi-overview",
            icon: Gauge,
        },
        {
            label: "Campaign & Channel Analysis",
            to: "/preview/campaign-channel",
            icon: Megaphone,
        },
        {
            label: "Conversion & Funnel",
            to: "/preview/conversion-funnel",
            icon: TrendingUp,
        },
        {
            label: "Closed Lost Analysis",
            to: "/preview/closed-lost",
            icon: FileWarning,
        },
    ],
};

const sections: NavSection[] = [mainSection, previewSection];

function navClass(isActive: boolean) {
    const base =
        "flex items-center gap-2 rounded-md border-l-2 px-3 py-2 text-sm transition-colors";
    const inactive =
        "border-[#B3A125]/40 text-[#193E6B] hover:bg-[#193E6B]/5 hover:border-[#B3A125] hover:text-[#193E6B]";
    const active =
        "border-[#B3A125] bg-[#193E6B]/10 font-semibold text-[#193E6B]";
    return `${base} ${isActive ? active : inactive}`;
}

export function Sidebar() {
    return (
        <aside className="flex h-full min-h-[calc(100vh-4rem)] w-64 flex-shrink-0 flex-col border-r border-gray-200 bg-white px-4 py-4">
            <nav className="flex flex-1 flex-col gap-4 text-sm">
                {sections.map((section, idx) => (
                    <div key={idx} className="flex flex-col gap-1">
                        {section.title && (
                            <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">
                                {section.title}
                            </div>
                        )}
                        {section.items.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                end={item.to === "/"}
                                className={({ isActive }) => navClass(isActive)}
                            >
                                {item.icon && (
                                    <item.icon className="h-4 w-4 flex-shrink-0" />
                                )}
                                <span className="truncate">{item.label}</span>
                            </NavLink>
                        ))}
                    </div>
                ))}
            </nav>
        </aside>
    );
}
