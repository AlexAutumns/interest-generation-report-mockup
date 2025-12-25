import { Link, useSearchParams } from "react-router";
import { useMemo, useState } from "react";

import { motion } from "framer-motion";
import { toast } from "sonner";
import { cn } from "../../../utils/cn";

import {
    Megaphone,
    ArrowLeft,
    Copy,
    Download,
    ExternalLink,
    ArrowRight,
} from "lucide-react";

import { generatedReports } from "../../../data/mockReportsFull";
import ChannelChartsRecharts from "./channel_charts_recharts";
import ChannelRoiTable from "./channel_roi_table";
import { buildChannelRows } from "./campaign_channel_helpers";
import {
    buildCampaignRows,
    getTopCampaignLabel,
    CAMPAIGN_RANK_OPTIONS,
    type CampaignRankBy,
} from "./campaign_channel_helpers";
import CampaignChartsRecharts from "./campaign_charts_recharts";
import CampaignRoiTable from "./campaign_roi_table";

function buildCampaignChannelPath(reportId: string) {
    return `/preview/campaign-channel?reportId=${encodeURIComponent(reportId)}`;
}

function buildAbsoluteUrl(path: string) {
    if (typeof window === "undefined") return path;
    return `${window.location.origin}${path}`;
}

export default function CampaignChannelPage() {
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
                    Campaign & Channel Analysis
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

    const rows = buildChannelRows(report);
    const topChannel = rows[0];

    const [campaignRankBy, setCampaignRankBy] =
        useState<CampaignRankBy>("leads");

    const campaignRows = useMemo(
        () => buildCampaignRows(report, campaignRankBy),
        [report, campaignRankBy]
    );

    const topCampaign = useMemo(
        () => getTopCampaignLabel(report, campaignRankBy),
        [report, campaignRankBy]
    );

    const reportPath = buildCampaignChannelPath(report.id);

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
                        <Megaphone className="h-5 w-5 text-[#193E6B]" />
                        <h1 className="text-xl font-semibold text-[#193E6B]">
                            Campaign & Channel Analysis
                        </h1>
                    </div>
                    <p className="text-sm text-gray-600">
                        Performance breakdown by channel (campaign-level can be
                        added later).
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

            {/* Quick insights row */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, delay: 0.05 }}
                whileHover={{ y: -2 }}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
            >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <div className="text-sm font-semibold text-[#193E6B]">
                            Highlights (mock)
                        </div>
                        <p className="mt-1 text-sm text-gray-600">
                            Quick takeaways derived from the channel metrics for
                            this period.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center rounded-full bg-[#193E6B]/5 px-3 py-1 text-xs font-semibold text-[#193E6B] ring-1 ring-[#193E6B]/10">
                            Top channel: {topChannel ? topChannel.channel : "—"}
                        </span>
                        <span className="inline-flex items-center rounded-full bg-[#B3A125]/10 px-3 py-1 text-xs font-semibold text-[#193E6B] ring-1 ring-[#B3A125]/25">
                            Best ROI:{" "}
                            {rows.length
                                ? rows
                                      .slice()
                                      .sort(
                                          (a, b) => b.roiPercent - a.roiPercent
                                      )[0].channel
                                : "—"}
                        </span>
                        <span className="inline-flex items-center rounded-full bg-[#F5F5F5] px-3 py-1 text-xs font-semibold text-[#193E6B] ring-1 ring-gray-200">
                            Lowest conv:{" "}
                            {rows.length
                                ? rows
                                      .slice()
                                      .sort(
                                          (a, b) =>
                                              a.conversionRate -
                                              b.conversionRate
                                      )[0].channel
                                : "—"}
                        </span>
                    </div>
                </div>
            </motion.div>

            {/* Charts */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, delay: 0.08 }}
                whileHover={{ y: -2 }}
            >
                <ChannelChartsRecharts rows={rows} />
            </motion.div>

            {/* Table */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, delay: 0.12 }}
                whileHover={{ y: -2 }}
            >
                <ChannelRoiTable rows={rows} />
            </motion.div>

            {/* Campaign controls + highlights */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, delay: 0.13 }}
                whileHover={{ y: -2 }}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
            >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="text-base font-semibold text-[#193E6B]">
                            Campaign analysis (mock)
                        </div>
                        <p className="mt-1 text-sm text-gray-600">
                            Breakdown by campaign. Choose what “top” means for
                            this view.
                        </p>
                    </div>

                    {/* Simple selector (no shadcn required) */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-500">
                            Top by
                        </span>
                        <select
                            value={campaignRankBy}
                            onChange={(e) => {
                                const v = e.target.value as CampaignRankBy;
                                setCampaignRankBy(v);
                                toast("Updated campaign ranking", {
                                    description:
                                        CAMPAIGN_RANK_OPTIONS.find(
                                            (o) => o.value === v
                                        )?.label ?? v,
                                });
                            }}
                            className="h-10 rounded-md border border-gray-200 bg-white px-3 text-sm font-semibold text-[#193E6B] shadow-sm hover:bg-gray-50"
                        >
                            {CAMPAIGN_RANK_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                    <span className="inline-flex items-center rounded-full bg-[#193E6B]/5 px-3 py-1 text-xs font-semibold text-[#193E6B] ring-1 ring-[#193E6B]/10">
                        Top campaign: {topCampaign}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-[#B3A125]/10 px-3 py-1 text-xs font-semibold text-[#193E6B] ring-1 ring-[#B3A125]/25">
                        Campaigns: {campaignRows.length}
                    </span>
                </div>
            </motion.div>

            {/* Campaign charts */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, delay: 0.15 }}
                whileHover={{ y: -2 }}
            >
                <CampaignChartsRecharts
                    rows={campaignRows}
                    title="Top campaigns"
                />
            </motion.div>

            {/* Campaign table */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, delay: 0.17 }}
                whileHover={{ y: -2 }}
            >
                <CampaignRoiTable rows={campaignRows} />
            </motion.div>

            {/* Next step nav */}
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
                            Next recommended page: Conversion & Funnel
                            (engagement journey).
                        </p>
                    </div>

                    <Link
                        to={`/preview/conversion-funnel?reportId=${encodeURIComponent(report.id)}`}
                        className="inline-flex items-center justify-center gap-2 rounded-md bg-[#193E6B] px-4 py-2 text-sm font-semibold text-white hover:bg-[#16365f]"
                        onClick={() => toast("Opening Conversion & Funnel…")}
                    >
                        Go to Conversion & Funnel
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
