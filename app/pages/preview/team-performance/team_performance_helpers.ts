import type { GeneratedReport } from "../../../types/reports";

export type AgentRowUi = {
    agent: string;
    leads: number;
    converted: number;
    conversionRate: number; // percent
    avgLeadScore: number;
    rankScore: number; // mock composite score for ranking
};

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

function computeRankScore(
    leads: number,
    conversionRate: number,
    avgLeadScore: number
) {
    // Simple weighted score (mock, but stable):
    // - conversion rate matters most
    // - lead score as quality
    // - leads as volume
    return (
        conversionRate * 0.55 +
        avgLeadScore * 0.3 +
        Math.log10(Math.max(1, leads)) * 10 * 0.15
    );
}

export function buildAgentRows(report: GeneratedReport): AgentRowUi[] {
    const agents = report.agents ?? [];

    const rows = agents.map((a) => {
        const leads = safeNumber(a.leads);
        const converted = safeNumber(a.converted);
        const conversionRate = safeNumber(a.conversionRate);
        const avgLeadScore = safeNumber(a.avgLeadScore);

        return {
            agent: String(a.agent),
            leads,
            converted,
            conversionRate,
            avgLeadScore,
            rankScore: computeRankScore(leads, conversionRate, avgLeadScore),
        };
    });

    return rows.sort((x, y) => y.rankScore - x.rankScore);
}

export function buildTeamStats(rows: AgentRowUi[]) {
    const totalLeads = rows.reduce((s, r) => s + r.leads, 0);
    const totalConverted = rows.reduce((s, r) => s + r.converted, 0);
    const avgConversionRate =
        totalLeads > 0 ? pct(totalConverted, totalLeads) : 0;

    const avgLeadScore =
        rows.length > 0
            ? rows.reduce((s, r) => s + r.avgLeadScore, 0) / rows.length
            : 0;

    const topPerformer = rows[0]?.agent ?? "—";
    const bottomPerformer = rows[rows.length - 1]?.agent ?? "—";

    return {
        totalLeads,
        totalConverted,
        avgConversionRate,
        avgLeadScore,
        topPerformer,
        bottomPerformer,
    };
}
