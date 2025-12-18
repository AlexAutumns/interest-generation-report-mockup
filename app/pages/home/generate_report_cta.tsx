// app/pages/home/generate_report_cta.tsx
import { Link } from "react-router";
import {
    FilePlus2,
    CheckCircle2,
    Gauge,
    Megaphone,
    Filter,
    FileDown,
    CalendarClock,
    CalendarDays,
    CalendarRange,
    Sparkles,
    ClipboardCheck,
    PencilLine,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: Array<string | undefined | null | false>) {
    return twMerge(clsx(inputs));
}

const TYPE_CHIPS = ["Weekly", "Monthly", "Quarterly"] as const;

export default function GenerateReportCta() {
    function handleMockAction(message: string) {
        toast(message, {
            description: "Mockup interaction — backend wiring comes later.",
        });
    }

    return (
        <div className="h-full w-full rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex h-full flex-col gap-5 lg:flex-row lg:items-stretch lg:justify-between">
                {/* Left: CTA */}
                <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-center gap-2">
                        <FilePlus2 className="h-4 w-4 text-[#193E6B]" />
                        <h2 className="text-base font-semibold text-[#193E6B]">
                            Generate a new report
                        </h2>

                        <span className="ml-2 inline-flex items-center gap-2 rounded-full bg-[#B3A125]/10 px-3 py-1 text-xs font-semibold text-[#193E6B] ring-1 ring-[#B3A125]/25">
                            <Sparkles className="h-3.5 w-3.5" />
                            Preview-first
                        </span>
                    </div>

                    <p className="mt-1 text-sm text-gray-600">
                        Create a fresh report for your selected period. You can
                        preview before exporting.
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-3">
                        <Link
                            to="/generate"
                            className="inline-flex items-center justify-center gap-2 rounded-md bg-[#193E6B] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#16365f] focus:outline-none focus:ring-2 focus:ring-[#B3A125]/70"
                            onClick={() =>
                                toast.success("Opening Generate Report…", {
                                    description:
                                        "You can refine period + options on the next page.",
                                })
                            }
                        >
                            <FilePlus2 className="h-4 w-4" />
                            Generate Report
                        </Link>

                        <button
                            type="button"
                            onClick={() =>
                                handleMockAction("Quick Generate (coming soon)")
                            }
                            className={cn(
                                "inline-flex items-center justify-center gap-2 rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-semibold",
                                "text-[#193E6B] hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#B3A125]/50"
                            )}
                            title="Planned: one-click generation using defaults"
                        >
                            <ClipboardCheck className="h-4 w-4 text-[#B3A125]" />
                            Quick Generate
                        </button>
                    </div>

                    {/* Type chips (UI-only for now) */}
                    <div className="mt-5 flex flex-wrap gap-2">
                        {TYPE_CHIPS.map((label) => (
                            <motion.div
                                key={label}
                                whileHover={{ y: -1 }}
                                whileTap={{ scale: 0.99 }}
                            >
                                <Link
                                    to="/generate"
                                    onClick={() =>
                                        toast(`Type selected: ${label}`, {
                                            description:
                                                "Mock selection — will prefill the generator later.",
                                        })
                                    }
                                    className={cn(
                                        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold",
                                        "border-[#B3A125]/35 bg-[#B3A125]/10 text-[#193E6B] hover:bg-[#B3A125]/15",
                                        "focus:outline-none focus:ring-2 focus:ring-[#B3A125]/50"
                                    )}
                                >
                                    {label}
                                </Link>
                            </motion.div>
                        ))}
                    </div>

                    {/* Spacer so left side balances height nicely */}
                    <div className="flex-1" />
                </div>

                {/* Right: Checklist + Schedule */}
                <div className="w-full shrink-0 lg:w-[380px]">
                    {/* What you'll get */}
                    <div className="rounded-xl border border-[#B3A125]/25 bg-[#B3A125]/10 p-4">
                        <div className="flex items-center justify-between">
                            <div className="text-sm font-semibold text-[#193E6B]">
                                What you’ll get
                            </div>
                            <div className="h-2.5 w-2.5 rounded-full bg-[#B3A125]" />
                        </div>

                        <ul className="mt-3 space-y-2 text-sm text-[#193E6B]">
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="mt-0.5 h-4 w-4 text-[#B3A125]" />
                                <span>
                                    Executive summary with key highlights &
                                    trends
                                </span>
                            </li>
                            <li className="flex items-start gap-2">
                                <Gauge className="mt-0.5 h-4 w-4 text-[#B3A125]" />
                                <span>
                                    KPI overview with targets and variance
                                </span>
                            </li>
                            <li className="flex items-start gap-2">
                                <Megaphone className="mt-0.5 h-4 w-4 text-[#B3A125]" />
                                <span>
                                    Campaign & channel performance breakdown
                                </span>
                            </li>
                            <li className="flex items-start gap-2">
                                <Filter className="mt-0.5 h-4 w-4 text-[#B3A125]" />
                                <span>
                                    Conversion funnel and drop-off visibility
                                </span>
                            </li>
                            <li className="flex items-start gap-2">
                                <FileDown className="mt-0.5 h-4 w-4 text-[#B3A125]" />
                                <span>
                                    Export-ready output (PDF / Excel) once
                                    enabled
                                </span>
                            </li>
                        </ul>

                        <button
                            type="button"
                            onClick={() => handleMockAction("Checklist opened")}
                            className={cn(
                                "mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md border border-[#B3A125]/35",
                                "bg-white px-3 py-2 text-sm font-semibold text-[#193E6B] hover:bg-[#F5F5F5]",
                                "focus:outline-none focus:ring-2 focus:ring-[#B3A125]/60"
                            )}
                        >
                            <ClipboardCheck className="h-4 w-4 text-[#B3A125]" />
                            View checklist
                        </button>
                    </div>

                    {/* Schedule */}
                    <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
                        <div className="flex items-center justify-between gap-2">
                            <div className="text-sm font-semibold text-[#193E6B]">
                                Report schedule
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-gray-500">
                                    (mock)
                                </span>
                                <button
                                    type="button"
                                    onClick={() =>
                                        handleMockAction(
                                            "Schedule editor opened"
                                        )
                                    }
                                    className={cn(
                                        "inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-2 py-1",
                                        "text-xs font-semibold text-[#193E6B] hover:bg-gray-50"
                                    )}
                                >
                                    <PencilLine className="h-3.5 w-3.5 text-[#B3A125]" />
                                    Edit
                                </button>
                            </div>
                        </div>

                        <div className="mt-3 space-y-2 text-sm text-gray-700">
                            <div className="flex items-start gap-2">
                                <CalendarClock className="mt-0.5 h-4 w-4 text-[#193E6B]" />
                                <div className="min-w-0">
                                    <div className="font-semibold text-[#193E6B]">
                                        Weekly
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        Every Monday, 9:00 AM
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start gap-2">
                                <CalendarDays className="mt-0.5 h-4 w-4 text-[#193E6B]" />
                                <div className="min-w-0">
                                    <div className="font-semibold text-[#193E6B]">
                                        Monthly
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        1st business day, 9:00 AM
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start gap-2">
                                <CalendarRange className="mt-0.5 h-4 w-4 text-[#193E6B]" />
                                <div className="min-w-0">
                                    <div className="font-semibold text-[#193E6B]">
                                        Quarterly
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        Week 1 of each quarter
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-3 rounded-lg bg-[#F5F5F5] p-3 text-xs text-gray-600 ring-1 ring-gray-200">
                            You can still generate reports on-demand anytime.
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                handleMockAction("Export options (coming soon)")
                            }
                            className={cn(
                                "mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md",
                                "bg-[#193E6B]/5 px-3 py-2 text-sm font-semibold text-[#193E6B] ring-1 ring-[#193E6B]/10",
                                "hover:bg-[#193E6B]/10 focus:outline-none focus:ring-2 focus:ring-[#B3A125]/50"
                            )}
                        >
                            <FileDown className="h-4 w-4 text-[#B3A125]" />
                            Export options
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
