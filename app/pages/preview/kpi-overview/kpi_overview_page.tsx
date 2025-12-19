import { Link, useSearchParams } from "react-router";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { cn } from "../../../utils/cn";

import {
    BarChart3,
    ArrowLeft,
    Copy,
    Download,
    ExternalLink,
} from "lucide-react";

import { generatedReports } from "../../../data/mockReportsFull";
import type { GeneratedReportShape } from "./kpi_overview_types";
import {
    buildChannelBreakdown,
    buildTilesFromReport,
    buildTrend,
} from "./kpi_overview_helpers";

import KpiTiles from "./kpi_tiles";
import KpiTrendRecharts from "./kpi_trend_recharts";
import KpiBreakdownTable from "./kpi_breakdown_table";

function buildKpiOverviewPath(reportId: string) {
    return `/preview/kpi-overview?reportId=${encodeURIComponent(reportId)}`;
}

function buildAbsoluteUrl(path: string) {
    if (typeof window === "undefined") return path;
    return `${window.location.origin}${path}`;
}

export default function KpiOverviewPage() {
    const [params] = useSearchParams();
    const reportId = params.get("reportId");

    const report =
        (reportId &&
            (generatedReports as GeneratedReportShape[]).find(
                (r) => r.id === reportId
            )) ??
        (generatedReports as GeneratedReportShape[])[0];

    if (!report) {
        return (
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="text-lg font-semibold text-[#193E6B]">
                    KPI Overview
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

    const tiles = buildTilesFromReport(report);
    const trend = buildTrend(report);
    const channelRows = buildChannelBreakdown(report);

    const reportPath = buildKpiOverviewPath(report.id);

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
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22 }}
                className="flex items-start justify-between gap-4"
            >
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-[#193E6B]" />
                        <h1 className="text-xl font-semibold text-[#193E6B]">
                            KPI Overview
                        </h1>
                    </div>
                    <p className="text-sm text-gray-600">
                        Core KPI performance and quick breakdowns for the
                        selected period.
                    </p>
                    <div className="text-xs text-gray-500">
                        {report.name} • {report.periodLabel}
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
                        title="Copy page link"
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
                        title="Download (mock)"
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
                        title="Open in a new tab"
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
            </motion.div>

            {/* Tiles */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, delay: 0.05 }}
            >
                <KpiTiles tiles={tiles} />
            </motion.div>

            {/* Trend + Targets */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, delay: 0.08 }}
                    whileHover={{ y: -2 }}
                    className="lg:col-span-2"
                >
                    <KpiTrendRecharts trend={trend} />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, delay: 0.1 }}
                    whileHover={{ y: -2 }}
                    className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                >
                    <div className="text-sm font-semibold text-[#193E6B]">
                        Targets (mock)
                    </div>
                    <p className="mt-1 text-sm text-gray-600">
                        Quick variance view against a sample target.
                    </p>

                    <div className="mt-4 rounded-lg bg-[#F5F5F5] p-4 ring-1 ring-gray-200">
                        <div className="flex items-center justify-between text-sm">
                            <span className="font-semibold text-[#193E6B]">
                                Conversion target
                            </span>
                            <span className="text-gray-700">25%</span>
                        </div>

                        <div className="mt-2 flex items-center justify-between text-sm">
                            <span className="font-semibold text-[#193E6B]">
                                Actual
                            </span>
                            <span className="text-gray-700">
                                {tiles.conversionRate.toFixed(1)}%
                            </span>
                        </div>

                        <div className="mt-2 flex items-center justify-between text-sm">
                            <span className="font-semibold text-[#193E6B]">
                                Variance
                            </span>
                            <span
                                className={cn(
                                    "font-semibold",
                                    tiles.conversionRate >= 25
                                        ? "text-emerald-700"
                                        : "text-rose-700"
                                )}
                            >
                                {(tiles.conversionRate - 25).toFixed(1)}%
                            </span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            toast("Targets will be configurable later", {
                                description:
                                    "For now, targets are hardcoded for mockup review.",
                            })
                        }
                        className="mt-4 inline-flex w-full items-center justify-center rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-[#193E6B] hover:bg-gray-50"
                    >
                        Manage targets (coming soon)
                    </button>
                </motion.div>
            </div>

            {/* Breakdown table */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, delay: 0.12 }}
                whileHover={{ y: -2 }}
            >
                <KpiBreakdownTable rows={channelRows} />
            </motion.div>
        </div>
    );
}
