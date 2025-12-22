import type {
    ConversionFunnelModel,
    DropOffRow,
    FunnelStage,
    FunnelStageKey,
    ScoreBin,
} from "./conversion_funnel_types";

function safeNumber(n: unknown, fallback = 0) {
    const v = Number(n);
    return Number.isFinite(v) ? v : fallback;
}

function pct(numerator: number, denominator: number) {
    if (!denominator) return 0;
    return (numerator / denominator) * 100;
}

function clampInt(n: number, min: number, max: number) {
    return Math.max(min, Math.min(max, Math.round(n)));
}

/**
 * Deterministic "noise" from report id (stable between reloads)
 */
function hashToUnit(seed: string) {
    let h = 2166136261;
    for (let i = 0; i < seed.length; i++) {
        h ^= seed.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    // 0..1
    return (h >>> 0) / 4294967295;
}

function stageLabel(key: FunnelStageKey) {
    switch (key) {
        case "captured":
            return "Captured";
        case "contacted":
            return "Contacted";
        case "engaged":
            return "Engaged";
        case "qualified":
            return "Qualified";
        case "converted":
            return "Converted";
    }
}

export function buildConversionFunnelModel(report: any): ConversionFunnelModel {
    const totalLeads = safeNumber(report?.executiveSummary?.totalLeads);
    const convertedLeads = safeNumber(report?.executiveSummary?.convertedLeads);
    const conversionRate = safeNumber(report?.executiveSummary?.conversionRate);
    const avgLeadScore = safeNumber(report?.executiveSummary?.avgLeadScore);
    const avgFollowUpHours = safeNumber(
        report?.executiveSummary?.avgFollowUpTime
    );

    const seed = String(report?.id ?? report?.name ?? "seed");
    const u = hashToUnit(seed);

    /**
     * Funnel stage estimation logic (mock-friendly):
     * - Use follow-up speed and conversion to shape the stages.
     * - Keep monotonic decreasing and always >= converted.
     */
    const contactedBase =
        avgFollowUpHours <= 24 ? 0.82 : avgFollowUpHours <= 48 ? 0.76 : 0.68;

    const engagedBase = 0.7 + (u - 0.5) * 0.06; // ~0.67..0.73
    const qualifiedBase = 0.62 + (u - 0.5) * 0.06; // ~0.59..0.65

    let contacted = clampInt(totalLeads * contactedBase, 0, totalLeads);
    let engaged = clampInt(contacted * engagedBase, 0, contacted);
    let qualified = clampInt(engaged * qualifiedBase, 0, engaged);
    let converted = clampInt(convertedLeads, 0, totalLeads);

    // Ensure monotonic and converted <= qualified <= engaged <= contacted <= captured
    if (qualified < converted) qualified = converted;
    if (engaged < qualified) engaged = qualified;
    if (contacted < engaged) contacted = engaged;
    if (converted > totalLeads) converted = totalLeads;

    const stages: FunnelStage[] = [
        { key: "captured", label: stageLabel("captured"), value: totalLeads },
        { key: "contacted", label: stageLabel("contacted"), value: contacted },
        { key: "engaged", label: stageLabel("engaged"), value: engaged },
        { key: "qualified", label: stageLabel("qualified"), value: qualified },
        { key: "converted", label: stageLabel("converted"), value: converted },
    ];

    const dropOff: DropOffRow[] = [];
    for (let i = 0; i < stages.length - 1; i++) {
        const from = stages[i];
        const to = stages[i + 1];
        const dropCount = Math.max(0, from.value - to.value);
        const dropRate = pct(dropCount, from.value);

        dropOff.push({
            fromLabel: from.label,
            toLabel: to.label,
            fromValue: from.value,
            toValue: to.value,
            dropCount,
            dropRate,
        });
    }

    const scoreBins = buildScoreBins(totalLeads, avgLeadScore, seed);

    const contactedRate = pct(contacted, totalLeads);
    const engagedRate = pct(engaged, totalLeads);
    const qualifiedRate = pct(qualified, totalLeads);

    const insights = buildInsights({
        stages,
        dropOff,
        avgLeadScore,
        avgFollowUpHours,
    });

    return {
        stages,
        dropOff,
        scoreBins,
        summary: {
            totalLeads,
            convertedLeads: converted,
            conversionRate: Number.isFinite(conversionRate)
                ? conversionRate
                : pct(converted, totalLeads),
            avgLeadScore,
            avgFollowUpHours,
            contactedRate,
            engagedRate,
            qualifiedRate,
        },
        insights,
    };
}

function buildScoreBins(
    totalLeads: number,
    avgScore: number,
    seed: string
): ScoreBin[] {
    const bins: Array<{ label: string; min: number; max: number }> = [
        { label: "0–20", min: 0, max: 20 },
        { label: "21–40", min: 21, max: 40 },
        { label: "41–60", min: 41, max: 60 },
        { label: "61–80", min: 61, max: 80 },
        { label: "81–100", min: 81, max: 100 },
    ];

    const u = hashToUnit(seed + "_score");
    const center = clampInt(avgScore || 55, 10, 95);

    // Weight by distance from center (simple bell-ish curve)
    const weights = bins.map((b) => {
        const mid = (b.min + b.max) / 2;
        const dist = Math.abs(mid - center);
        const w = 1 / (1 + dist / 18); // closer => bigger
        return w;
    });

    // Add a bit of deterministic skew
    weights[0] *= 0.92 + u * 0.1;
    weights[4] *= 0.92 + (1 - u) * 0.1;

    const sumW = weights.reduce((a, b) => a + b, 0) || 1;
    const rawCounts = weights.map((w) =>
        Math.max(0, Math.floor((w / sumW) * totalLeads))
    );

    // Fix rounding to totalLeads
    let allocated = rawCounts.reduce((a, b) => a + b, 0);
    let remaining = Math.max(0, totalLeads - allocated);

    // Distribute remaining to bins closest to center
    const order = bins
        .map((b, i) => ({ i, mid: (b.min + b.max) / 2 }))
        .sort((a, b) => Math.abs(a.mid - center) - Math.abs(b.mid - center))
        .map((x) => x.i);

    let idx = 0;
    while (remaining > 0) {
        rawCounts[order[idx % order.length]] += 1;
        remaining -= 1;
        idx += 1;
    }

    const finalAllocated = rawCounts.reduce((a, b) => a + b, 0) || 1;

    return bins.map((b, i) => ({
        label: b.label,
        min: b.min,
        max: b.max,
        count: rawCounts[i],
        percent: pct(rawCounts[i], finalAllocated),
    }));
}

function buildInsights(args: {
    stages: FunnelStage[];
    dropOff: DropOffRow[];
    avgLeadScore: number;
    avgFollowUpHours: number;
}) {
    const { stages, dropOff, avgLeadScore, avgFollowUpHours } = args;

    const biggestDrop = dropOff
        .slice()
        .sort((a, b) => b.dropRate - a.dropRate)[0];
    const smallestStage = stages.slice().sort((a, b) => a.value - b.value)[0];

    const insights: string[] = [];

    if (biggestDrop) {
        insights.push(
            `Largest drop-off is from ${biggestDrop.fromLabel} → ${biggestDrop.toLabel} (${biggestDrop.dropRate.toFixed(
                1
            )}%).`
        );
    }

    if (avgFollowUpHours) {
        insights.push(
            `Average follow-up time is ${avgFollowUpHours.toFixed(
                1
            )} hours — faster follow-ups usually improve Contacted and Engaged rates.`
        );
    }

    if (Number.isFinite(avgLeadScore)) {
        insights.push(
            `Average lead score is ${avgLeadScore.toFixed(
                1
            )}. Use score bands to prioritize high-intent leads first.`
        );
    }

    if (smallestStage) {
        insights.push(
            `Smallest stage is ${smallestStage.label} — focus actions on increasing progression into this stage.`
        );
    }

    insights.push(
        "For mockup: stage counts are estimated from available KPIs; later we’ll compute stages from actual lead events and scoring rules."
    );

    return insights;
}
