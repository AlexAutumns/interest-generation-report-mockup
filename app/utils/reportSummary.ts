// app/utils/reportSummary.ts
import type { GeneratedReport, ReportSummary } from "../types/reports";

export function toReportSummary(report: GeneratedReport): ReportSummary {
    const s = report.executiveSummary;

    return {
        id: report.id,
        name: report.name,
        type: report.type,

        periodLabel: report.periodLabel,
        periodStart: report.periodStart,
        periodEnd: report.periodEnd,

        generatedOn: report.generatedOn,
        generatedBy: report.generatedBy,
        status: report.status,

        metricsPreview: {
            totalLeads: s.totalLeads,
            convertedLeads: s.convertedLeads,
            conversionRate: s.conversionRate,
            topChannel: s.topChannel,
        },
    };
}

export function sortByGeneratedOnDesc<T extends { generatedOn: string }>(
    items: T[]
): T[] {
    return [...items].sort(
        (a, b) =>
            new Date(b.generatedOn).getTime() -
            new Date(a.generatedOn).getTime()
    );
}
