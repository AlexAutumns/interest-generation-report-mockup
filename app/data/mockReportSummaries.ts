// app/data/mockReportSummaries.ts
import type { ReportSummary } from "../types/reports";
import { generatedReports } from "./mockReportsFull";
import { toReportSummary, sortByGeneratedOnDesc } from "../utils/reportSummary";

/**
 * Derived summaries (for Home + Archive tables)
 * - Always derived from the full reports to avoid mismatches
 */
export const reportSummaries: ReportSummary[] = sortByGeneratedOnDesc(
    generatedReports.map(toReportSummary)
);

export const latestReportSummary: ReportSummary | undefined =
    reportSummaries[0];
