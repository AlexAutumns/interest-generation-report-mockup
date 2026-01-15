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
    // Captured should represent *all* leads in the report period.
    //
    // IMPORTANT:
    // We support 2 shapes of report.funnel data:
    // 1) Legacy mock reports: funnel.* are already cumulative stage counts
    //    (new=captured, engaged<=new, qualified<=engaged, converted<=qualified)
    // 2) Generated reports (older generator behavior): funnel.* are status buckets
    //    (New/Engaged/Qualified/Converted/Lost) and are NOT cumulative.
    //
    // This helper detects which shape it is and normalizes into cumulative stage
    // counts so the funnel + drop-off chart always make sense.

    const totalLeadsFromSummary = safeNumber(
        report?.executiveSummary?.totalLeads
    );

    // Raw funnel values (may be cumulative OR buckets depending on report source)
    const funnelNew = safeNumber(report?.funnel?.new);
    const funnelEngaged = safeNumber(report?.funnel?.engaged);
    const funnelQualified = safeNumber(report?.funnel?.qualified);
    const funnelConverted = safeNumber(report?.funnel?.converted);

    // If the values are monotonic decreasing, it's *probably* already cumulative.
    const funnelLooksCumulative =
        funnelNew > 0 &&
        funnelEngaged <= funnelNew &&
        funnelQualified <= funnelEngaged &&
        funnelConverted <= funnelQualified;

    // Captured = total leads
    // - If funnel is cumulative, use funnel.new (fallback to executive summary total)
    // - If funnel is buckets, use executive summary total (fallback to funnel.new)
    const capturedLeads = funnelLooksCumulative
        ? safeNumber(funnelNew, totalLeadsFromSummary)
        : safeNumber(totalLeadsFromSummary, funnelNew);

    // Prefer executiveSummary.convertedLeads because it's computed from conversion flag/status
    const convertedFromSummary = safeNumber(
        report?.executiveSummary?.convertedLeads
    );

    // Normalize into cumulative stages:
    // - If cumulative: use funnel values directly
    // - If buckets: build cumulative by adding downstream stages
    let convertedLeads = funnelLooksCumulative
        ? safeNumber(funnelConverted, convertedFromSummary)
        : safeNumber(convertedFromSummary, funnelConverted);

    let qualifiedLeads = funnelLooksCumulative
        ? safeNumber(funnelQualified)
        : safeNumber(funnelQualified + convertedLeads);

    let engagedLeads = funnelLooksCumulative
        ? safeNumber(funnelEngaged)
        : safeNumber(funnelEngaged + qualifiedLeads);

    // Clamp to captured for sanity (prevents charts from going above total leads)
    convertedLeads = clampInt(convertedLeads, 0, capturedLeads);
    qualifiedLeads = clampInt(qualifiedLeads, 0, capturedLeads);
    engagedLeads = clampInt(engagedLeads, 0, capturedLeads);

    const conversionRateFromSummary = safeNumber(
        report?.executiveSummary?.conversionRate
    );
    const avgLeadScore = safeNumber(report?.executiveSummary?.avgLeadScore);
    const avgFollowUpHours = safeNumber(
        report?.executiveSummary?.avgFollowUpTime
    );

    // Contacted stage:
    // Prefer the value stored in the report (generator-calculated).
    // Fallback to the old heuristic only for older reports that don't have funnel.contacted yet.
    const hasContactedField =
        report?.funnel &&
        Object.prototype.hasOwnProperty.call(report.funnel, "contacted");

    const contactedFromReport = safeNumber(report?.funnel?.contacted, 0);

    let contacted: number;

    if (hasContactedField) {
        contacted = clampInt(contactedFromReport, 0, capturedLeads);
    } else {
        // Backwards-compatible fallback: keep behavior for old reports.
        const contactedBase =
            avgFollowUpHours <= 24
                ? 0.82
                : avgFollowUpHours <= 48
                  ? 0.76
                  : 0.68;

        contacted = clampInt(capturedLeads * contactedBase, 0, capturedLeads);
    }

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
    const scoreBins =
        Array.isArray(report?.leadScoreBins) && report.leadScoreBins.length > 0
            ? report.leadScoreBins
            : buildScoreBins(capturedLeads, avgLeadScore, seed);

    const contactedRate = pct(contacted, capturedLeads);
    const engagedRate = pct(engaged, capturedLeads);
    const qualifiedRate = pct(qualified, capturedLeads);

    const insights = buildInsights({
        stages,
        dropOff,
        scoreBins,
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
    scoreBins: ScoreBin[];
    avgLeadScore: number;
    avgFollowUpHours: number;
}) {
    const { stages, dropOff, scoreBins, avgLeadScore, avgFollowUpHours } = args;

    const insights: string[] = [];

    // ----------------------------
    // Funnel-based insights
    // ----------------------------
    const biggestDropByRate = dropOff
        .slice()
        .sort((a, b) => b.dropRate - a.dropRate)[0];

    const biggestDropByCount = dropOff
        .slice()
        .sort((a, b) => b.dropCount - a.dropCount)[0];

    const smallestStage = stages.slice().sort((a, b) => a.value - b.value)[0];

    if (biggestDropByRate) {
        insights.push(
            `Largest drop-off rate is ${biggestDropByRate.fromLabel} → ${biggestDropByRate.toLabel} (${biggestDropByRate.dropRate.toFixed(
                1
            )}%).`
        );
    }

    // If drop-by-count tells a different story, it’s often more operationally useful.
    if (
        biggestDropByCount &&
        biggestDropByRate &&
        biggestDropByCount.fromLabel !== biggestDropByRate.fromLabel
    ) {
        insights.push(
            `Largest drop-off by volume is ${biggestDropByCount.fromLabel} → ${biggestDropByCount.toLabel} (${biggestDropByCount.dropCount} leads).`
        );
    }

    if (smallestStage) {
        insights.push(
            `Smallest stage is ${smallestStage.label} — focus actions that move leads into this stage.`
        );
    }

    // ----------------------------
    // Follow-up / speed insight
    // ----------------------------
    if (Number.isFinite(avgFollowUpHours) && avgFollowUpHours > 0) {
        const speedHint =
            avgFollowUpHours <= 24
                ? "This is within a strong response window."
                : avgFollowUpHours <= 48
                  ? "Consider pushing this closer to < 24 hours to improve engagement."
                  : "This is slow — tightening follow-up SLAs will likely improve progression.";

        insights.push(
            `Average follow-up time is ${avgFollowUpHours.toFixed(
                1
            )} hours. ${speedHint}`
        );
    }

    // ----------------------------
    // Score distribution insights (real bins)
    // ----------------------------
    const totalFromBins =
        scoreBins?.reduce(
            (sum, b) => sum + (Number.isFinite(b.count) ? b.count : 0),
            0
        ) || 0;

    // Fallback: use captured leads if bins are missing/empty.
    const captured = stages.find((s) => s.key === "captured")?.value ?? 0;
    const total = totalFromBins > 0 ? totalFromBins : captured;

    // Define intent bands by numeric ranges rather than labels (more robust).
    const lowIntentCount = scoreBins
        .filter((b) => b.max <= 40)
        .reduce((sum, b) => sum + b.count, 0);

    const highIntentCount = scoreBins
        .filter((b) => b.min >= 61)
        .reduce((sum, b) => sum + b.count, 0);

    const midIntentCount = Math.max(
        0,
        total - lowIntentCount - highIntentCount
    );

    const lowIntentPct = pct(lowIntentCount, total);
    const highIntentPct = pct(highIntentCount, total);

    if (total > 0) {
        insights.push(
            `${highIntentPct.toFixed(1)}% (${highIntentCount}) of leads are high-intent (61–100). Prioritize these for fastest follow-up and personalized outreach.`
        );

        insights.push(
            `${lowIntentPct.toFixed(1)}% (${lowIntentCount}) of leads are low-intent (0–40). Consider improving targeting, lead capture quality, or early-stage nurture content.`
        );

        // A small extra insight that helps interpretation:
        if (lowIntentCount > highIntentCount * 2) {
            insights.push(
                `Low-intent leads significantly outweigh high-intent leads — review campaigns/channels to reduce unqualified inflow and protect team follow-up capacity.`
            );
        } else if (highIntentCount >= midIntentCount && highIntentCount > 0) {
            insights.push(
                `High-intent leads form a large share of the pipeline — conversion should improve if follow-ups stay fast and consistent.`
            );
        }
    }

    // ----------------------------
    // Avg score quick context
    // ----------------------------
    if (Number.isFinite(avgLeadScore)) {
        insights.push(
            `Average lead score is ${avgLeadScore.toFixed(
                1
            )}. Use score bands to sequence work: high-intent first, then mid-intent nurture, then re-qualification for low-intent.`
        );
    }

    // Keep this note accurate for the current mockup state.
    insights.push(
        "For mockup: Captured uses executiveSummary.totalLeads. Engaged/Qualified/Converted are derived as cumulative stages from report funnel data. Contacted is still estimated using follow-up speed. Later, this page should compute Contacted/Engaged from real engagement events."
    );

    return insights;
}
