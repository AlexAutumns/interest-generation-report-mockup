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

type ReportNamingInput = {
    reportType: "weekly" | "monthly" | "quarterly";
    customName?: string;
    weekStart?: string;
    weekEnd?: string;
    month?: string; // yyyy-mm
    quarter?: "Q1" | "Q2" | "Q3" | "Q4";
    year?: number;
};

function pad2(n: number) {
    return String(n).padStart(2, "0");
}

function toYmd(d: Date) {
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

// ISO week helpers (matches “Week 26 2025” style)
function getISOWeekYear(date: Date) {
    const d = new Date(
        Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    );
    const day = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - day);
    return d.getUTCFullYear();
}

function getISOWeek(date: Date) {
    const d = new Date(
        Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    );
    const day = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - day);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const diffDays =
        Math.floor((d.getTime() - yearStart.getTime()) / 86400000) + 1;
    return Math.ceil(diffDays / 7);
}

function monthLabelFromYyyyMm(yyyyMm: string) {
    const [yStr, mStr] = yyyyMm.split("-");
    const y = Number(yStr);
    const m = Number(mStr);
    if (!y || !m) return yyyyMm;

    const date = new Date(y, m - 1, 1);
    const monthName = date.toLocaleString(undefined, { month: "long" });
    return `${monthName} ${y}`;
}

export function buildPeriodLabelFromSettings(input: ReportNamingInput): string {
    if (input.reportType === "weekly") {
        if (!input.weekStart) return "Weekly";
        const d = new Date(input.weekStart);
        const wk = getISOWeek(d);
        const yr = getISOWeekYear(d);
        return `Week ${wk} ${yr}`;
    }

    if (input.reportType === "monthly") {
        if (!input.month) return "Monthly";
        return monthLabelFromYyyyMm(input.month);
    }

    // quarterly
    const q = input.quarter ?? "Q1";
    const y = input.year ?? new Date().getFullYear();
    return `${q} ${y}`;
}

export function buildPeriodRangeFromSettings(input: ReportNamingInput): {
    periodStart: string;
    periodEnd: string;
} {
    if (input.reportType === "weekly") {
        // use user-picked dates (already validated by schema)
        return {
            periodStart: input.weekStart ?? "",
            periodEnd: input.weekEnd ?? "",
        };
    }

    if (input.reportType === "monthly") {
        const yyyyMm = input.month ?? "";
        const [yStr, mStr] = yyyyMm.split("-");
        const y = Number(yStr);
        const m = Number(mStr);
        if (!y || !m) return { periodStart: "", periodEnd: "" };

        const start = new Date(y, m - 1, 1);
        const end = new Date(y, m, 0); // last day of month
        return { periodStart: toYmd(start), periodEnd: toYmd(end) };
    }

    // quarterly
    const q = input.quarter ?? "Q1";
    const y = input.year ?? new Date().getFullYear();
    const qIndex = { Q1: 0, Q2: 1, Q3: 2, Q4: 3 }[q];
    const startMonth = qIndex * 3;
    const start = new Date(y, startMonth, 1);
    const end = new Date(y, startMonth + 3, 0); // last day of quarter
    return { periodStart: toYmd(start), periodEnd: toYmd(end) };
}

export function buildDefaultReportName(input: ReportNamingInput): string {
    const periodLabel = buildPeriodLabelFromSettings(input);

    const prefix =
        input.reportType === "weekly"
            ? "Weekly Interest Report"
            : input.reportType === "monthly"
              ? "Monthly Interest Report"
              : "Quarterly Interest Report";

    return `${prefix} – ${periodLabel}`;
}

export function pickReportName(input: ReportNamingInput): string {
    const trimmed = input.customName?.trim();
    return trimmed && trimmed.length > 0
        ? trimmed
        : buildDefaultReportName(input);
}
