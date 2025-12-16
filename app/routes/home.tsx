// app/routes/home.tsx
import { Link } from "react-router";
import {
    latestReportSummary,
    reportSummaries,
} from "../data/mockReportSummaries";
import {
    Home as HomeIcon,
    FilePlus2,
    Sparkles,
    ArrowRight,
    Clock,
    Archive,
} from "lucide-react";

function badgeClass(status: string) {
    switch (status) {
        case "Completed":
            return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
        case "In Progress":
            return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
        case "Failed":
            return "bg-rose-50 text-rose-700 ring-1 ring-rose-200";
        default:
            return "bg-gray-50 text-gray-700 ring-1 ring-gray-200";
    }
}

function typePill(type: string) {
    const base =
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs ring-1";
    return `${base} bg-white text-[#193E6B] ring-[#193E6B]/20`;
}

function formatGeneratedOn(iso: string) {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default function HomeRoute() {
    const latest = latestReportSummary;

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                    <HomeIcon className="h-5 w-5 text-[#193E6B]" />
                    <h1 className="text-xl font-semibold text-[#193E6B]">
                        Home
                    </h1>
                </div>
                <p className="text-sm text-gray-600">
                    Generate and review weekly, monthly, and quarterly Interest
                    Generation reports.
                </p>
            </div>

            {/* Top row: CTA + Latest Snapshot */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Generate Report CTA */}
                <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <FilePlus2 className="h-4 w-4 text-[#193E6B]" />
                                <h2 className="text-base font-semibold text-[#193E6B]">
                                    Generate a new report
                                </h2>
                            </div>

                            <p className="mt-1 text-sm text-gray-600">
                                Create a fresh report for your selected period.
                                You can preview before exporting.
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
                                    Premium preview + export flow
                                </div>
                            </div>
                        </div>

                        {/* Premium accent */}
                        <div className="hidden sm:block">
                            <div className="h-12 w-12 rounded-xl bg-[#B3A125]/15 ring-1 ring-[#B3A125]/30" />
                        </div>
                    </div>

                    {/* Quick type chips (UI-only for now) */}
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

                {/* Latest Snapshot */}
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-[#193E6B]" />
                            <h2 className="text-base font-semibold text-[#193E6B]">
                                Latest report snapshot
                            </h2>
                        </div>
                        <div className="h-2.5 w-2.5 rounded-full bg-[#B3A125]" />
                    </div>

                    {!latest ? (
                        <div className="mt-4 rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
                            No reports yet. Generate your first report to see a
                            snapshot here.
                        </div>
                    ) : (
                        <>
                            <div className="mt-3">
                                <div className="text-sm font-semibold text-[#193E6B]">
                                    {latest.name}
                                </div>
                                <div className="mt-1 text-xs text-gray-500">
                                    {latest.periodLabel} • Generated on{" "}
                                    {formatGeneratedOn(latest.generatedOn)}
                                </div>
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-3">
                                <div className="rounded-lg bg-[#F5F5F5] p-3 ring-1 ring-gray-200">
                                    <div className="text-xs text-gray-500">
                                        Total leads
                                    </div>
                                    <div className="text-lg font-semibold text-[#193E6B]">
                                        {latest.metricsPreview.totalLeads}
                                    </div>
                                </div>

                                <div className="rounded-lg bg-[#F5F5F5] p-3 ring-1 ring-gray-200">
                                    <div className="text-xs text-gray-500">
                                        Conversion rate
                                    </div>
                                    <div className="text-lg font-semibold text-[#193E6B]">
                                        {latest.metricsPreview.conversionRate.toFixed(
                                            1
                                        )}
                                        %
                                    </div>
                                </div>

                                <div className="col-span-2 rounded-lg bg-[#F5F5F5] p-3 ring-1 ring-gray-200">
                                    <div className="text-xs text-gray-500">
                                        Top channel
                                    </div>
                                    <div className="text-sm font-semibold text-[#193E6B]">
                                        {latest.metricsPreview.topChannel}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4">
                                <Link
                                    to={`/preview/executive-summary?reportId=${encodeURIComponent(
                                        latest.id
                                    )}`}
                                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#193E6B] hover:underline"
                                >
                                    Open preview{" "}
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Recent Reports */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="flex items-center justify-between px-5 py-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-[#193E6B]" />
                            <h2 className="text-base font-semibold text-[#193E6B]">
                                Recent reports
                            </h2>
                        </div>
                        <p className="mt-1 text-sm text-gray-600">
                            Quick access to your most recently generated
                            reports.
                        </p>
                    </div>

                    <Link
                        to="/archive"
                        className="inline-flex items-center gap-2 rounded-md border border-[#B3A125]/35 bg-[#B3A125]/10 px-3 py-2 text-sm font-semibold text-[#193E6B] hover:bg-[#B3A125]/15"
                    >
                        <Archive className="h-4 w-4" />
                        View Archive
                    </Link>
                </div>

                <div className="max-h-[420px] overflow-auto border-t border-gray-200">
                    <table className="w-full text-left text-sm">
                        <thead className="sticky top-0 bg-white">
                            <tr className="text-xs uppercase tracking-wide text-gray-500">
                                <th className="px-5 py-3">Report Name</th>
                                <th className="px-5 py-3">Period</th>
                                <th className="px-5 py-3">Generated On</th>
                                <th className="px-5 py-3">Generated By</th>
                                <th className="px-5 py-3">Type</th>
                                <th className="px-5 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reportSummaries.map((r) => (
                                <tr
                                    key={r.id}
                                    className="border-t border-gray-100 hover:bg-[#193E6B]/[0.03]"
                                >
                                    <td className="px-5 py-3">
                                        <Link
                                            to={`/preview/executive-summary?reportId=${encodeURIComponent(
                                                r.id
                                            )}`}
                                            className="font-semibold text-[#193E6B] hover:underline"
                                        >
                                            {r.name}
                                        </Link>
                                        <div className="text-xs text-gray-500">
                                            {r.id}
                                        </div>
                                    </td>

                                    <td className="px-5 py-3 text-gray-700">
                                        {r.periodLabel}
                                    </td>

                                    <td className="px-5 py-3 text-gray-700">
                                        {formatGeneratedOn(r.generatedOn)}
                                    </td>

                                    <td className="px-5 py-3 text-gray-700">
                                        {r.generatedBy}
                                    </td>

                                    <td className="px-5 py-3">
                                        <span className={typePill(r.type)}>
                                            {r.type}
                                        </span>
                                    </td>

                                    <td className="px-5 py-3">
                                        <span
                                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${badgeClass(
                                                r.status
                                            )}`}
                                        >
                                            {r.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}

                            {reportSummaries.length === 0 && (
                                <tr>
                                    <td
                                        className="px-5 py-6 text-sm text-gray-600"
                                        colSpan={6}
                                    >
                                        No reports available yet. Generate your
                                        first report to populate this list.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
