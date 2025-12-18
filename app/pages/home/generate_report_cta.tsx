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
} from "lucide-react";

export default function GenerateReportCta() {
    return (
        <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                {/* Left: CTA */}
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <FilePlus2 className="h-4 w-4 text-[#193E6B]" />
                        <h2 className="text-base font-semibold text-[#193E6B]">
                            Generate a new report
                        </h2>
                    </div>

                    <p className="mt-1 text-sm text-gray-600">
                        Create a fresh report for your selected period. You can
                        preview before exporting.
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-3">
                        <Link
                            to="/generate"
                            className="inline-flex items-center justify-center gap-2 rounded-md bg-[#193E6B] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#16365f] focus:outline-none focus:ring-2 focus:ring-[#B3A125]/70"
                        >
                            <FilePlus2 className="h-4 w-4" />
                            Generate Report
                        </Link>

                        <div className="hidden items-center gap-2 text-xs text-gray-500 sm:flex">
                            <span className="inline-block h-2 w-2 rounded-full bg-[#B3A125]" />
                            Preview-first workflow
                        </div>
                    </div>

                    {/* Type chips (UI-only for now) */}
                    <div className="mt-5 flex flex-wrap gap-2">
                        {["Weekly", "Monthly", "Quarterly"].map((label) => (
                            <Link
                                key={label}
                                to="/generate"
                                className="rounded-full border border-[#B3A125]/35 bg-[#B3A125]/10 px-3 py-1 text-xs font-semibold text-[#193E6B] hover:bg-[#B3A125]/15"
                            >
                                {label}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Right: Checklist + Schedule */}
                <div className="w-full lg:w-[360px]">
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
                    </div>

                    <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
                        <div className="flex items-center justify-between">
                            <div className="text-sm font-semibold text-[#193E6B]">
                                Report schedule
                            </div>
                            <span className="text-xs font-semibold text-gray-500">
                                (mock)
                            </span>
                        </div>

                        <div className="mt-3 space-y-2 text-sm text-gray-700">
                            <div className="flex items-start gap-2">
                                <CalendarClock className="mt-0.5 h-4 w-4 text-[#193E6B]" />
                                <div>
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
                                <div>
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
                                <div>
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
                    </div>
                </div>
            </div>
        </div>
    );
}
