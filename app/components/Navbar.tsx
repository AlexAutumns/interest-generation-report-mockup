// app/components/Navbar.tsx
import { Link } from "react-router";

import ClaaS2SaaSLogo from "../assets/CLaaS2SaaS- Horizontal (dark bck).svg";

type NavbarProps = {
    userName?: string;
    userRole?: string;
};

export function Navbar({
    userName = "Akia Hans",
    userRole = "Digital Sales Manager",
}: NavbarProps) {
    const initials = userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    return (
        <header className="relative flex h-16 items-center justify-between bg-[#193E6B] px-6 text-white shadow">
            {/* Thin gold accent line at the bottom */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 bg-[#B3A125]" />

            {/* Left: Company Logo + App Title */}
            <div className="flex items-center gap-4">
                {/* Big logo slot */}
                <div className="flex h-10 px-5 items-center justify-center rounded-md bg-white/10 md:h-12 md:px-6">
                    {/* Replace this div with your <img src="/your-logo.png" /> */}
                    <img
                        src={ClaaS2SaaSLogo}
                        alt="CLaaS2SaaS Logo"
                        className="h-6 w-auto md:h-8"
                    />
                </div>

                <Link to="/" className="flex flex-col">
                    <span className="text-md font-semibold leading-tight">
                        Interest Generation
                    </span>
                    <span className="text-sm leading-tight text-white/80">
                        Report Generator
                    </span>
                </Link>
            </div>

            {/* Right: User */}
            <div className="flex items-center gap-3">
                <div className="flex flex-col items-end">
                    <span className="text-sm font-medium">{userName}</span>
                    <span className="text-[11px] text-white/75">
                        {userRole}
                    </span>
                </div>
                <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white text-xs font-semibold text-[#193E6B]">
                    <span>{initials}</span>
                    <span className="absolute -right-[2px] bottom-0 h-2.5 w-2.5 rounded-full border-2 border-[#193E6B] bg-[#B3A125]" />
                </div>
            </div>
        </header>
    );
}
