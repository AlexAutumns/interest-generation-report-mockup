import type { GenerateReportFormValues } from "./generate_report_schema";
import { buildDefaultReportName } from "./generate_report_helpers";

type Props = {
    values: GenerateReportFormValues;
};

function readableReportType(t: GenerateReportFormValues["reportType"]) {
    if (t === "weekly") return "Weekly";
    if (t === "monthly") return "Monthly";
    return "Quarterly";
}

function buildPeriodLabel(v: GenerateReportFormValues) {
    if (v.reportType === "weekly") {
        const a = v.weekStart ? new Date(v.weekStart) : null;
        const b = v.weekEnd ? new Date(v.weekEnd) : null;
        if (!a || !b) return "Select start/end dates";
        const fmt: Intl.DateTimeFormatOptions = {
            year: "numeric",
            month: "short",
            day: "2-digit",
        };
        return `${a.toLocaleDateString(undefined, fmt)} – ${b.toLocaleDateString(undefined, fmt)}`;
    }

    if (v.reportType === "monthly") {
        if (!v.month) return "Select a month";
        // v.month is "YYYY-MM"
        const [yy, mm] = v.month.split("-");
        const d = new Date(Number(yy), Number(mm) - 1, 1);
        return d.toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
        });
    }

    // quarterly
    if (!v.quarter || !v.year) return "Select quarter and year";
    return `${v.quarter} ${v.year}`;
}

function pill(text: string) {
    return "inline-flex items-center rounded-full bg-[#193E6B]/5 px-2 py-1 text-xs font-semibold text-[#193E6B] ring-1 ring-[#193E6B]/10";
}

function listOrAll(arr: string[] | undefined, emptyLabel: string) {
    if (!arr || arr.length === 0)
        return <span className="text-gray-600">{emptyLabel}</span>;
    return (
        <div className="flex flex-wrap gap-1">
            {arr.slice(0, 8).map((x) => (
                <span key={x} className={pill(x)}>
                    {x}
                </span>
            ))}
            {arr.length > 8 && (
                <span className="text-xs font-semibold text-gray-500">
                    +{arr.length - 8} more
                </span>
            )}
        </div>
    );
}

export default function WhatWillGeneratePanel({ values }: Props) {
    const periodLabel = buildPeriodLabel(values);

    const defaultNamePreview = buildDefaultReportName(values);

    const effectiveName =
        values.customName && values.customName.trim().length > 0
            ? values.customName.trim()
            : defaultNamePreview;

    const nameSourceLabel =
        values.customName && values.customName.trim().length > 0
            ? "Custom name"
            : "Default name";

    const exportsLabel = values.exports?.length
        ? values.exports.map((x) => x.toUpperCase()).join(" + ")
        : "—";

    const scopeLabel =
        values.scopeMode === "all" ? "All data in period" : "Advanced filters";

    const applyLabel =
        values.applyFiltersTo === "both"
            ? "Preview + Exports"
            : values.applyFiltersTo === "preview_only"
              ? "Preview only"
              : "Exports only";

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="text-base font-semibold text-[#193E6B]">
                What this will generate
            </div>
            <div className="mt-1 text-sm text-gray-600">
                Quick double-check before you generate. This reflects your
                current selections.
            </div>

            <div className="mt-4 space-y-4">
                {/* Core */}
                <div className="rounded-lg bg-[#F5F5F5] p-3 ring-1 ring-gray-200">
                    <div className="text-xs text-gray-500">Report</div>
                    <div className="mt-1 text-sm font-semibold text-[#193E6B]">
                        {readableReportType(values.reportType)} • {periodLabel}
                    </div>

                    <div className="mt-2 rounded-md border border-gray-200 bg-white px-3 py-2">
                        <div className="text-xs text-gray-500">Report name</div>
                        <div className="mt-0.5 text-sm font-semibold text-[#193E6B]">
                            {effectiveName}
                        </div>
                        <div className="mt-0.5 text-[11px] text-gray-500">
                            {nameSourceLabel}
                        </div>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-2">...</div>
                </div>

                {/* Scope */}
                <div>
                    <div className="text-sm font-semibold text-[#193E6B]">
                        Scope
                    </div>
                    <div className="mt-1 text-sm text-gray-700">
                        <span className="font-semibold text-[#193E6B]">
                            {scopeLabel}
                        </span>
                        {values.scopeMode === "filtered" && (
                            <span className="text-gray-600">
                                {" "}
                                • Apply to: {applyLabel}
                            </span>
                        )}
                    </div>

                    {values.scopeMode === "filtered" && (
                        <div className="mt-3 space-y-3">
                            <div>
                                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Agents
                                </div>
                                <div className="mt-1">
                                    {listOrAll(values.agents, "All agents")}
                                </div>
                            </div>

                            <div>
                                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Status
                                </div>
                                <div className="mt-1">
                                    {listOrAll(values.statuses, "All statuses")}
                                </div>
                            </div>

                            <div>
                                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Channels
                                </div>
                                <div className="mt-1">
                                    {listOrAll(values.channels, "All channels")}
                                </div>
                            </div>

                            <div>
                                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Regions
                                </div>
                                <div className="mt-1">
                                    {listOrAll(values.regions, "All regions")}
                                </div>
                            </div>

                            <div>
                                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Campaigns
                                </div>
                                <div className="mt-1">
                                    {listOrAll(
                                        values.campaigns,
                                        "All campaigns"
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {values.scopeMode === "all" && (
                        <div className="mt-3 rounded-md border border-[#B3A125]/35 bg-[#B3A125]/10 px-3 py-2 text-xs text-[#193E6B]">
                            Recommended for consistent KPI tracking and
                            comparing periods.
                        </div>
                    )}
                </div>

                {/* Sections */}
                <div>
                    <div className="text-sm font-semibold text-[#193E6B]">
                        Included sections
                    </div>
                    <div className="mt-2 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                        <div className="rounded-md border border-gray-200 bg-white px-3 py-2">
                            <div className="text-xs text-gray-500">
                                Appendix
                            </div>
                            <div className="font-semibold text-[#193E6B]">
                                {values.includeAppendix
                                    ? "Included"
                                    : "Not included"}
                            </div>
                        </div>
                        <div className="rounded-md border border-gray-200 bg-white px-3 py-2">
                            <div className="text-xs text-gray-500">
                                Draft commentary
                            </div>
                            <div className="font-semibold text-[#193E6B]">
                                {values.includeCommentaryDraft
                                    ? "Included"
                                    : "Not included"}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reminder */}
                <div className="rounded-md border border-gray-200 bg-white px-3 py-2 text-xs text-gray-600">
                    Later: the generation logic will use these exact settings to
                    query Dataverse/CSV, compute KPIs, and create a new
                    reportId.
                </div>
            </div>
        </div>
    );
}
