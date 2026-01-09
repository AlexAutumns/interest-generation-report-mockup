// app/pages/generate-report/generate_report_helpers.ts
import type { ReportStatus, GeneratedReport } from "../../types/reports";

export const REPORT_TYPES = ["weekly", "monthly", "quarterly"] as const;
export const EXPORT_FORMATS = ["pdf", "excel"] as const;

export type ExportFormat = (typeof EXPORT_FORMATS)[number];

export const QUARTERS = ["Q1", "Q2", "Q3", "Q4"] as const;

export type ScopeMode = "all" | "filtered";

export function buildAbsoluteUrl(path: string) {
    if (typeof window === "undefined") return path;
    return `${window.location.origin}${path}`;
}

export function buildGeneratePath() {
    return "/generate";
}

/**
 * Derive filter options dynamically from your existing GeneratedReport mocks.
 * This keeps the UI realistic without hardcoding lists.
 */
export function deriveFilterOptions(reports: GeneratedReport[]) {
    const channelSet = new Set<string>();
    const campaignSet = new Set<string>();
    const regionSet = new Set<string>();
    const agentSet = new Set<string>();

    for (const r of reports) {
        (r.channels ?? []).forEach((c) => channelSet.add(String(c.channel)));
        // If you added campaigns to your report type/data, this will work:
        (r as any).campaigns?.forEach((c: any) =>
            campaignSet.add(String(c.campaign))
        );
        (r.regions ?? []).forEach((x) => regionSet.add(String(x.region)));
        (r.agents ?? []).forEach((a) => agentSet.add(String(a.agent)));
    }

    const channelOptions = [...channelSet].sort();
    const campaignOptions = [...campaignSet].sort();
    const regionOptions = [...regionSet].sort();
    const agentOptions = [...agentSet].sort();

    const statusOptions: ReportStatus[] = [
        "Completed",
        "In Progress",
        "Failed",
    ];

    return {
        channelOptions,
        campaignOptions,
        regionOptions,
        agentOptions,
        statusOptions,
    };
}
