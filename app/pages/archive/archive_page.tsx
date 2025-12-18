// app/pages/archive/archive_page.tsx
import { useMemo, useState } from "react";
import { Link } from "react-router";
import {
    Archive as ArchiveIcon,
    Copy,
    Download,
    ArrowRight,
} from "lucide-react";
import { reportSummaries } from "../../data/mockReportSummaries";

import ArchiveFiltersBar from "./archive_filters_bar";
import ArchiveInsights from "./archive_insights";
import ArchiveTrendRecharts from "./archive_trend_recharts";
import ArchiveReportsTable from "./archive_reports_table";

import type { SortKey } from "./archive_helpers";
import { safeLower } from "./archive_helpers";

import { motion } from "framer-motion";
import { toast } from "sonner";
import { cn } from "../../utils/cn";

type ViewReport = {
    id: string;
    name: string;
    periodLabel: string;
    generatedOn: string;
    generatedBy: string;
    type: "Weekly" | "Monthly" | "Quarterly" | string;
    status: "Completed" | "In Progress" | "Failed" | string;
};

function normalizeType(raw: unknown): ViewReport["type"] {
    const s = String(raw ?? "")
        .trim()
        .toLowerCase();

    if (s.includes("week") || s === "w" || s === "wk" || s === "weekly")
        return "Weekly";
    if (s.includes("month") || s === "m" || s === "monthly") return "Monthly";
    if (s.includes("quart") || s === "q" || s === "quarterly")
        return "Quarterly";

    return String(raw ?? "");
}

function normalizeStatus(raw: unknown): ViewReport["status"] {
    const s = String(raw ?? "")
        .trim()
        .toLowerCase();

    if (s.includes("complete") || s === "done") return "Completed";
    if (
        s.includes("progress") ||
        s.includes("in_progress") ||
        s.includes("in progress")
    )
        return "In Progress";
    if (s.includes("fail") || s.includes("error")) return "Failed";

    return String(raw ?? "");
}

function buildExecutiveSummaryPath(reportId: string) {
    return `/preview/executive-summary?reportId=${encodeURIComponent(reportId)}`;
}

function buildAbsoluteUrl(path: string) {
    if (typeof window === "undefined") return path;
    return `${window.location.origin}${path}`;
}

export default function ArchivePage() {
    // Keep these simple strings (no union headaches)
    const [searchQuery, setSearchQuery] = useState("");
    const [typeFilter, setTypeFilter] = useState<string>("All");
    const [statusFilter, setStatusFilter] = useState<string>("All");
    const [sortKey, setSortKey] = useState<SortKey>("generated_desc");

    const filteredSorted: ViewReport[] = useMemo(() => {
        const q = safeLower(searchQuery).trim();

        // 1) Normalize the data into display-safe labels
        let rows: ViewReport[] = reportSummaries.map((r: any) => ({
            id: r.id,
            name: r.name,
            periodLabel: r.periodLabel,
            generatedOn: r.generatedOn,
            generatedBy: r.generatedBy,
            type: normalizeType(r.type),
            status: normalizeStatus(r.status),
        }));

        // 2) Search
        if (q) {
            rows = rows.filter((r) => {
                const hay = [
                    r.name,
                    r.id,
                    r.generatedBy,
                    r.periodLabel,
                    r.type,
                    r.status,
                ]
                    .map((x) => safeLower(String(x)))
                    .join(" ");
                return hay.includes(q);
            });
        }

        // 3) Filters
        if (typeFilter !== "All")
            rows = rows.filter((r) => r.type === typeFilter);
        if (statusFilter !== "All")
            rows = rows.filter((r) => r.status === statusFilter);

        // 4) Sort
        rows.sort((a, b) => {
            const ta = new Date(a.generatedOn).getTime();
            const tb = new Date(b.generatedOn).getTime();

            switch (sortKey) {
                case "generated_desc":
                    return tb - ta;
                case "generated_asc":
                    return ta - tb;
                case "name_asc":
                    return a.name.localeCompare(b.name);
                case "name_desc":
                    return b.name.localeCompare(a.name);
                case "type_asc":
                    return String(a.type).localeCompare(String(b.type));
                case "type_desc":
                    return String(b.type).localeCompare(String(a.type));
                case "status_asc":
                    return String(a.status).localeCompare(String(b.status));
                case "status_desc":
                    return String(b.status).localeCompare(String(a.status));
                default:
                    return tb - ta;
            }
        });

        return rows;
    }, [searchQuery, typeFilter, statusFilter, sortKey]);

    const latestReport = filteredSorted[0];

    // Options derived from *normalized* rows (always matches the UI labels)
    const typeOptions = useMemo(() => {
        const set = new Set(filteredSorted.map((r) => r.type));
        return ["Weekly", "Monthly", "Quarterly"].filter((t) => set.has(t));
    }, [filteredSorted]);

    const statusOptions = useMemo(() => {
        const set = new Set(filteredSorted.map((r) => r.status));
        return ["Completed", "In Progress", "Failed"].filter((s) => set.has(s));
    }, [filteredSorted]);

    function handleClear() {
        setSearchQuery("");
        setTypeFilter("All");
        setStatusFilter("All");
        setSortKey("generated_desc");
        toast.success("Filters cleared", {
            description: "Showing the full archive list.",
        });
    }

    function handleCopyArchiveLink() {
        const url = buildAbsoluteUrl("/archive");
        if (navigator?.clipboard?.writeText) {
            navigator.clipboard
                .writeText(url)
                .then(() => toast.success("Archive link copied"))
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

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22 }}
                className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"
            >
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <ArchiveIcon className="h-5 w-5 text-[#193E6B]" />
                        <h1 className="text-xl font-semibold text-[#193E6B]">
                            Report Archive
                        </h1>
                    </div>
                    <p className="text-sm text-gray-600">
                        Browse, filter, and compare historical Interest
                        Generation reports.
                    </p>
                </div>

                {/* Header actions */}
                <div className="flex flex-wrap items-center gap-2">
                    {latestReport ? (
                        <Link
                            to={buildExecutiveSummaryPath(latestReport.id)}
                            className={cn(
                                "inline-flex items-center gap-2 rounded-md border border-[#B3A125]/35 bg-[#B3A125]/10 px-3 py-2 text-sm font-semibold",
                                "text-[#193E6B] hover:bg-[#B3A125]/15"
                            )}
                            onClick={() =>
                                toast("Opening latest report…", {
                                    description: latestReport.name,
                                })
                            }
                            title="Open the most recent report"
                        >
                            <ArrowRight className="h-4 w-4" />
                            Open latest
                        </Link>
                    ) : null}

                    <button
                        type="button"
                        onClick={handleCopyArchiveLink}
                        className={cn(
                            "inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-semibold",
                            "text-[#193E6B] hover:bg-gray-50"
                        )}
                        title="Copy archive link"
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
                </div>
            </motion.div>

            {/* Filters */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, delay: 0.04 }}
            >
                <ArchiveFiltersBar
                    searchQuery={searchQuery}
                    onSearchQueryChange={setSearchQuery}
                    typeOptions={typeOptions}
                    typeFilter={typeFilter}
                    onTypeFilterChange={setTypeFilter}
                    statusOptions={statusOptions}
                    statusFilter={statusFilter}
                    onStatusFilterChange={setStatusFilter}
                    sortKey={sortKey}
                    onSortKeyChange={setSortKey}
                    onClear={handleClear}
                />
            </motion.div>

            {/* Insights */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, delay: 0.06 }}
                whileHover={{ y: -2 }}
            >
                <ArchiveInsights reports={filteredSorted as any} />
            </motion.div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, delay: 0.08 }}
                    whileHover={{ y: -2 }}
                    className="lg:col-span-2"
                >
                    <ArchiveTrendRecharts reports={filteredSorted as any} />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, delay: 0.1 }}
                    whileHover={{ y: -2 }}
                    className="lg:col-span-1"
                >
                    <div className="rounded-xl border border-[#B3A125]/25 bg-[#B3A125]/10 p-4">
                        <div className="text-sm font-semibold text-[#193E6B]">
                            Tip for reviewers
                        </div>
                        <p className="mt-1 text-sm text-[#193E6B]">
                            Use filters to isolate a time period, then open
                            multiple reports in sequence to compare performance
                            patterns.
                        </p>
                    </div>
                </motion.div>
            </div>

            {/* Table */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, delay: 0.12 }}
                whileHover={{ y: -2 }}
            >
                <ArchiveReportsTable reports={filteredSorted as any} />
            </motion.div>
        </div>
    );
}
