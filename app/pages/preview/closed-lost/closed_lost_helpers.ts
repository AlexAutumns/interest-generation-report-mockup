import type { GeneratedReport } from "../../../types/reports";

export type LostReasonRowUi = {
    reason: string;
    count: number;
    percent: number; // of lost leads
};

export type LostReasonBarMode = "count" | "percent";

export function safeNumber(n: unknown, fallback = 0) {
    const v = Number(n);
    return Number.isFinite(v) ? v : fallback;
}

export function pct(numerator: number, denominator: number) {
    if (!denominator) return 0;
    return (numerator / denominator) * 100;
}

export function buildLostReasonRows(
    report: GeneratedReport
): LostReasonRowUi[] {
    const lostLeads = safeNumber(report.kpis?.lostLeads);

    const rows = (report.kpis?.lostReasons ?? []).map((r) => {
        const count = safeNumber(r.count);
        return {
            reason: String(r.reason ?? "Unknown"),
            count,
            percent: lostLeads > 0 ? pct(count, lostLeads) : 0,
        };
    });

    return rows.sort((a, b) => b.count - a.count);
}

export function getTopLostReasonLabel(report: GeneratedReport) {
    const rows = buildLostReasonRows(report);
    return rows[0]?.reason ?? "—";
}

export function buildLostReasonPie(rows: LostReasonRowUi[], topN = 5) {
    const main = rows.slice(0, topN);
    const rest = rows.slice(topN);

    const restCount = rest.reduce((sum, r) => sum + r.count, 0);

    const out = [...main.map((r) => ({ name: r.reason, value: r.count }))];
    if (restCount > 0) out.push({ name: "Other", value: restCount });

    return out;
}

export function sumTopN(rows: LostReasonRowUi[], n: number) {
    return rows.slice(0, n).reduce((sum, r) => sum + r.count, 0);
}

export function buildLostReasonStats(report: GeneratedReport) {
    const lostLeads = safeNumber(report.kpis?.lostLeads);
    const totalLeads = safeNumber(report.executiveSummary?.totalLeads);
    const lossRate = totalLeads > 0 ? pct(lostLeads, totalLeads) : 0;

    const rows = buildLostReasonRows(report);
    const distinctReasons = rows.length;

    const topReason = rows[0]?.reason ?? "—";
    const topReasonCount = rows[0]?.count ?? 0;
    const topReasonShare = lostLeads > 0 ? pct(topReasonCount, lostLeads) : 0;

    const top3Count = sumTopN(rows, 3);
    const top3Share = lostLeads > 0 ? pct(top3Count, lostLeads) : 0;

    let concentrationLabel = "Balanced";
    let concentrationDescription =
        "Loss reasons are reasonably spread out across categories.";

    if (top3Share >= 65) {
        concentrationLabel = "Highly concentrated";
        concentrationDescription =
            "A few reasons dominate the losses — fixing the top drivers could yield quick gains.";
    } else if (top3Share <= 40) {
        concentrationLabel = "Highly distributed";
        concentrationDescription =
            "Loss reasons are spread across many categories — improvements may require multiple smaller fixes.";
    }

    return {
        lostLeads,
        totalLeads,
        lossRate,
        rows,
        distinctReasons,
        topReason,
        topReasonShare,
        top3Share,
        concentrationLabel,
        concentrationDescription,
    };
}
