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

export function buildChannelRows(report: any): ChannelRow[] {
    const rows: ChannelRow[] = (report.channels ?? []).map((c: any) => {
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

    // Sort by leads desc by default
    return rows.sort((a, b) => b.leads - a.leads);
}
