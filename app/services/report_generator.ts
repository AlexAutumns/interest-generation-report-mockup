// app/services/report_generator.ts
import type { GenerateReportFormValues } from "../pages/generate-report/generate_report_schema";
import type {
    GeneratedReport,
    ReportSummary,
    ReportType,
    ReportStatus,
    ChannelPerformanceRow,
    CampaignPerformanceRow,
    RegionPerformanceRow,
    AgentPerformanceRow,
    LostReasonRow,
    LeadScoreBin,
} from "../types/reports";

import type { LeadRow } from "../types/leads";
import { leadsRepository } from "./leads_repository";

export type GenerateReportResult = {
    report: GeneratedReport;
    summary: ReportSummary;
};

function pct(n: number, d: number): number {
    if (!d || d <= 0) return 0;
    return (n / d) * 100;
}

function sum(nums: number[]): number {
    return nums.reduce((a, b) => a + b, 0);
}

function avg(nums: number[]): number {
    if (!nums.length) return 0;
    return sum(nums) / nums.length;
}

function buildLeadScoreBins(
    scores: Array<number | null | undefined>
): LeadScoreBin[] {
    // We clamp scores to 0–100 because leadScore can be missing or out of range in mock data.
    const cleaned = scores
        .map((s) => (typeof s === "number" && Number.isFinite(s) ? s : 0))
        .map((s) => Math.max(0, Math.min(100, Math.round(s))));

    const total = cleaned.length || 1;

    const bins: Array<{ label: string; min: number; max: number }> = [
        { label: "0–20", min: 0, max: 20 },
        { label: "21–40", min: 21, max: 40 },
        { label: "41–60", min: 41, max: 60 },
        { label: "61–80", min: 61, max: 80 },
        { label: "81–100", min: 81, max: 100 },
    ];

    const counts = bins.map((b) => {
        const c = cleaned.filter((v) => v >= b.min && v <= b.max).length;
        return c;
    });

    return bins.map((b, i) => ({
        label: b.label,
        min: b.min,
        max: b.max,
        count: counts[i],
        percent: pct(counts[i], total),
    }));
}

function buildReportId(): string {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const rand = Math.floor(Math.random() * 900 + 100);
    return `RPT-${yyyy}${mm}${dd}-${rand}`;
}

/** Normalize status labels to your report funnel buckets */
function normalizeStatus(
    s: string | undefined
): "New" | "Engaged" | "Qualified" | "Converted" | "Lost" | "Other" {
    const v = (s ?? "").trim().toLowerCase();
    if (!v) return "Other";
    if (v === "new") return "New";
    if (v === "engaged") return "Engaged";
    if (v === "qualified") return "Qualified";
    if (v === "converted" || v === "won") return "Converted";
    if (v === "lost" || v === "closed-lost" || v === "closed lost")
        return "Lost";
    return "Other";
}

function isConvertedLead(l: LeadRow): boolean {
    // supports either numeric conversion or status label
    const byConversion = (l.conversion ?? 0) > 0;
    const byStatus = normalizeStatus(l.status) === "Converted";
    return byConversion || byStatus;
}

function isoDateOnly(d: Date): string {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

function parseDateOnly(iso: string): Date {
    // Interpret YYYY-MM-DD safely
    return new Date(`${iso}T00:00:00`);
}

function isBetweenInclusive(
    dateIso: string,
    startIso: string,
    endIso: string
): boolean {
    const t = parseDateOnly(dateIso).getTime();
    const a = parseDateOnly(startIso).getTime();
    const b = parseDateOnly(endIso).getTime();
    return t >= a && t <= b;
}

function getIsoWeekNumber(d: Date): number {
    // ISO week number
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    return Math.ceil(
        ((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
    );
}

function buildPeriodRangeFromSettings(s: GenerateReportFormValues): {
    periodStart: string;
    periodEnd: string;
    periodLabel: string;
    type: ReportType;
} {
    if (s.reportType === "weekly") {
        const start = (s.weekStart ?? "").trim() || isoDateOnly(new Date());
        const end = (s.weekEnd ?? "").trim() || start;

        const wk = getIsoWeekNumber(parseDateOnly(start));
        const yy = parseDateOnly(start).getFullYear();

        return {
            type: "weekly",
            periodStart: start,
            periodEnd: end,
            periodLabel: `Week ${wk} ${yy}`,
        };
    }

    if (s.reportType === "monthly") {
        const raw = (s.month ?? "").trim(); // "YYYY-MM"
        if (!raw || !raw.includes("-")) {
            const now = new Date();
            const startD = new Date(now.getFullYear(), now.getMonth(), 1);
            const endD = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            return {
                type: "monthly",
                periodStart: isoDateOnly(startD),
                periodEnd: isoDateOnly(endD),
                periodLabel: startD.toLocaleDateString(undefined, {
                    month: "long",
                    year: "numeric",
                }),
            };
        }

        const [yyStr, mmStr] = raw.split("-");
        const yy = Number(yyStr);
        const mm = Number(mmStr) - 1;

        const startD = new Date(yy, mm, 1);
        const endD = new Date(yy, mm + 1, 0);

        return {
            type: "monthly",
            periodStart: isoDateOnly(startD),
            periodEnd: isoDateOnly(endD),
            periodLabel: startD.toLocaleDateString(undefined, {
                month: "long",
                year: "numeric",
            }),
        };
    }

    // quarterly
    const year = s.year ?? new Date().getFullYear();
    const quarter = s.quarter ?? "Q1";
    const qNum =
        quarter === "Q1" ? 1 : quarter === "Q2" ? 2 : quarter === "Q3" ? 3 : 4;

    const startMonth = (qNum - 1) * 3;
    const startD = new Date(year, startMonth, 1);
    const endD = new Date(year, startMonth + 3, 0);

    return {
        type: "quarterly",
        periodStart: isoDateOnly(startD),
        periodEnd: isoDateOnly(endD),
        periodLabel: `${quarter} ${year}`,
    };
}

function buildDefaultReportName(type: ReportType, periodLabel: string): string {
    if (type === "weekly") return `Weekly Interest Report – ${periodLabel}`;
    if (type === "monthly") return `Monthly Interest Report – ${periodLabel}`;
    return `Quarterly Interest Report – ${periodLabel}`;
}

function pickReportName(
    settings: GenerateReportFormValues,
    type: ReportType,
    periodLabel: string
): string {
    const custom = (settings.customName ?? "").trim();
    if (custom.length > 0) return custom;
    return buildDefaultReportName(type, periodLabel);
}

function shouldApplyFiltersToPreview(
    settings: GenerateReportFormValues
): boolean {
    if (settings.scopeMode !== "filtered") return false;
    return (
        settings.applyFiltersTo === "both" ||
        settings.applyFiltersTo === "preview_only"
    );
}

function applyPreviewFilters(
    leads: LeadRow[],
    settings: GenerateReportFormValues
): LeadRow[] {
    if (!shouldApplyFiltersToPreview(settings)) return leads;

    const agents = settings.agents ?? [];
    const statuses = settings.statuses ?? [];
    const channels = settings.channels ?? [];
    const regions = settings.regions ?? [];
    const campaigns = settings.campaigns ?? [];

    const match = (v: string, arr: string[]) =>
        arr.length === 0 ? true : arr.includes(v);

    return leads.filter((l) => {
        return (
            match(l.agent, agents) &&
            match(l.status, statuses) &&
            match(l.channel, channels) &&
            match(l.region, regions) &&
            match(l.campaign, campaigns)
        );
    });
}

function groupBy<T>(rows: T[], keyFn: (r: T) => string): Map<string, T[]> {
    const m = new Map<string, T[]>();
    for (const r of rows) {
        const k = (keyFn(r) || "—").trim() || "—";
        const arr = m.get(k) ?? [];
        arr.push(r);
        m.set(k, arr);
    }
    return m;
}

function topKeyByCount(items: string[]): string {
    if (!items.length) return "—";
    const m = new Map<string, number>();
    for (const x of items) m.set(x, (m.get(x) ?? 0) + 1);
    let best = "—";
    let bestN = -1;
    for (const [k, v] of m.entries()) {
        if (v > bestN) {
            best = k;
            bestN = v;
        }
    }
    return best;
}

function buildSummaryFromReport(r: GeneratedReport): ReportSummary {
    return {
        id: r.id,
        name: r.name,
        type: r.type,

        periodLabel: r.periodLabel,
        periodStart: r.periodStart,
        periodEnd: r.periodEnd,

        generatedOn: r.generatedOn,
        generatedBy: r.generatedBy,
        status: r.status,

        metricsPreview: {
            totalLeads: r.executiveSummary.totalLeads,
            convertedLeads: r.executiveSummary.convertedLeads,
            conversionRate: r.executiveSummary.conversionRate,
            topChannel: r.executiveSummary.topChannel,
        },
    };
}

export function generateReportFromLeads(
    settings: GenerateReportFormValues,
    allLeads: LeadRow[],
    opts?: { generatedBy?: string; status?: ReportStatus }
): GenerateReportResult {
    const { periodStart, periodEnd, periodLabel, type } =
        buildPeriodRangeFromSettings(settings);

    // 1) Period filter (bucket by createdAt)
    const inPeriod = allLeads.filter((l) =>
        isBetweenInclusive(l.createdAt, periodStart, periodEnd)
    );

    // 2) Optional advanced filters (preview)
    const scoped = applyPreviewFilters(inPeriod, settings);

    // Core numbers
    const totalLeads = scoped.length;
    const convertedLeads = scoped.filter(isConvertedLead).length;
    const conversionRate = pct(convertedLeads, totalLeads);

    const avgLeadScore = avg(scoped.map((l) => l.leadScore ?? 0));
    // Real score distribution from the same scoped dataset used for the report.
    const leadScoreBins = buildLeadScoreBins(scoped.map((l) => l.leadScore));
    const avgFollowUpTime = avg(scoped.map((l) => l.avgFollowUpTime ?? 0));

    const topChannel = topKeyByCount(scoped.map((l) => l.channel));
    const topRegion = topKeyByCount(scoped.map((l) => l.region));

    // Funnel + KPI buckets
    //
    // NOTE ON SEMANTICS (important for the UI):
    // - KPI counts are "status buckets" (how many leads are currently New/Engaged/etc.)
    // - Funnel counts are "cumulative stages" (Captured >= Engaged >= Qualified >= Converted)
    //
    // This avoids the earlier bug where funnel.new was treated like total leads
    // but the generator only stored "New status count" there.
    const statusBuckets = scoped.map((l) => normalizeStatus(l.status));

    // Status buckets (used by the KPI section)
    const statusNew = statusBuckets.filter((s) => s === "New").length;
    const statusEngaged = statusBuckets.filter((s) => s === "Engaged").length;
    const statusQualified = statusBuckets.filter(
        (s) => s === "Qualified"
    ).length;
    const statusConverted = statusBuckets.filter(
        (s) => s === "Converted"
    ).length;
    const statusLost = statusBuckets.filter((s) => s === "Lost").length;

    // KPIs section expects these exact keys (bucket counts)
    const newLeads = statusNew;
    const engagedLeads = statusEngaged;
    const qualifiedLeads = statusQualified;
    const lostLeads = statusLost;

    // Funnel cumulative stages:
    // Captured is ALWAYS the total leads in the selected period (after filters).
    //
    // For the other stages, we interpret status as a stage progression:
    // Engaged-or-above = Engaged + Qualified + Converted
    // Qualified-or-above = Qualified + Converted
    // Converted = Converted
    //
    // If your org later defines funnel stages differently (e.g., Contacted derived from activity logs),
    // we can swap these formulas without breaking the report shape.
    const funnelCaptured = totalLeads;
    const funnelConvertedStage = statusConverted; // keep funnel stage consistent with status for now
    const funnelQualifiedStage = statusQualified + funnelConvertedStage;
    const funnelEngagedStage = statusEngaged + funnelQualifiedStage;

    // Contacted stage (stored in report so UI doesn't have to "guess").
    //
    // For now, we use a simple heuristic based on average follow-up speed:
    // - faster follow-up generally means more leads get contacted early.
    // This is still a mockup approximation until we have real engagement events.
    //
    // IMPORTANT: contacted must never be below Engaged (monotonic funnel).
    const contactedBase =
        avgFollowUpTime <= 24 ? 0.82 : avgFollowUpTime <= 48 ? 0.76 : 0.68;

    // Estimated contacted count based on follow-up speed
    let funnelContacted = Math.round(funnelCaptured * contactedBase);

    // Clamp within 0..captured
    funnelContacted = Math.max(0, Math.min(funnelCaptured, funnelContacted));

    // Ensure monotonic: Contacted should be at least Engaged
    if (funnelContacted < funnelEngagedStage) {
        funnelContacted = funnelEngagedStage;
    }

    // Lost is tracked separately (not part of the main monotonic funnel path)
    const funnelLost = statusLost;

    const slaBreachCount = scoped.filter(
        (l) => (l.slaBreached ?? 0) > 0
    ).length;

    const lostReasonsMap = new Map<string, number>();
    for (const l of scoped) {
        if (normalizeStatus(l.status) !== "Lost") continue;
        const reason = (l.lostReason ?? "").trim() || "Unspecified";
        lostReasonsMap.set(reason, (lostReasonsMap.get(reason) ?? 0) + 1);
    }
    const lostReasons: LostReasonRow[] = [...lostReasonsMap.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([reason, count]) => ({ reason, count }));

    // Channels table
    const byChannel = groupBy(scoped, (l) => l.channel);
    const channels: ChannelPerformanceRow[] = [...byChannel.entries()]
        .map(([channel, rows]) => {
            const leads = rows.length;
            const converted = rows.filter(isConvertedLead).length;
            const revenueUsd = sum(rows.map((r) => r.revenueUsd ?? 0));
            const costUsd = sum(rows.map((r) => r.costUsd ?? 0));
            return {
                channel,
                leads,
                converted,
                conversionRate: pct(converted, leads),
                revenueUsd,
                costUsd,
            };
        })
        .sort((a, b) => b.leads - a.leads);

    // Campaigns (optional field in report)
    const byCampaign = groupBy(scoped, (l) => l.campaign);
    const campaigns: CampaignPerformanceRow[] = [...byCampaign.entries()]
        .map(([campaign, rows]) => {
            const leads = rows.length;
            const converted = rows.filter(isConvertedLead).length;
            const revenueUsd = sum(rows.map((r) => r.revenueUsd ?? 0));
            const costUsd = sum(rows.map((r) => r.costUsd ?? 0));
            return {
                campaign,
                leads,
                converted,
                conversionRate: pct(converted, leads),
                revenueUsd,
                costUsd,
            };
        })
        .sort((a, b) => b.leads - a.leads);

    // Regions (optional field in report)
    const byRegion = groupBy(scoped, (l) => l.region);
    const regions: RegionPerformanceRow[] = [...byRegion.entries()]
        .map(([region, rows]) => {
            const leads = rows.length;
            const converted = rows.filter(isConvertedLead).length;
            return {
                region,
                leads,
                converted,
                conversionRate: pct(converted, leads),
            };
        })
        .sort((a, b) => b.leads - a.leads);

    // Agents (optional field in report)
    const byAgent = groupBy(scoped, (l) => l.agent);
    const agents: AgentPerformanceRow[] = [...byAgent.entries()]
        .map(([agent, rows]) => {
            const leads = rows.length;
            const converted = rows.filter(isConvertedLead).length;
            return {
                agent,
                leads,
                converted,
                conversionRate: pct(converted, leads),
                avgLeadScore: avg(rows.map((r) => r.leadScore ?? 0)),
            };
        })
        .sort((a, b) => b.leads - a.leads);

    const generatedOn = new Date().toISOString();
    const generatedBy = opts?.generatedBy ?? "Demo User";
    const status: ReportStatus = opts?.status ?? "Completed";

    const name = pickReportName(settings, type, periodLabel);

    const summaryText =
        totalLeads === 0
            ? "No leads were found in the selected period (and filters)."
            : `This period generated ${totalLeads} leads with a ${conversionRate.toFixed(
                  1
              )}% conversion rate. Top channel was ${topChannel} and top region was ${topRegion}.`;

    const report: GeneratedReport = {
        id: buildReportId(),
        name,
        type,

        periodLabel,
        periodStart,
        periodEnd,

        generatedOn,
        generatedBy,
        status,

        leadScoreBins,

        executiveSummary: {
            totalLeads,
            convertedLeads,
            conversionRate,
            avgLeadScore,
            avgFollowUpTime,
            topChannel,
            topRegion,
            summaryText,
        },

        kpis: {
            newLeads,
            engagedLeads,
            qualifiedLeads,
            lostLeads,
            slaBreachCount,
            lostReasons,
        },

        channels,

        campaigns,
        funnel: {
            // "new" == Captured (total leads)
            new: funnelCaptured,

            // Now stored in report JSON (preferred by the UI)
            contacted: funnelContacted,

            // Cumulative stages
            engaged: funnelEngagedStage,
            qualified: funnelQualifiedStage,
            converted: funnelConvertedStage,

            // Extra info
            lost: funnelLost,
        },

        regions,
        agents,
    };

    const summary = buildSummaryFromReport(report);

    return { report, summary };
}

/**
 * Main entry you’ll call from GenerateLoadingPage:
 * - loads leads via repository mode (csv now, api later)
 * - computes the report
 */
export async function generateReportFromSettings(
    settings: GenerateReportFormValues,
    opts?: { generatedBy?: string; status?: ReportStatus }
): Promise<GenerateReportResult> {
    const leads = await leadsRepository.listAllLeads();
    return generateReportFromLeads(settings, leads, opts);
}
