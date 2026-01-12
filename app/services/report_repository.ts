import { useMemo } from "react";
import { useReportsStore } from "../state/reports_store";
import type { GeneratedReport, ReportSummary } from "../types/reports";

type ReportsMode = "store" | "api";

/**
 * For later:
 * - VITE_REPORTS_MODE=api -> repository will call real endpoints
 * - default is store mode (current demo behavior)
 */
const MODE: ReportsMode =
    (import.meta as any).env?.VITE_REPORTS_MODE === "api" ? "api" : "store";

/**
 * Hooks (reactive) — components can import these instead of importing the store directly.
 */
export function useReportSummaries(): ReportSummary[] {
    return useReportsStore((s) => s.summaries);
}

export function useReports(): GeneratedReport[] {
    return useReportsStore((s) => s.reports);
}

export function useReportByIdSafe(
    reportId?: string
): GeneratedReport | undefined {
    const reports = useReportsStore((s) => s.reports);

    return useMemo(() => {
        return (
            (reportId ? reports.find((r) => r.id === reportId) : undefined) ??
            reports[0]
        );
    }, [reports, reportId]);
}

export function useSummaryByIdSafe(
    reportId?: string
): ReportSummary | undefined {
    const summaries = useReportsStore((s) => s.summaries);

    return useMemo(() => {
        return (
            (reportId ? summaries.find((r) => r.id === reportId) : undefined) ??
            summaries[0]
        );
    }, [summaries, reportId]);
}

/**
 * Imperative API (non-react) — useful for generation flows, utilities, future async fetch.
 */
export const reportRepository = {
    mode(): ReportsMode {
        return MODE;
    },

    listSummaries(): ReportSummary[] {
        if (MODE === "api") {
            // later: fetch from backend
            throw new Error("API mode not implemented yet.");
        }
        return useReportsStore.getState().summaries;
    },

    getReportByIdSafe(reportId?: string): GeneratedReport | undefined {
        if (MODE === "api") {
            // later: fetch if missing; cache in store
            throw new Error("API mode not implemented yet.");
        }

        const reports = useReportsStore.getState().reports;
        return (
            (reportId ? reports.find((r) => r.id === reportId) : undefined) ??
            reports[0]
        );
    },

    addGeneratedReport(report: GeneratedReport, summary: ReportSummary): void {
        // In both modes, once you have a new report, updating UI = store update.
        useReportsStore.getState().addReport(report, summary);
    },

    // Later-friendly helpers:
    setSummariesFromApi(summaries: ReportSummary[]) {
        useReportsStore.getState().setSummaries(summaries);
    },

    upsertReportFromApi(report: GeneratedReport) {
        useReportsStore.getState().upsertReport(report);
    },
};
