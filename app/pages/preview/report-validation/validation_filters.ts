// app/pages/preview/report-validation/validation_filters.ts
//
// Filter snapshot + fallback detection helpers used by the Validation page.

import type { GeneratedReport } from "../../../types/reports";
import { cleanList } from "./validation_utils";

export type ReportFallbackFlags = {
    contactedMissing: boolean;
    leadScoreBinsMissing: boolean;
    trendMissing: boolean;
};

export type ReportFilterSummary = {
    periodLabel: string;

    scopeMode: "all" | "filtered" | "unknown";
    applyFiltersTo: "preview_only" | "exports_only" | "both" | "unknown";

    // null means "report is old and doesn’t store this yet"
    appliedToReport: boolean | null;

    agents: string[];
    statuses: string[];
    channels: string[];
    regions: string[];
    campaigns: string[];
};

export function buildFilterSummary(
    report: GeneratedReport,
): ReportFilterSummary {
    const f: any = (report as any).filters;

    if (!f) {
        return {
            periodLabel: report.periodLabel,
            scopeMode: "unknown",
            applyFiltersTo: "unknown",
            appliedToReport: null,
            agents: [],
            statuses: [],
            channels: [],
            regions: [],
            campaigns: [],
        };
    }

    return {
        periodLabel: report.periodLabel,
        scopeMode: f.scopeMode ?? "unknown",
        applyFiltersTo: f.applyFiltersTo ?? "unknown",
        appliedToReport:
            typeof f.appliedToReport === "boolean" ? f.appliedToReport : null,
        agents: cleanList(f.agents),
        statuses: cleanList(f.statuses),
        channels: cleanList(f.channels),
        regions: cleanList(f.regions),
        campaigns: cleanList(f.campaigns),
    };
}

export function detectFallbackFlags(
    report: GeneratedReport,
): ReportFallbackFlags {
    const hasContacted = Object.prototype.hasOwnProperty.call(
        report.funnel as any,
        "contacted",
    );
    const hasBins =
        Array.isArray((report as any).leadScoreBins) &&
        (report as any).leadScoreBins.length > 0;
    const hasTrend =
        Array.isArray((report as any).trend) &&
        (report as any).trend.length > 0;

    return {
        contactedMissing: !hasContacted,
        leadScoreBinsMissing: !hasBins,
        trendMissing: !hasTrend,
    };
}
