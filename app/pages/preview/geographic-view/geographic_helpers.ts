import type { GeneratedReport } from "../../../types/reports";

export type GeoMetricKey = "leads" | "converted" | "conversionRate";

export type RegionRow = {
    region: string; // country name
    leads: number;
    converted: number;
    conversionRate: number; // percent
};

export function safeNumber(n: unknown, fallback = 0) {
    const v = Number(n);
    return Number.isFinite(v) ? v : fallback;
}

export function normalizeRegions(report: GeneratedReport): RegionRow[] {
    const rows =
        (report.regions ?? []).map((r) => ({
            region: String(r.region),
            leads: safeNumber(r.leads),
            converted: safeNumber(r.converted),
            conversionRate: safeNumber(r.conversionRate),
        })) ?? [];

    return rows.sort((a, b) => b.leads - a.leads);
}

export function metricLabel(key: GeoMetricKey) {
    if (key === "leads") return "Leads";
    if (key === "converted") return "Converted";
    return "Conversion Rate (%)";
}

export function getMetricValue(row: RegionRow, key: GeoMetricKey) {
    if (key === "leads") return row.leads;
    if (key === "converted") return row.converted;
    return row.conversionRate;
}

export function formatMetricValue(key: GeoMetricKey, value: number) {
    if (key === "conversionRate") return `${value.toFixed(1)}%`;
    return value.toLocaleString();
}
