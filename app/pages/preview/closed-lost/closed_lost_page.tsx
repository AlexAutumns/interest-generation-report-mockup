// app/pages/preview/closed-lost/closed_lost_page.tsx

import { Link, useSearchParams } from "react-router";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { cn } from "../../../utils/cn";

import { generatedReports } from "../../../data/mockReportsFull";
import type { GeneratedReport } from "../../../types/reports";

import {
    FileWarning,
    ArrowLeft,
    BadgeCheck,
    CalendarDays,
    User,
    CircleX,
    Target,
    BarChart3,
    Copy,
    Download,
    ExternalLink,
} from "lucide-react";

import ClosedLostChartsRecharts from "./closed_lost_charts_recharts";
import LostReasonTable from "./lost_reason_table";
import {
    buildLostReasonRows,
    buildLostReasonStats,
    buildLostReasonPie,
    getTopLostReasonLabel,
} from "./closed_lost_helpers";

function buildClosedLostPath(reportId: string) {
    return `/preview/closed-lost?reportId=${encodeURIComponent(reportId)}`;
}

function buildAbsoluteUrl(path: string) {
    if (typeof window === "undefined") return path;
    return `${window.location.origin}${path}`;
}

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

export default function ClosedLostPage() {
    const [params] = useSearchParams();
    const reportId = params.get("reportId");

    const report =
        (reportId &&
            (generatedReports as unknown as GeneratedReport[]).find(
                (r) => r.id === reportId
            )) ??
        (generatedReports as unknown as GeneratedReport[])[0];

    if (!report) {
        return (
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="text-lg font-semibold text-[#193E6B]">
                    Closed-lost analysis
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

    const lostLeads = report.kpis?.lostLeads ?? 0;
    const totalLeads = report.executiveSummary?.totalLeads ?? 0;
    const lossRate = totalLeads > 0 ? (lostLeads / totalLeads) * 100 : 0;

    const stats = buildLostReasonStats(report);
    const rows = stats.rows;

    const topReason = getTopLostReasonLabel(report);

    const reportPath = buildClosedLostPath(report.id);

    function handleCopyLink() {
        const url = buildAbsoluteUrl(reportPath);

        if (navigator?.clipboard?.writeText) {
            navigator.clipboard
                .writeText(url)
                .then(() => toast.success("Page link copied"))
                .catch(() =>
                    toast.info("Copy failed", {
                        description:
                            "Please copy the link manually from the address bar.",
                    })
                );
        } else {
            toast.info("Copy not supported", {
                description:
                    "Please copy the link manually from the address bar.",
            });
        }
    }

    function handleDownloadMock() {
        toast.info("Download is coming soon (mockup)", {
            description:
                "Export will be enabled after generation logic is finalized.",
        });
    }

    function handleOpenNewTab(reportName: string) {
        const url = buildAbsoluteUrl(reportPath);
        if (typeof window !== "undefined") {
            window.open(url, "_blank", "noopener,noreferrer");
        }
        toast("Opened in a new tab", { description: reportName });
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <FileWarning className="h-5 w-5 text-[#193E6B]" />
                        <h1 className="text-xl font-semibold text-[#193E6B]">
                            Closed-lost analysis
                        </h1>
                    </div>
                    <p className="text-sm text-gray-600">
                        Understand why leads were lost and where to prioritize
                        improvements.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={handleCopyLink}
                        className={cn(
                            "inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-semibold",
                            "text-[#193E6B] hover:bg-gray-50"
                        )}
                    >
                        <Copy className="h-4 w-4 text-[#193E6B]/70" />
                        Copy link
                    </button>

                    <button
                        type="button"
                        onClick={handleDownloadMock}
                        className={cn(
                            "inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-semibold",
                            "text-[#193E6B] hover:bg-gray-50"
                        )}
                    >
                        <Download className="h-4 w-4 text-[#193E6B]/70" />
                        PDF
                    </button>

                    <button
                        type="button"
                        onClick={() => handleOpenNewTab(report.name)}
                        className={cn(
                            "hidden items-center gap-2 rounded-md border border-[#B3A125]/35 bg-[#B3A125]/10 px-3 py-2 text-sm font-semibold",
                            "text-[#193E6B] hover:bg-[#B3A125]/15 sm:inline-flex"
                        )}
                    >
                        <ExternalLink className="h-4 w-4" />
                        New tab
                    </button>

                    <Link
                        to="/archive"
                        className="inline-flex items-center gap-2 rounded-md border border-[#B3A125]/35 bg-[#B3A125]/10 px-3 py-2 text-sm font-semibold text-[#193E6B] hover:bg-[#B3A125]/15"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Archive
                    </Link>
                </div>
            </div>

            {/* Report Info */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, delay: 0.05 }}
                whileHover={{ y: -2 }}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
            >
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
            </motion.div>

            {/* KPI Tiles */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, delay: 0.08 }}
                    whileHover={{ y: -2 }}
                    className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                >
                    <div className="flex items-center gap-2 text-sm font-semibold text-[#193E6B]">
                        <CircleX className="h-4 w-4" />
                        Lost leads
                    </div>
                    <div className="mt-2 text-2xl font-semibold text-[#193E6B]">
                        {lostLeads}
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                        Total leads marked as lost
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, delay: 0.1 }}
                    whileHover={{ y: -2 }}
                    className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                >
                    <div className="flex items-center gap-2 text-sm font-semibold text-[#193E6B]">
                        <Target className="h-4 w-4" />
                        Loss rate
                    </div>
                    <div className="mt-2 text-2xl font-semibold text-[#193E6B]">
                        {lossRate.toFixed(1)}%
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                        Lost leads / total leads
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, delay: 0.12 }}
                    whileHover={{ y: -2 }}
                    className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                >
                    <div className="flex items-center gap-2 text-sm font-semibold text-[#193E6B]">
                        <BarChart3 className="h-4 w-4" />
                        Top reason
                    </div>
                    <div className="mt-2 text-base font-semibold text-[#193E6B]">
                        {topReason}
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                        Most frequent lost reason
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, delay: 0.14 }}
                    whileHover={{ y: -2 }}
                    className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                >
                    <div className="flex items-center gap-2 text-sm font-semibold text-[#193E6B]">
                        <FileWarning className="h-4 w-4" />
                        SLA breaches
                    </div>
                    <div className="mt-2 text-2xl font-semibold text-[#193E6B]">
                        {report.kpis?.slaBreachCount ?? 0}
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                        Follow-up SLA breaches (mock)
                    </div>
                </motion.div>
            </div>

            {/* Top Drivers mini-cards */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, delay: 0.15 }}
                    whileHover={{ y: -2 }}
                    className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                >
                    <div className="text-xs font-semibold text-gray-500">
                        Top reason share
                    </div>
                    <div className="mt-2 text-2xl font-semibold text-[#193E6B]">
                        {stats.topReasonShare.toFixed(1)}%
                    </div>
                    <div className="mt-1 text-sm font-semibold text-[#193E6B]">
                        {stats.topReason}
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                        Share of all closed-lost leads
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, delay: 0.17 }}
                    whileHover={{ y: -2 }}
                    className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                >
                    <div className="text-xs font-semibold text-gray-500">
                        Top 3 reasons
                    </div>
                    <div className="mt-2 text-2xl font-semibold text-[#193E6B]">
                        {stats.top3Share.toFixed(1)}%
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                        Combined share of the top 3 reasons
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, delay: 0.19 }}
                    whileHover={{ y: -2 }}
                    className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                >
                    <div className="text-xs font-semibold text-gray-500">
                        Distinct reasons
                    </div>
                    <div className="mt-2 text-2xl font-semibold text-[#193E6B]">
                        {stats.distinctReasons}
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                        Number of closed-lost categories
                    </div>
                </motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, delay: 0.21 }}
                whileHover={{ y: -2 }}
                className="rounded-xl border border-[#B3A125]/35 bg-[#B3A125]/10 p-5 shadow-sm"
            >
                <div className="text-sm font-semibold text-[#193E6B]">
                    Concentration insight: {stats.concentrationLabel}
                </div>
                <p className="mt-2 text-sm text-[#193E6B]">
                    {stats.concentrationDescription}
                </p>
                <div className="mt-3 text-xs text-[#193E6B]/80">
                    Suggested focus: Prioritize improvements that reduce the top
                    drivers first, then validate trends across the next
                    reporting periods.
                </div>
            </motion.div>

            {/* Charts */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, delay: 0.16 }}
                whileHover={{ y: -2 }}
            >
                <ClosedLostChartsRecharts rows={rows} />
            </motion.div>

            {/* Table */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, delay: 0.18 }}
                whileHover={{ y: -2 }}
            >
                <LostReasonTable rows={rows} />
            </motion.div>
        </div>
    );
}
