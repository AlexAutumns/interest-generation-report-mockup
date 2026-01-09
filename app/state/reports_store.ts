import { create } from "zustand";
import type { GeneratedReport, ReportSummary } from "../types/reports";
import { generatedReports as initialReports } from "../data/mockReportsFull";
import { reportSummaries as initialSummaries } from "../data/mockReportSummaries";

type ReportsState = {
    reports: GeneratedReport[];
    summaries: ReportSummary[];
    addReport: (report: GeneratedReport, summary: ReportSummary) => void;
};

export const useReportsStore = create<ReportsState>((set) => ({
    reports: (initialReports as unknown as GeneratedReport[]) ?? [],
    summaries: (initialSummaries as unknown as ReportSummary[]) ?? [],
    addReport: (report, summary) =>
        set((s) => ({
            reports: [report, ...s.reports],
            summaries: [summary, ...s.summaries],
        })),
}));
