import { create } from "zustand";
import type { GeneratedReport, ReportSummary } from "../types/reports";
import { generatedReports as initialReports } from "../data/mockReportsFull";
import { reportSummaries as initialSummaries } from "../data/mockReportSummaries";

type ReportsState = {
    reports: GeneratedReport[];
    summaries: ReportSummary[];

    // existing
    addReport: (report: GeneratedReport, summary: ReportSummary) => void;

    // new (for repository/API mode later)
    setReports: (reports: GeneratedReport[]) => void;
    setSummaries: (summaries: ReportSummary[]) => void;
    upsertReport: (report: GeneratedReport) => void;
    upsertSummary: (summary: ReportSummary) => void;
};

export const useReportsStore = create<ReportsState>((set) => ({
    reports: (initialReports as unknown as GeneratedReport[]) ?? [],
    summaries: (initialSummaries as unknown as ReportSummary[]) ?? [],

    addReport: (report, summary) =>
        set((s) => ({
            reports: [report, ...s.reports],
            summaries: [summary, ...s.summaries],
        })),

    setReports: (reports) => set({ reports }),
    setSummaries: (summaries) => set({ summaries }),

    upsertReport: (report) =>
        set((s) => {
            const idx = s.reports.findIndex((r) => r.id === report.id);
            if (idx === -1) return { reports: [report, ...s.reports] };

            const next = [...s.reports];
            next[idx] = report;
            return { reports: next };
        }),

    upsertSummary: (summary) =>
        set((s) => {
            const idx = s.summaries.findIndex((r) => r.id === summary.id);
            if (idx === -1) return { summaries: [summary, ...s.summaries] };

            const next = [...s.summaries];
            next[idx] = summary;
            return { summaries: next };
        }),
}));
