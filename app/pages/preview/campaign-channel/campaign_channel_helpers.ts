import type { GeneratedReport } from "../../../types/reports";

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

export function shortLabel(label: string, max = 12) {
    return label.length > max ? `${label.slice(0, max)}…` : label;
}

/**
 * Ranking metric for "Top campaigns by..."
 * NOTE: Some metrics are "higher is better" while some are "lower is better".
 */
export type CampaignRankBy =
    | "leads"
    | "converted"
    | "conversion_rate"
    | "revenue"
    | "roi"
    | "cpl"
    | "cpc";

export const CAMPAIGN_RANK_OPTIONS: Array<{
    value: CampaignRankBy;
    label: string;
    direction: "desc" | "asc";
}> = [
    { value: "leads", label: "Leads (highest)", direction: "desc" },
    { value: "converted", label: "Conversions (highest)", direction: "desc" },
    {
        value: "conversion_rate",
        label: "Conversion rate (highest)",
        direction: "desc",
    },
    { value: "revenue", label: "Revenue (highest)", direction: "desc" },
    { value: "roi", label: "ROI % (highest)", direction: "desc" },
    { value: "cpl", label: "Cost per lead (lowest)", direction: "asc" },
    { value: "cpc", label: "Cost per conversion (lowest)", direction: "asc" },
];

export type ChannelRow = {
    channel: string;
    channelShort: string;
    leads: number;
    converted: number;
    conversionRate: number;
    revenueUsd: number;
    costUsd: number;
    roiPercent: number;
};

export type CampaignRow = {
    campaign: string;
    campaignShort: string;
    leads: number;
    converted: number;
    conversionRate: number;
    revenueUsd: number;
    costUsd: number;
    roiPercent: number;

    // handy derived efficiency metrics
    cplUsd: number; // cost per lead
    cpcUsd: number; // cost per conversion
};

export function buildChannelRows(report: GeneratedReport): ChannelRow[] {
    const rows: ChannelRow[] = (report.channels ?? []).map((c) => {
        const leads = safeNumber(c.leads);
        const converted = safeNumber(c.converted);
        const revenueUsd = safeNumber(c.revenueUsd);
        const costUsd = safeNumber(c.costUsd);
        const roiPercent = costUsd > 0 ? pct(revenueUsd - costUsd, costUsd) : 0;

        return {
            channel: String(c.channel ?? "Unknown"),
            channelShort: shortLabel(String(c.channel ?? "Unknown")),
            leads,
            converted,
            conversionRate: safeNumber(c.conversionRate, pct(converted, leads)),
            revenueUsd,
            costUsd,
            roiPercent,
        };
    });

    return rows.sort((a, b) => b.leads - a.leads);
}

function metricValue(row: CampaignRow, metric: CampaignRankBy) {
    switch (metric) {
        case "leads":
            return row.leads;
        case "converted":
            return row.converted;
        case "conversion_rate":
            return row.conversionRate;
        case "revenue":
            return row.revenueUsd;
        case "roi":
            return row.roiPercent;
        case "cpl":
            return row.cplUsd;
        case "cpc":
            return row.cpcUsd;
        default:
            return row.leads;
    }
}

function sortDirection(metric: CampaignRankBy) {
    const opt = CAMPAIGN_RANK_OPTIONS.find((o) => o.value === metric);
    return opt?.direction ?? "desc";
}

export function buildCampaignRows(
    report: GeneratedReport,
    rankBy: CampaignRankBy = "leads"
): CampaignRow[] {
    const rows: CampaignRow[] = (report.campaigns ?? []).map((c) => {
        const leads = safeNumber(c.leads);
        const converted = safeNumber(c.converted);
        const revenueUsd = safeNumber(c.revenueUsd);
        const costUsd = safeNumber(c.costUsd);

        const conversionRate = safeNumber(
            c.conversionRate,
            pct(converted, leads)
        );
        const roiPercent = costUsd > 0 ? pct(revenueUsd - costUsd, costUsd) : 0;

        const cplUsd = leads > 0 ? costUsd / leads : 0;
        const cpcUsd = converted > 0 ? costUsd / converted : 0;

        const campaign = String(c.campaign ?? "Unknown");

        return {
            campaign,
            campaignShort: shortLabel(campaign),
            leads,
            converted,
            conversionRate,
            revenueUsd,
            costUsd,
            roiPercent,
            cplUsd,
            cpcUsd,
        };
    });

    const dir = sortDirection(rankBy);
    return rows.sort((a, b) => {
        const av = metricValue(a, rankBy);
        const bv = metricValue(b, rankBy);
        return dir === "asc" ? av - bv : bv - av;
    });
}

export function getTopCampaignLabel(
    report: GeneratedReport,
    rankBy: CampaignRankBy
) {
    const rows = buildCampaignRows(report, rankBy);
    return rows[0]?.campaign ?? "—";
}
