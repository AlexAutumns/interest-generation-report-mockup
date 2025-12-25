import { Link, useSearchParams } from "react-router";
import { motion } from "framer-motion";
import { toast } from "sonner";

import { generatedReports } from "../../../data/mockReportsFull";

import {
    Timer,
    ArrowLeft,
    Copy,
    Download,
    ExternalLink,
    CalendarDays,
    User,
    BadgeCheck,
    AlertTriangle,
    CheckCircle2,
} from "lucide-react";

import type { GeneratedReport } from "../../../types/reports";
import {
    buildAgingDistribution,
    buildSlaStats,
} from "./interest_aging_sla_helpers";

import InterestAgingSlaChartsRecharts from "./interest_aging_sla_charts_recharts";
import InterestAgingTable from "./interest_aging_table";
import { cn } from "../../../utils/cn";

function buildInterestAgingSlaPath(reportId: string) {
    return `/preview/interest-aging-sla?reportId=${encodeURIComponent(reportId)}`;
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
    return `${start.toLocaleDateString(undefined, fmt)} – ${end.toLocaleDateString(
        undefined,
        fmt
    )}`;
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

export default function InterestAgingSlaPage() {
    const [params] = useSearchParams();
    const reportId = params.get("reportId");

    const report =
        (reportId &&
            (generatedReports as any[]).find((r) => r.id === reportId)) ??
        (generatedReports as any[])[0];

    if (!report) {
        return (
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="text-lg font-semibold text-[#193E6B]">
                    Interest Aging & SLA
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

    const typedReport = report as GeneratedReport;

    const agingRows = buildAgingDistribution(typedReport);
    const sla = buildSlaStats(typedReport);

    const reportPath = buildInterestAgingSlaPath(typedReport.id);

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
                        <Timer className="h-5 w-5 text-[#193E6B]" />
                        <h1 className="text-xl font-semibold text-[#193E6B]">
                            Interest Aging & SLA compliance
                        </h1>
                    </div>
                    <p className="text-sm text-gray-600">
                        Track aging backlog and follow-up timeliness against an
                        SLA target.
                    </p>
                    <div className="text-xs text-gray-500">
                        {typedReport.name} • {typedReport.periodLabel}
                    </div>
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
                        onClick={() => handleOpenNewTab(typedReport.name)}
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
                            {typedReport.periodLabel}
                        </div>
                        <div className="mt-1 text-sm text-gray-600">
                            {formatDateRange(
                                typedReport.periodStart,
                                typedReport.periodEnd
                            )}
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-sm">
                        <span
                            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${statusBadge(
                                typedReport.status
                            )}`}
                        >
                            <BadgeCheck className="h-4 w-4" />
                            {typedReport.status}
                        </span>

                        <span className="inline-flex items-center gap-2 rounded-full bg-[#193E6B]/5 px-3 py-1 text-xs font-semibold text-[#193E6B] ring-1 ring-[#193E6B]/10">
                            <CalendarDays className="h-4 w-4" />
                            Generated: {formatDateTime(typedReport.generatedOn)}
                        </span>

                        <span className="inline-flex items-center gap-2 rounded-full bg-[#193E6B]/5 px-3 py-1 text-xs font-semibold text-[#193E6B] ring-1 ring-[#193E6B]/10">
                            <User className="h-4 w-4" />
                            {typedReport.generatedBy}
                        </span>
                    </div>
                </div>
            </motion.div>

            {/* KPI tiles */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, delay: 0.08 }}
                    whileHover={{ y: -2 }}
                    className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                >
                    <div className="flex items-center gap-2 text-sm font-semibold text-[#193E6B]">
                        <CheckCircle2 className="h-4 w-4" />
                        SLA compliance
                    </div>
                    <div className="mt-2 text-2xl font-semibold text-[#193E6B]">
                        {sla.complianceRate.toFixed(1)}%
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                        Based on follow-ups due (mock)
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
                        <AlertTriangle className="h-4 w-4" />
                        SLA breaches
                    </div>
                    <div className="mt-2 text-2xl font-semibold text-[#193E6B]">
                        {sla.slaBreachCount}
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                        Follow-ups past {sla.policy.slaHoursTarget}h target
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, delay: 0.12 }}
                    whileHover={{ y: -2 }}
                    className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                >
                    <div className="text-sm font-semibold text-[#193E6B]">
                        Follow-ups due
                    </div>
                    <div className="mt-2 text-2xl font-semibold text-[#193E6B]">
                        {sla.followUpsDue}
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                        Estimated from lead volume (mock)
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, delay: 0.14 }}
                    whileHover={{ y: -2 }}
                    className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                >
                    <div className="text-sm font-semibold text-[#193E6B]">
                        Avg follow-up time
                    </div>
                    <div className="mt-2 text-2xl font-semibold text-[#193E6B]">
                        {sla.avgFollowUpTime.toFixed(1)}h
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                        From report executive summary
                    </div>
                </motion.div>
            </div>

            {/* Charts */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, delay: 0.16 }}
                whileHover={{ y: -2 }}
            >
                <InterestAgingSlaChartsRecharts rows={agingRows} />
            </motion.div>

            {/* Table */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, delay: 0.18 }}
                whileHover={{ y: -2 }}
            >
                <InterestAgingTable rows={agingRows} />
            </motion.div>
        </div>
    );
}
