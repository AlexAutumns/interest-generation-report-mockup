import type { GeneratedReport, ReportSummary } from "../types/reports";
import type { GenerateReportFormValues } from "../pages/generate-report/generate_report_schema";
import { buildDefaultReportName } from "../pages/generate-report/generate_report_helpers";
import { reportRepository } from "./report_repository";

function buildMockReportId() {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const rand = Math.floor(Math.random() * 900 + 100);
    return `RPT-${yyyy}${mm}${dd}-${rand}`;
}

function pickEffectiveName(values: GenerateReportFormValues) {
    const defaultName = buildDefaultReportName(values);
    const custom = values.customName?.trim();
    return custom && custom.length > 0 ? custom : defaultName;
}

function buildPeriod(values: GenerateReportFormValues): {
    periodLabel: string;
    periodStart: string;
    periodEnd: string;
} {
    if (values.reportType === "weekly") {
        return {
            periodLabel:
                values.weekStart && values.weekEnd
                    ? `${values.weekStart} – ${values.weekEnd}`
                    : "Select start/end dates",
            periodStart: values.weekStart ?? "",
            periodEnd: values.weekEnd ?? "",
        };
    }

    if (values.reportType === "monthly") {
        // values.month is "YYYY-MM"
        return {
            periodLabel: values.month ?? "Select a month",
            periodStart: values.month ? `${values.month}-01` : "",
            periodEnd: values.month ? `${values.month}-01` : "",
        };
    }

    // quarterly
    return {
        periodLabel:
            values.quarter && values.year
                ? `${values.quarter} ${values.year}`
                : "Select quarter and year",
        periodStart: values.year
            ? new Date(values.year, 0, 1).toISOString()
            : "",
        periodEnd: values.year
            ? new Date(values.year, 11, 31).toISOString()
            : "",
    };
}

function buildSummaryFromReport(r: GeneratedReport): ReportSummary {
    return {
        id: r.id,
        name: r.name,
        type: r.type,
        periodLabel: r.periodLabel,
        periodStart: r.periodStart,
        periodEnd: r.periodEnd,
        generatedOn: r.generatedOn,
        generatedBy: r.generatedBy,
        status: r.status,
        metricsPreview: {
            totalLeads: r.executiveSummary.totalLeads,
            convertedLeads: r.executiveSummary.convertedLeads,
            conversionRate: r.executiveSummary.conversionRate,
            topChannel: r.executiveSummary.topChannel,
        },
    };
}

/**
 * Mock generator:
 * - clones latest seeded report so preview pages always have expected fields
 * - updates ID/name/period/timestamps
 */
export function generateMockReportFromSettings(
    values: GenerateReportFormValues
): {
    report: GeneratedReport;
    summary: ReportSummary;
} {
    const base = reportRepository.getLatestReport();

    const id = buildMockReportId();
    const generatedOn = new Date().toISOString();
    const name = pickEffectiveName(values);
    const period = buildPeriod(values);

    const report: GeneratedReport = {
        ...base,
        id,
        name,
        type: values.reportType,
        periodLabel: period.periodLabel,
        periodStart: period.periodStart,
        periodEnd: period.periodEnd,
        generatedOn,
        status: "Completed",
    };

    const summary = buildSummaryFromReport(report);
    return { report, summary };
}
