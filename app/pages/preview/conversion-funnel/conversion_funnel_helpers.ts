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
 * Used only for mock lead-score bin distribution.
 */
function hashToUnit(seed: string) {
    let h = 2166136261;
    for (let i = 0; i < seed.length; i++) {
        h ^= seed.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return (h >>> 0) / 4294967295; // 0..1
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
    // Prefer funnel counts (Option B). Fallback safely if missing.
    const capturedLeads = safeNumber(
        report?.funnel?.new,
        safeNumber(report?.executiveSummary?.totalLeads)
    );
    const engagedLeads = safeNumber(report?.funnel?.engaged);
    const qualifiedLeads = safeNumber(report?.funnel?.qualified);
    const convertedLeads = safeNumber(
        report?.funnel?.converted,
        safeNumber(report?.executiveSummary?.convertedLeads)
    );

    const conversionRateFromSummary = safeNumber(
        report?.executiveSummary?.conversionRate
    );
    const avgLeadScore = safeNumber(report?.executiveSummary?.avgLeadScore);
    const avgFollowUpHours = safeNumber(
        report?.executiveSummary?.avgFollowUpTime
    );

    // Contacted stage: still derived (we don't store contacted in funnel)
    const contactedBase =
        avgFollowUpHours <= 24 ? 0.82 : avgFollowUpHours <= 48 ? 0.76 : 0.68;

    let contacted = clampInt(capturedLeads * contactedBase, 0, capturedLeads);

    // Enforce monotonic consistency:
    let converted = clampInt(convertedLeads, 0, capturedLeads);
    let qualified = clampInt(qualifiedLeads, 0, capturedLeads);
    let engaged = clampInt(engagedLeads, 0, capturedLeads);

    if (qualified < converted) qualified = converted;
    if (engaged < qualified) engaged = qualified;

    // contacted must sit between captured and engaged
    if (contacted < engaged) contacted = engaged;
    if (contacted > capturedLeads) contacted = capturedLeads;

    const stages: FunnelStage[] = [
        {
            key: "captured",
            label: stageLabel("captured"),
            value: capturedLeads,
        },
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

    const seed = String(report?.id ?? report?.name ?? "seed");
    const scoreBins = buildScoreBins(capturedLeads, avgLeadScore, seed);

    const contactedRate = pct(contacted, capturedLeads);
    const engagedRate = pct(engaged, capturedLeads);
    const qualifiedRate = pct(qualified, capturedLeads);

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
            totalLeads: capturedLeads,
            convertedLeads: converted,
            conversionRate: Number.isFinite(conversionRateFromSummary)
                ? conversionRateFromSummary
                : pct(converted, capturedLeads),
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

    const weights = bins.map((b) => {
        const mid = (b.min + b.max) / 2;
        const dist = Math.abs(mid - center);
        return 1 / (1 + dist / 18);
    });

    // deterministic skew
    weights[0] *= 0.92 + u * 0.1;
    weights[4] *= 0.92 + (1 - u) * 0.1;

    const sumW = weights.reduce((a, b) => a + b, 0) || 1;
    const rawCounts = weights.map((w) =>
        Math.max(0, Math.floor((w / sumW) * totalLeads))
    );

    let allocated = rawCounts.reduce((a, b) => a + b, 0);
    let remaining = Math.max(0, totalLeads - allocated);

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
        "For mockup: Captured/Engaged/Qualified/Converted counts come from report.funnel. Contacted is derived using follow-up speed. Later this page will compute all stages from real engagement events and scoring rules."
    );

    return insights;
}
