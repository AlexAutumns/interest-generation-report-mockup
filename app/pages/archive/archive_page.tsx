// app/pages/archive/archive_page.tsx
import { useMemo, useState } from "react";
import { Archive as ArchiveIcon } from "lucide-react";
import { reportSummaries } from "../../data/mockReportSummaries";

import ArchiveFiltersBar from "./archive_filters_bar";
import ArchiveInsights from "./archive_insights";
import ArchiveTrendRecharts from "./archive_trend_recharts";
import ArchiveReportsTable from "./archive_reports_table";

import type { SortKey } from "./archive_helpers";
import { safeLower } from "./archive_helpers";

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

    // Handles: WEEKLY / weekly / Week / wk / etc.
    if (s.includes("week") || s === "w" || s === "wk" || s === "weekly")
        return "Weekly";
    if (s.includes("month") || s === "m" || s === "monthly") return "Monthly";
    if (s.includes("quart") || s === "q" || s === "quarterly")
        return "Quarterly";

    // If already "Weekly"/"Monthly"/"Quarterly", keep it
    if (s === "weekly") return "Weekly";
    if (s === "monthly") return "Monthly";
    if (s === "quarterly") return "Quarterly";

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

    // If already in correct form
    if (s === "completed") return "Completed";
    if (s === "in progress") return "In Progress";
    if (s === "failed") return "Failed";

    return String(raw ?? "");
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
        if (typeFilter !== "All") {
            rows = rows.filter((r) => r.type === typeFilter);
        }
        if (statusFilter !== "All") {
            rows = rows.filter((r) => r.status === statusFilter);
        }

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
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                    <ArchiveIcon className="h-5 w-5 text-[#193E6B]" />
                    <h1 className="text-xl font-semibold text-[#193E6B]">
                        Report Archive
                    </h1>
                </div>
                <p className="text-sm text-gray-600">
                    Browse, filter, and compare historical Interest Generation
                    reports.
                </p>
            </div>

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

            {/* These modules will work fine with normalized strings */}
            <ArchiveInsights reports={filteredSorted as any} />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="lg:col-span-1">
                    <ArchiveTrendRecharts reports={filteredSorted as any} />
                </div>

                <div className="lg:col-span-2">
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
                </div>
            </div>

            <ArchiveReportsTable reports={filteredSorted as any} />
        </div>
    );
}
