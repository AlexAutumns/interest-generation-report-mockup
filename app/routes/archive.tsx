// app/routes/archive.tsx
import { useMemo, useState } from "react";
import { Link } from "react-router";
import { reportSummaries } from "../data/mockReportSummaries";
import {
    Archive as ArchiveIcon,
    Search,
    Filter,
    ArrowUpDown,
    RotateCcw,
    FilePlus2,
    ArrowRight,
} from "lucide-react";

type SortKey = "generatedOn" | "name" | "type" | "status";
type SortDir = "desc" | "asc";

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

function compare(a: string, b: string) {
    return a.localeCompare(b, undefined, { sensitivity: "base" });
}

export default function ArchiveRoute() {
    const [query, setQuery] = useState("");
    const [typeFilter, setTypeFilter] = useState<
        "all" | "weekly" | "monthly" | "quarterly"
    >("all");
    const [statusFilter, setStatusFilter] = useState<
        "all" | "Completed" | "In Progress" | "Failed"
    >("all");
    const [sortKey, setSortKey] = useState<SortKey>("generatedOn");
    const [sortDir, setSortDir] = useState<SortDir>("desc");

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();

        let rows = reportSummaries.filter((r) => {
            const matchesQuery =
                q.length === 0 ||
                r.name.toLowerCase().includes(q) ||
                r.id.toLowerCase().includes(q) ||
                r.generatedBy.toLowerCase().includes(q) ||
                r.periodLabel.toLowerCase().includes(q);

            const matchesType =
                typeFilter === "all" ? true : r.type === typeFilter;
            const matchesStatus =
                statusFilter === "all" ? true : r.status === statusFilter;

            return matchesQuery && matchesType && matchesStatus;
        });

        rows.sort((a, b) => {
            let val = 0;

            if (sortKey === "generatedOn") {
                val =
                    new Date(a.generatedOn).getTime() -
                    new Date(b.generatedOn).getTime();
            } else if (sortKey === "name") {
                val = compare(a.name, b.name);
            } else if (sortKey === "type") {
                val = compare(a.type, b.type);
            } else if (sortKey === "status") {
                val = compare(a.status, b.status);
            }

            return sortDir === "asc" ? val : -val;
        });

        return rows;
    }, [query, typeFilter, statusFilter, sortKey, sortDir]);

    const clearFilters = () => {
        setQuery("");
        setTypeFilter("all");
        setStatusFilter("all");
        setSortKey("generatedOn");
        setSortDir("desc");
    };

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
                    Browse historical reports, filter by type/status, and open a
                    report preview.
                </p>
            </div>

            {/* Controls */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-end">
                    {/* Search */}
                    <div className="lg:col-span-5">
                        <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                            <Search className="h-4 w-4" />
                            Search
                        </label>
                        <div className="relative mt-2">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search by report name, ID, period, or generated by..."
                                className="w-full rounded-md border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-[#193E6B] outline-none focus:ring-2 focus:ring-[#B3A125]/60"
                            />
                        </div>
                    </div>

                    {/* Type */}
                    <div className="lg:col-span-2">
                        <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                            <Filter className="h-4 w-4" />
                            Type
                        </label>
                        <select
                            value={typeFilter}
                            onChange={(e) =>
                                setTypeFilter(e.target.value as any)
                            }
                            className="mt-2 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-[#193E6B] outline-none focus:ring-2 focus:ring-[#B3A125]/60"
                        >
                            <option value="all">All</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="quarterly">Quarterly</option>
                        </select>
                    </div>

                    {/* Status */}
                    <div className="lg:col-span-2">
                        <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                            <Filter className="h-4 w-4" />
                            Status
                        </label>
                        <select
                            value={statusFilter}
                            onChange={(e) =>
                                setStatusFilter(e.target.value as any)
                            }
                            className="mt-2 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-[#193E6B] outline-none focus:ring-2 focus:ring-[#B3A125]/60"
                        >
                            <option value="all">All</option>
                            <option value="Completed">Completed</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Failed">Failed</option>
                        </select>
                    </div>

                    {/* Sort */}
                    <div className="lg:col-span-2">
                        <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                            <ArrowUpDown className="h-4 w-4" />
                            Sort
                        </label>

                        <div className="mt-2 flex gap-2">
                            <select
                                value={sortKey}
                                onChange={(e) =>
                                    setSortKey(e.target.value as SortKey)
                                }
                                className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-[#193E6B] outline-none focus:ring-2 focus:ring-[#B3A125]/60"
                            >
                                <option value="generatedOn">
                                    Generated On
                                </option>
                                <option value="name">Report Name</option>
                                <option value="type">Type</option>
                                <option value="status">Status</option>
                            </select>

                            <button
                                type="button"
                                onClick={() =>
                                    setSortDir((d) =>
                                        d === "desc" ? "asc" : "desc"
                                    )
                                }
                                className="whitespace-nowrap rounded-md border border-[#B3A125]/35 bg-[#B3A125]/10 px-3 py-2 text-sm font-semibold text-[#193E6B] hover:bg-[#B3A125]/15"
                                title="Toggle sort direction"
                            >
                                {sortDir === "desc" ? "↓" : "↑"}
                            </button>
                        </div>
                    </div>

                    {/* Reset */}
                    <div className="lg:col-span-1 flex gap-2 lg:justify-end">
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                        >
                            <RotateCcw className="h-4 w-4" />
                            Reset
                        </button>
                    </div>
                </div>

                {/* Small stats row */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <span className="inline-flex items-center rounded-full bg-[#193E6B]/5 px-3 py-1 text-xs font-semibold text-[#193E6B] ring-1 ring-[#193E6B]/10">
                        Showing {filtered.length} of {reportSummaries.length}
                    </span>

                    <Link
                        to="/generate"
                        className="inline-flex items-center gap-2 rounded-full border border-[#B3A125]/35 bg-[#B3A125]/10 px-3 py-1 text-xs font-semibold text-[#193E6B] hover:bg-[#B3A125]/15"
                    >
                        <FilePlus2 className="h-4 w-4" />
                        Generate Report
                    </Link>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="flex items-center justify-between px-5 py-4">
                    <h2 className="text-base font-semibold text-[#193E6B]">
                        All reports
                    </h2>

                    <span className="inline-flex items-center gap-2 text-xs text-gray-500">
                        <span className="inline-block h-2 w-2 rounded-full bg-[#B3A125]" />
                        Click a report name to open preview
                    </span>
                </div>

                <div className="max-h-[560px] overflow-auto border-t border-gray-200">
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
                            {filtered.map((r) => (
                                <tr
                                    key={r.id}
                                    className="border-t border-gray-100 hover:bg-[#193E6B]/[0.03]"
                                >
                                    <td className="px-5 py-3">
                                        <Link
                                            to={`/preview/executive-summary?reportId=${encodeURIComponent(
                                                r.id
                                            )}`}
                                            className="inline-flex items-center gap-2 font-semibold text-[#193E6B] hover:underline"
                                        >
                                            {r.name}
                                            <ArrowRight className="h-4 w-4 text-[#193E6B]/70" />
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

                            {filtered.length === 0 && (
                                <tr>
                                    <td
                                        className="px-5 py-8 text-sm text-gray-600"
                                        colSpan={6}
                                    >
                                        No results found. Try adjusting your
                                        search or filters.
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
