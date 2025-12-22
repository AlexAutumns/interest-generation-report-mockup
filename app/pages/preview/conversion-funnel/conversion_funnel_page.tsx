import { Link, useSearchParams } from "react-router";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { cn } from "../../../utils/cn";

import {
    Filter,
    ArrowLeft,
    Copy,
    Download,
    ExternalLink,
    ArrowRight,
} from "lucide-react";

import { generatedReports } from "../../../data/mockReportsFull";
import { buildConversionFunnelModel } from "./conversion_funnel_helpers";

import FunnelChartsRecharts from "./funnel_charts_recharts";
import LeadScorePanel from "./lead_score_panel";
import JourneyInsights from "./journey_insights";
import StageDefinitionsCard from "./stage_definitions_card";

function buildConversionFunnelPath(reportId: string) {
    return `/preview/conversion-funnel?reportId=${encodeURIComponent(reportId)}`;
}

function buildAbsoluteUrl(path: string) {
    if (typeof window === "undefined") return path;
    return `${window.location.origin}${path}`;
}

export default function ConversionFunnelPage() {
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
                    Conversion & Funnel
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

    const model = buildConversionFunnelModel(report);
    const reportPath = buildConversionFunnelPath(report.id);

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
                        <Filter className="h-5 w-5 text-[#193E6B]" />
                        <h1 className="text-xl font-semibold text-[#193E6B]">
                            Conversion & Funnel
                        </h1>
                    </div>
                    <p className="text-sm text-gray-600">
                        Stage progression, drop-offs, and lead scoring
                        indicators for engagement journey tracking.
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
            </motion.div>

            {/* Summary row */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, delay: 0.04 }}
                whileHover={{ y: -2 }}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
            >
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
                    <div className="rounded-lg bg-[#F5F5F5] p-3 ring-1 ring-gray-200">
                        <div className="text-xs text-gray-500">Total leads</div>
                        <div className="mt-1 text-2xl font-semibold text-[#193E6B]">
                            {model.summary.totalLeads}
                        </div>
                    </div>

                    <div className="rounded-lg bg-[#B3A125]/10 p-3 ring-1 ring-[#B3A125]/25">
                        <div className="text-xs text-[#193E6B]">Converted</div>
                        <div className="mt-1 text-2xl font-semibold text-[#193E6B]">
                            {model.summary.convertedLeads}
                        </div>
                        <div className="mt-1 text-xs text-[#193E6B]">
                            {model.summary.conversionRate.toFixed(1)}%
                            conversion
                        </div>
                    </div>

                    <div className="rounded-lg bg-[#F5F5F5] p-3 ring-1 ring-gray-200">
                        <div className="text-xs text-gray-500">
                            Contacted rate
                        </div>
                        <div className="mt-1 text-2xl font-semibold text-[#193E6B]">
                            {model.summary.contactedRate.toFixed(1)}%
                        </div>
                    </div>

                    <div className="rounded-lg bg-[#F5F5F5] p-3 ring-1 ring-gray-200">
                        <div className="text-xs text-gray-500">
                            Qualified rate
                        </div>
                        <div className="mt-1 text-2xl font-semibold text-[#193E6B]">
                            {model.summary.qualifiedRate.toFixed(1)}%
                        </div>
                    </div>
                </div>

                <div className="mt-3 rounded-lg border border-[#B3A125]/25 bg-[#B3A125]/10 p-3 text-xs text-[#193E6B]">
                    Mockup note: stage progression is estimated from KPIs today;
                    later it will be computed from engagement events & scoring
                    rules.
                </div>
            </motion.div>

            {/* Charts */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, delay: 0.06 }}
                whileHover={{ y: -2 }}
            >
                <FunnelChartsRecharts
                    stages={model.stages}
                    dropOff={model.dropOff}
                />
            </motion.div>

            {/* Lead score section */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, delay: 0.08 }}
                whileHover={{ y: -2 }}
            >
                <LeadScorePanel
                    scoreBins={model.scoreBins}
                    summary={model.summary}
                />
            </motion.div>

            {/* Definitions + insights */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, delay: 0.1 }}
                    whileHover={{ y: -2 }}
                    className="lg:col-span-1"
                >
                    <StageDefinitionsCard />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, delay: 0.12 }}
                    whileHover={{ y: -2 }}
                    className="lg:col-span-2"
                >
                    <JourneyInsights insights={model.insights} />
                </motion.div>
            </div>

            {/* Navigation */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, delay: 0.14 }}
                className="rounded-xl border border-[#B3A125]/25 bg-[#B3A125]/10 p-4"
            >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="text-sm font-semibold text-[#193E6B]">
                            Continue the preview
                        </div>
                        <p className="mt-1 text-sm text-[#193E6B]">
                            You can go back to KPI Overview or Campaign &
                            Channel to compare drivers.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Link
                            to={`/preview/kpi-overview?reportId=${encodeURIComponent(report.id)}`}
                            className="inline-flex items-center justify-center gap-2 rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-[#193E6B] hover:bg-gray-50"
                            onClick={() => toast("Opening KPI Overview…")}
                        >
                            KPI Overview
                            <ArrowRight className="h-4 w-4" />
                        </Link>

                        <Link
                            to={`/preview/campaign-channel?reportId=${encodeURIComponent(report.id)}`}
                            className="inline-flex items-center justify-center gap-2 rounded-md bg-[#193E6B] px-4 py-2 text-sm font-semibold text-white hover:bg-[#16365f]"
                            onClick={() => toast("Opening Campaign & Channel…")}
                        >
                            Campaign & Channel
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
