// app/routes/preview.executive-summary.tsx
import { Link, useSearchParams } from "react-router";
import { generatedReports } from "../data/mockReportsFull";
import {
    FileText,
    ArrowLeft,
    CalendarDays,
    User,
    BadgeCheck,
    TrendingUp,
    Target,
    BarChart3,
    ArrowRight,
} from "lucide-react";

function formatDateRange(startIso: string, endIso: string) {
    const start = new Date(startIso);
    const end = new Date(endIso);
    const fmt: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "short",
        day: "2-digit",
    };
    return `${start.toLocaleDateString(undefined, fmt)} – ${end.toLocaleDateString(undefined, fmt)}`;
}

function formatDateTime(iso: string) {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function statusBadge(status: string) {
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

export default function ExecutiveSummaryRoute() {
    const [params] = useSearchParams();
    const reportId = params.get("reportId");

    // Pick latest if no id given
    const report =
        (reportId && generatedReports.find((r) => r.id === reportId)) ??
        generatedReports[0];

    if (!report) {
        return (
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="text-lg font-semibold text-[#193E6B]">
                    Executive Summary
                </div>
                <p className="mt-2 text-sm text-gray-600">
                    No report found. Please go back to Home or Archive and
                    select a report.
                </p>
                <div className="mt-4">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 rounded-md bg-[#193E6B] px-4 py-2 text-sm font-semibold text-white hover:bg-[#16365f]"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    const s = report.executiveSummary;

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-[#193E6B]" />
                        <h1 className="text-xl font-semibold text-[#193E6B]">
                            Executive Summary
                        </h1>
                    </div>
                    <p className="text-sm text-gray-600">
                        High-level highlights, trends, and key performance
                        indicators for the selected period.
                    </p>
                </div>

                <Link
                    to="/archive"
                    className="inline-flex items-center gap-2 rounded-md border border-[#B3A125]/35 bg-[#B3A125]/10 px-3 py-2 text-sm font-semibold text-[#193E6B] hover:bg-[#B3A125]/15"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Archive
                </Link>
            </div>

            {/* Report Info */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <div className="text-base font-semibold text-[#193E6B]">
                            {report.name}
                        </div>
                        <div className="mt-1 text-sm text-gray-600">
                            {report.periodLabel} •{" "}
                            {formatDateRange(
                                report.periodStart,
                                report.periodEnd
                            )}
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-sm">
                        <span
                            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${statusBadge(
                                report.status
                            )}`}
                        >
                            <BadgeCheck className="h-4 w-4" />
                            {report.status}
                        </span>

                        <span className="inline-flex items-center gap-2 rounded-full bg-[#193E6B]/5 px-3 py-1 text-xs font-semibold text-[#193E6B] ring-1 ring-[#193E6B]/10">
                            <CalendarDays className="h-4 w-4" />
                            Generated: {formatDateTime(report.generatedOn)}
                        </span>

                        <span className="inline-flex items-center gap-2 rounded-full bg-[#193E6B]/5 px-3 py-1 text-xs font-semibold text-[#193E6B] ring-1 ring-[#193E6B]/10">
                            <User className="h-4 w-4" />
                            {report.generatedBy}
                        </span>
                    </div>
                </div>
            </div>

            {/* KPI Tiles */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-2 text-sm font-semibold text-[#193E6B]">
                        <BarChart3 className="h-4 w-4" />
                        Total leads
                    </div>
                    <div className="mt-2 text-2xl font-semibold text-[#193E6B]">
                        {s.totalLeads}
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                        Leads created within the selected period
                    </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-2 text-sm font-semibold text-[#193E6B]">
                        <Target className="h-4 w-4" />
                        Converted leads
                    </div>
                    <div className="mt-2 text-2xl font-semibold text-[#193E6B]">
                        {s.convertedLeads}
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                        Leads marked as converted
                    </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-2 text-sm font-semibold text-[#193E6B]">
                        <TrendingUp className="h-4 w-4" />
                        Conversion rate
                    </div>
                    <div className="mt-2 text-2xl font-semibold text-[#193E6B]">
                        {s.conversionRate.toFixed(1)}%
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                        Converted / total leads
                    </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-2 text-sm font-semibold text-[#193E6B]">
                        <SparkleDot />
                        Lead score (avg)
                    </div>
                    <div className="mt-2 text-2xl font-semibold text-[#193E6B]">
                        {s.avgLeadScore.toFixed(1)}
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                        Average engagement/quality score
                    </div>
                </div>
            </div>

            {/* Narrative + Highlights */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="text-sm font-semibold text-[#193E6B]">
                        Summary
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-gray-700">
                        {s.summaryText}
                    </p>

                    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="rounded-lg bg-[#F5F5F5] p-3 ring-1 ring-gray-200">
                            <div className="text-xs text-gray-500">
                                Top channel
                            </div>
                            <div className="mt-1 text-sm font-semibold text-[#193E6B]">
                                {s.topChannel}
                            </div>
                        </div>

                        <div className="rounded-lg bg-[#F5F5F5] p-3 ring-1 ring-gray-200">
                            <div className="text-xs text-gray-500">
                                Top region
                            </div>
                            <div className="mt-1 text-sm font-semibold text-[#193E6B]">
                                {s.topRegion}
                            </div>
                        </div>

                        <div className="rounded-lg bg-[#F5F5F5] p-3 ring-1 ring-gray-200">
                            <div className="text-xs text-gray-500">
                                Avg follow-up time
                            </div>
                            <div className="mt-1 text-sm font-semibold text-[#193E6B]">
                                {s.avgFollowUpTime.toFixed(1)} hours
                            </div>
                        </div>

                        <div className="rounded-lg bg-[#F5F5F5] p-3 ring-1 ring-gray-200">
                            <div className="text-xs text-gray-500">
                                Report type
                            </div>
                            <div className="mt-1 text-sm font-semibold text-[#193E6B]">
                                {report.type}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick actions */}
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="text-sm font-semibold text-[#193E6B]">
                        Next steps
                    </div>
                    <div className="mt-3 flex flex-col gap-2">
                        <Link
                            to={`/preview/kpi-overview?reportId=${encodeURIComponent(report.id)}`}
                            className="inline-flex items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-[#193E6B] hover:bg-gray-50"
                        >
                            KPI Overview
                            <ArrowRight className="h-4 w-4 text-[#193E6B]/70" />
                        </Link>

                        <Link
                            to={`/preview/campaign-channel?reportId=${encodeURIComponent(report.id)}`}
                            className="inline-flex items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-[#193E6B] hover:bg-gray-50"
                        >
                            Campaign & Channel Analysis
                            <ArrowRight className="h-4 w-4 text-[#193E6B]/70" />
                        </Link>

                        <Link
                            to={`/preview/conversion-funnel?reportId=${encodeURIComponent(report.id)}`}
                            className="inline-flex items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-[#193E6B] hover:bg-gray-50"
                        >
                            Conversion & Funnel
                            <ArrowRight className="h-4 w-4 text-[#193E6B]/70" />
                        </Link>

                        <div className="mt-3 rounded-lg border border-[#B3A125]/35 bg-[#B3A125]/10 p-3 text-xs text-[#193E6B]">
                            Tip: Use the Archive page to compare periods and
                            identify patterns before exporting.
                        </div>
                    </div>
                </div>
            </div>

            {/* Channel breakdown (small table) */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="flex items-center justify-between px-5 py-4">
                    <div className="text-base font-semibold text-[#193E6B]">
                        Channel performance (summary)
                    </div>
                    <span className="text-xs text-gray-500">
                        Revenue and cost in USD
                    </span>
                </div>

                <div className="overflow-auto border-t border-gray-200">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white">
                            <tr className="text-xs uppercase tracking-wide text-gray-500">
                                <th className="px-5 py-3">Channel</th>
                                <th className="px-5 py-3">Leads</th>
                                <th className="px-5 py-3">Converted</th>
                                <th className="px-5 py-3">Conv. Rate</th>
                                <th className="px-5 py-3">Revenue (USD)</th>
                                <th className="px-5 py-3">Cost (USD)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {report.channels.map((c) => (
                                <tr
                                    key={c.channel}
                                    className="border-t border-gray-100"
                                >
                                    <td className="px-5 py-3 font-semibold text-[#193E6B]">
                                        {c.channel}
                                    </td>
                                    <td className="px-5 py-3 text-gray-700">
                                        {c.leads}
                                    </td>
                                    <td className="px-5 py-3 text-gray-700">
                                        {c.converted}
                                    </td>
                                    <td className="px-5 py-3 text-gray-700">
                                        {c.conversionRate.toFixed(1)}%
                                    </td>
                                    <td className="px-5 py-3 text-gray-700">
                                        ${c.revenueUsd.toLocaleString()}
                                    </td>
                                    <td className="px-5 py-3 text-gray-700">
                                        ${c.costUsd.toLocaleString()}
                                    </td>
                                </tr>
                            ))}

                            {report.channels.length === 0 && (
                                <tr>
                                    <td
                                        className="px-5 py-6 text-sm text-gray-600"
                                        colSpan={6}
                                    >
                                        No channel data available for this
                                        report.
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

/**
 * Tiny sparkle-like dot (keeps icon set cohesive without overdoing it).
 * (We avoid importing too many icons.)
 */
function SparkleDot() {
    return (
        <span className="inline-flex h-4 w-4 items-center justify-center">
            <span className="h-2.5 w-2.5 rounded-full bg-[#B3A125]" />
        </span>
    );
}
