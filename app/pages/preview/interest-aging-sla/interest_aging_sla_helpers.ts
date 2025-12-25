import type { GeneratedReport } from "../../../types/reports";

export function safeNumber(n: unknown, fallback = 0) {
    const v = Number(n);
    return Number.isFinite(v) ? v : fallback;
}

export function pct(numerator: number, denominator: number) {
    if (!denominator) return 0;
    return (numerator / denominator) * 100;
}

function hashSeed(input: string) {
    let h = 2166136261;
    for (let i = 0; i < input.length; i++) {
        h ^= input.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return Math.abs(h);
}

function seededRand(seed: number) {
    let s = seed % 2147483647;
    if (s <= 0) s += 2147483646;
    return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

export type AgingBucketKey =
    | "0-1d"
    | "2-3d"
    | "4-7d"
    | "8-14d"
    | "15-30d"
    | "31d+";

export type AgingRow = {
    bucket: AgingBucketKey;
    label: string;
    count: number;
    percent: number;
};

export type SlaPolicy = {
    slaHoursTarget: number; // e.g., 24h
};

export function buildSlaPolicy(): SlaPolicy {
    return { slaHoursTarget: 24 };
}

export function buildAgingDistribution(report: GeneratedReport): AgingRow[] {
    const totalLeads = safeNumber(report.executiveSummary?.totalLeads);
    const lostLeads = safeNumber(report.kpis?.lostLeads);
    const convertedLeads = safeNumber(report.executiveSummary?.convertedLeads);

    // "Active" leads are the ones still open-ish (rough mock)
    const activeLeads = Math.max(0, totalLeads - lostLeads - convertedLeads);

    const seed = hashSeed(report.id + report.periodLabel);
    const rnd = seededRand(seed);

    const buckets: Array<{ key: AgingBucketKey; label: string; w: number }> = [
        { key: "0-1d", label: "0–1 day", w: 0.22 + rnd() * 0.06 },
        { key: "2-3d", label: "2–3 days", w: 0.2 + rnd() * 0.06 },
        { key: "4-7d", label: "4–7 days", w: 0.18 + rnd() * 0.06 },
        { key: "8-14d", label: "8–14 days", w: 0.16 + rnd() * 0.05 },
        { key: "15-30d", label: "15–30 days", w: 0.14 + rnd() * 0.05 },
        { key: "31d+", label: "31+ days", w: 0.1 + rnd() * 0.04 },
    ];

    const wSum = buckets.reduce((s, b) => s + b.w, 0);

    let remaining = activeLeads;
    const counts = buckets.map((b, idx) => {
        if (idx === buckets.length - 1) return remaining;
        const c = Math.round((activeLeads * b.w) / wSum);
        remaining = Math.max(0, remaining - c);
        return c;
    });

    const rows: AgingRow[] = buckets.map((b, i) => ({
        bucket: b.key,
        label: b.label,
        count: counts[i],
        percent: activeLeads > 0 ? pct(counts[i], activeLeads) : 0,
    }));

    return rows;
}

export function buildSlaStats(report: GeneratedReport) {
    const policy = buildSlaPolicy();

    const totalLeads = safeNumber(report.executiveSummary?.totalLeads);
    const slaBreachCount = safeNumber(report.kpis?.slaBreachCount);

    // Mock: estimate "follow-ups due" as a fraction of total leads
    const followUpsDue = Math.max(1, Math.round(totalLeads * 0.35));
    const slaCompliant = Math.max(0, followUpsDue - slaBreachCount);
    const complianceRate = pct(slaCompliant, followUpsDue);

    // Mock: avg follow-up time from executive summary (already exists)
    const avgFollowUpTime = safeNumber(
        report.executiveSummary?.avgFollowUpTime
    );

    return {
        policy,
        followUpsDue,
        slaBreachCount,
        slaCompliant,
        complianceRate,
        avgFollowUpTime,
    };
}
