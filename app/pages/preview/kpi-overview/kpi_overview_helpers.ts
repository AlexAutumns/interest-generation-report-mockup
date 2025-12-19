import type {
    BreakdownRow,
    GeneratedReportShape,
    KpiTilesData,
    TrendPoint,
} from "./kpi_overview_types";

export function sum(nums: number[]) {
    return nums.reduce((a, b) => a + b, 0);
}

export function safeNumber(n: unknown, fallback = 0) {
    const v = Number(n);
    return Number.isFinite(v) ? v : fallback;
}

export function pct(numerator: number, denominator: number) {
    if (!denominator) return 0;
    return (numerator / denominator) * 100;
}

export function formatUsd(n: number) {
    return `$${Math.round(n).toLocaleString()}`;
}

export function buildTilesFromReport(
    report: GeneratedReportShape
): KpiTilesData {
    const s = report.executiveSummary;

    const totalRevenueUsd = sum(
        (report.channels ?? []).map((c) => safeNumber(c.revenueUsd))
    );
    const totalCostUsd = sum(
        (report.channels ?? []).map((c) => safeNumber(c.costUsd))
    );

    const roiPercent =
        totalCostUsd > 0
            ? pct(totalRevenueUsd - totalCostUsd, totalCostUsd)
            : 0;

    return {
        totalLeads: safeNumber(s.totalLeads),
        convertedLeads: safeNumber(s.convertedLeads),
        conversionRate: safeNumber(s.conversionRate),
        avgFollowUpHours: safeNumber(s.avgFollowUpTime),
        avgLeadScore: safeNumber(s.avgLeadScore),
        totalRevenueUsd,
        totalCostUsd,
        roiPercent,
    };
}

export function buildChannelBreakdown(
    report: GeneratedReportShape
): BreakdownRow[] {
    const rows: BreakdownRow[] = (report.channels ?? []).map((c) => ({
        name: String(c.channel),
        totalLeads: safeNumber(c.leads),
        convertedLeads: safeNumber(c.converted),
        conversionRate: safeNumber(c.conversionRate),
    }));

    return rows.sort((a, b) => b.totalLeads - a.totalLeads).slice(0, 8);
}

export function buildTrend(report: GeneratedReportShape): TrendPoint[] {
    if (Array.isArray(report.trend) && report.trend.length) {
        return report.trend.map((t) => ({
            label: String(t.label),
            totalLeads: safeNumber(t.totalLeads),
            convertedLeads: safeNumber(t.convertedLeads),
            conversionRate: safeNumber(t.conversionRate),
        }));
    }

    // Fallback: fabricate 6 points (mock-friendly)
    const total = safeNumber(report.executiveSummary?.totalLeads);
    const converted = safeNumber(report.executiveSummary?.convertedLeads);

    const points: TrendPoint[] = [];
    const buckets = 6;

    for (let i = 0; i < buckets; i++) {
        const frac = (i + 1) / buckets;
        const tl = Math.max(
            0,
            Math.round(total * frac * (0.78 + (i % 2) * 0.08))
        );
        const cl = Math.max(
            0,
            Math.round(converted * frac * (0.78 + ((i + 1) % 2) * 0.08))
        );

        points.push({
            label: `W${i + 1}`,
            totalLeads: tl,
            convertedLeads: cl,
            conversionRate: pct(cl, tl),
        });
    }

    return points;
}
