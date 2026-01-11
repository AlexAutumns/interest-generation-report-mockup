import { Link, useSearchParams } from "react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";

import { useReportsStore } from "../../../state/reports_store";
import type { GeneratedReport } from "../../../types/reports";

import { ArrowLeft, Copy, Download, ExternalLink, Globe } from "lucide-react";

import GeographicMapLeaflet from "./geographic_map_leaflet";
import GeographicTable from "./geographic_table";
import type { GeoMetricKey } from "./geographic_helpers";
import { metricLabel, normalizeRegions } from "./geographic_helpers";

function buildGeographicViewPath(reportId: string) {
    return `/preview/geographic-view?reportId=${encodeURIComponent(reportId)}`;
}

function buildAbsoluteUrl(path: string) {
    if (typeof window === "undefined") return path;
    return `${window.location.origin}${path}`;
}

export default function GeographicViewPage() {
    const [params] = useSearchParams();
    const reportId = params.get("reportId");

    const reports = useReportsStore((s) => s.reports);

    const report =
        (reportId
            ? (reports as any[]).find((r) => r.id === reportId)
            : undefined) ?? (reports as any[])[0];

    // Gate Leaflet render to client only
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    const [metricKey, setMetricKey] = useState<GeoMetricKey>("leads");

    const typedReport = report as GeneratedReport | undefined;

    const rows = useMemo(() => {
        return typedReport ? normalizeRegions(typedReport) : [];
    }, [typedReport]);

    if (!typedReport) {
        return (
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="text-lg font-semibold text-[#193E6B]">
                    Geographic View
                </div>
                <p className="mt-2 text-sm text-gray-600">
                    No report found. Please select a report from Home or
                    Archive.
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

    const reportIdSafe = typedReport.id;
    const reportPath = buildGeographicViewPath(reportIdSafe);

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

    function handleMetricChange(next: GeoMetricKey) {
        setMetricKey(next);
        toast("Metric updated", {
            description: `Now viewing: ${metricLabel(next)}`,
        });
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <Globe className="h-5 w-5 text-[#193E6B]" />
                        <h1 className="text-xl font-semibold text-[#193E6B]">
                            Geographic View
                        </h1>
                    </div>
                    <p className="text-sm text-gray-600">
                        Country-level performance with an interactive map.
                    </p>
                    <div className="text-xs text-gray-500">
                        {typedReport.name} • {typedReport.periodLabel}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={handleCopyLink}
                        className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-[#193E6B] hover:bg-gray-50"
                    >
                        <Copy className="h-4 w-4 text-[#193E6B]/70" />
                        Copy link
                    </button>

                    <button
                        type="button"
                        onClick={handleDownloadMock}
                        className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-[#193E6B] hover:bg-gray-50"
                    >
                        <Download className="h-4 w-4 text-[#193E6B]/70" />
                        PDF
                    </button>

                    <button
                        type="button"
                        onClick={() => handleOpenNewTab(report.name)}
                        className="hidden items-center gap-2 rounded-md border border-[#B3A125]/35 bg-[#B3A125]/10 px-3 py-2 text-sm font-semibold text-[#193E6B] hover:bg-[#B3A125]/15 sm:inline-flex"
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

            {/* Metric selector */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, delay: 0.05 }}
                whileHover={{ y: -2 }}
                className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            >
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <div className="text-sm font-semibold text-[#193E6B]">
                            Metric selection
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                            Controls the map shading and table sorting.
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => handleMetricChange("leads")}
                            className={`rounded-md px-3 py-2 text-sm font-semibold ${
                                metricKey === "leads"
                                    ? "bg-[#193E6B] text-white"
                                    : "border border-gray-200 bg-white text-[#193E6B] hover:bg-gray-50"
                            }`}
                        >
                            Leads
                        </button>

                        <button
                            type="button"
                            onClick={() => handleMetricChange("converted")}
                            className={`rounded-md px-3 py-2 text-sm font-semibold ${
                                metricKey === "converted"
                                    ? "bg-[#193E6B] text-white"
                                    : "border border-gray-200 bg-white text-[#193E6B] hover:bg-gray-50"
                            }`}
                        >
                            Converted
                        </button>

                        <button
                            type="button"
                            onClick={() => handleMetricChange("conversionRate")}
                            className={`rounded-md px-3 py-2 text-sm font-semibold ${
                                metricKey === "conversionRate"
                                    ? "bg-[#193E6B] text-white"
                                    : "border border-gray-200 bg-white text-[#193E6B] hover:bg-gray-50"
                            }`}
                        >
                            Conv. %
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Map (client-only) */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, delay: 0.08 }}
                whileHover={{ y: -2 }}
            >
                {mounted ? (
                    <GeographicMapLeaflet rows={rows} metricKey={metricKey} />
                ) : (
                    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                        <div className="h-[420px] w-full animate-pulse rounded-lg bg-[#F5F5F5] ring-1 ring-gray-200" />
                    </div>
                )}
            </motion.div>

            {/* Table */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, delay: 0.11 }}
                whileHover={{ y: -2 }}
            >
                <GeographicTable rows={rows} metricKey={metricKey} />
            </motion.div>
        </div>
    );
}
