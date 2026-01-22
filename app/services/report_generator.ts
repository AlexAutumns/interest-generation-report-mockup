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
    ReportDataQuality,
    DataQualityFieldStats,
    ReportFilterSnapshot,
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

function buildDataQuality(scoped: any[]): ReportDataQuality {
    const total = scoped.length || 0;

    // For consistent handling: treat null/undefined/"", "n/a", "-" as missing/unknown.
    const norm = (v: unknown) => String(v ?? "").trim();
    const isBlankLike = (s: string) => {
        const t = s.trim().toLowerCase();
        return (
            t === "" ||
            t === "n/a" ||
            t === "na" ||
            t === "-" ||
            t === "none" ||
            t === "null" ||
            t === "undefined"
        );
    };

    const pctSafe = (count: number, denom: number) =>
        denom > 0 ? (count / denom) * 100 : 0;

    const topK = (map: Map<string, number>, k: number) => {
        const arr = Array.from(map.entries())
            .map(([value, count]) => ({ value, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, k);

        return arr.map((x) => ({
            value: x.value,
            count: x.count,
            percent: pctSafe(x.count, total),
        }));
    };

    const fieldStats = (
        field: DataQualityFieldStats["field"],
        getter: (lead: any) => unknown,
        opts?: {
            treatNonNumericAsUnknown?: boolean;
            numericRange?: { min: number; max: number };
        },
    ): DataQualityFieldStats => {
        let missingCount = 0;
        let unknownCount = 0;
        const valueCounts = new Map<string, number>();

        for (const lead of scoped) {
            const raw = getter(lead);

            // Missing: null/undefined
            if (raw === null || raw === undefined) {
                missingCount++;
                continue;
            }

            // Special numeric handling (leadScore)
            if (opts?.numericRange) {
                const n = Number(raw);

                if (!Number.isFinite(n)) {
                    // Non-numeric present (e.g., "abc") counts as unknown
                    unknownCount++;
                    continue;
                }

                // Out-of-range numeric values count as unknown (still present, but invalid)
                if (n < opts.numericRange.min || n > opts.numericRange.max) {
                    unknownCount++;
                    continue;
                }

                const label = String(Math.round(n));
                valueCounts.set(label, (valueCounts.get(label) ?? 0) + 1);
                continue;
            }

            // String-like handling
            const s = norm(raw);

            if (isBlankLike(s)) {
                // Present but blank-like => unknown
                unknownCount++;
                continue;
            }

            valueCounts.set(s, (valueCounts.get(s) ?? 0) + 1);
        }

        return {
            field,
            total,
            missingCount,
            missingPercent: pctSafe(missingCount, total),
            unknownCount,
            unknownPercent: pctSafe(unknownCount, total),
            // Store more raw values so the validation page can detect more label variants
            // (e.g., "FB", "Facebook", "Facebook ").
            topValues: topK(valueCounts, 20),
        };
    };

    return {
        version: 1,
        totalScopedLeads: total,
        fields: [
            fieldStats("status", (l) => l.status),
            fieldStats("agent", (l) => l.agent),
            fieldStats("channel", (l) => l.channel),
            fieldStats("campaign", (l) => l.campaign),
            fieldStats("region", (l) => l.region),
            fieldStats("leadScore", (l) => l.leadScore, {
                numericRange: { min: 0, max: 100 },
            }),
            fieldStats("createdAt", (l) => l.createdAt),
        ],
    };
}

function sum(nums: number[]): number {
    return nums.reduce((a, b) => a + b, 0);
}

function avg(nums: number[]): number {
    if (!nums.length) return 0;
    return sum(nums) / nums.length;
}

function isFiniteNumber(n: unknown): n is number {
    return typeof n === "number" && Number.isFinite(n);
}

function shouldRunSanityChecks(): boolean {
    // Goal: dev-only by default, but still works in different runtimes.
    // - Vite: import.meta.env.DEV
    // - Node-like: process.env.NODE_ENV !== "production"
    //
    // These checks are NON-BLOCKING: they only warn to console.
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const viteDev = (import.meta as any)?.env?.DEV;
        if (viteDev === true) return true;
        if (viteDev === false) return false;
    } catch {
        // ignore
    }

    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const nodeEnv = (process as any)?.env?.NODE_ENV;
        return nodeEnv !== "production";
    } catch {
        // If we can't detect env, default to running (safe; still non-blocking).
        return true;
    }
}

function runReportSanityChecks(report: GeneratedReport): void {
    if (!shouldRunSanityChecks()) return;

    const warnings: string[] = [];
    const f = report.funnel;

    const total = report.executiveSummary.totalLeads;
    const convertedSummary = report.executiveSummary.convertedLeads;

    // 1) Total consistency: funnel.new must match executiveSummary.totalLeads
    if (isFiniteNumber(f.new) && isFiniteNumber(total) && f.new !== total) {
        warnings.push(
            `Total mismatch: funnel.new (${f.new}) != executiveSummary.totalLeads (${total}).`,
        );
    }

    // 2) Converted consistency: funnel.converted should match executiveSummary.convertedLeads
    if (
        isFiniteNumber(f.converted) &&
        isFiniteNumber(convertedSummary) &&
        f.converted !== convertedSummary
    ) {
        warnings.push(
            `Converted mismatch: funnel.converted (${f.converted}) != executiveSummary.convertedLeads (${convertedSummary}).`,
        );
    }

    // 3) Monotonic funnel: Captured >= Contacted >= Engaged >= Qualified >= Converted
    // Contacted is optional, so only check it if present.
    const stages: Array<{ key: string; value: number }> = [
        { key: "captured", value: f.new },
        ...(isFiniteNumber(f.contacted)
            ? [{ key: "contacted", value: f.contacted }]
            : []),
        { key: "engaged", value: f.engaged },
        { key: "qualified", value: f.qualified },
        { key: "converted", value: f.converted },
    ];

    for (let i = 0; i < stages.length - 1; i++) {
        const a = stages[i];
        const b = stages[i + 1];
        if (!isFiniteNumber(a.value) || !isFiniteNumber(b.value)) continue;

        if (a.value < b.value) {
            warnings.push(
                `Funnel monotonicity violated: ${a.key} (${a.value}) < ${b.key} (${b.value}).`,
            );
        }
    }

    // 4) Lead score bins should sum to total leads (if present)
    if (
        Array.isArray(report.leadScoreBins) &&
        report.leadScoreBins.length > 0
    ) {
        const binsTotal = report.leadScoreBins.reduce(
            (s, b) => s + (isFiniteNumber(b.count) ? b.count : 0),
            0,
        );

        if (isFiniteNumber(total) && binsTotal !== total) {
            warnings.push(
                `Lead score bins mismatch: sum(bins) (${binsTotal}) != totalLeads (${total}).`,
            );
        }
    }

    // 5) Group tables should sum to total leads (helps catch missing rows due to grouping keys)
    const sumLeads = <T extends { leads: number }>(rows: T[]) =>
        rows.reduce((s, r) => s + (isFiniteNumber(r.leads) ? r.leads : 0), 0);

    const channelsTotal = sumLeads(report.channels ?? []);
    if (isFiniteNumber(total) && channelsTotal !== total) {
        warnings.push(
            `Channels sum mismatch: sum(channels.leads) (${channelsTotal}) != totalLeads (${total}).`,
        );
    }

    const campaignsTotal = sumLeads(report.campaigns ?? []);
    if (isFiniteNumber(total) && campaignsTotal !== total) {
        warnings.push(
            `Campaigns sum mismatch: sum(campaigns.leads) (${campaignsTotal}) != totalLeads (${total}).`,
        );
    }

    const regionsTotal = sumLeads(report.regions ?? []);
    if (isFiniteNumber(total) && regionsTotal !== total) {
        warnings.push(
            `Regions sum mismatch: sum(regions.leads) (${regionsTotal}) != totalLeads (${total}).`,
        );
    }

    const agentsTotal = sumLeads(report.agents ?? []);
    if (isFiniteNumber(total) && agentsTotal !== total) {
        warnings.push(
            `Agents sum mismatch: sum(agents.leads) (${agentsTotal}) != totalLeads (${total}).`,
        );
    }

    // If anything looks off, warn once with context.
    if (warnings.length > 0) {
        // Keep it readable: one warning + list of issues.
        console.warn(
            `[ReportGenerator] Sanity check warnings for ${report.id} (${report.periodLabel}):`,
            warnings,
        );
    }
}

function buildLeadScoreBins(
    scores: Array<number | null | undefined>,
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
    s: string | undefined,
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

function parseDateOnly(input: string | undefined | null): Date | null {
    // Accept both:
    // 1) Date-only strings from CSV: "YYYY-MM-DD"
    // 2) Full ISO timestamps from APIs: "YYYY-MM-DDTHH:mm:ssZ" / "+08:00", etc.
    //
    // Why: the mock data is date-only today, but production sources often include timezones.
    // Returning null on invalid inputs avoids silently producing "Invalid Date" math.
    const raw = (input ?? "").trim();
    if (!raw) return null;

    // Date-only format: treat as local midnight to keep reporting stable by local day.
    // (Using "T00:00:00" without a timezone keeps it in local time.)
    const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(raw);
    if (isDateOnly) {
        const d = new Date(`${raw}T00:00:00`);
        return Number.isNaN(d.getTime()) ? null : d;
    }

    // Otherwise, attempt normal Date parsing for ISO timestamps.
    const d = new Date(raw);
    return Number.isNaN(d.getTime()) ? null : d;
}

function isBetweenInclusive(
    dateIso: string | undefined,
    startIso: string,
    endIso: string,
): boolean {
    const t = parseDateOnly(dateIso);
    const a = parseDateOnly(startIso);
    const b = parseDateOnly(endIso);

    // If any date is invalid/missing, we treat it as not in range.
    // This avoids crashes and prevents "Invalid Date" math from skewing totals.
    if (!t || !a || !b) return false;

    const tt = t.getTime();
    const aa = a.getTime();
    const bb = b.getTime();

    return tt >= aa && tt <= bb;
}

function getIsoWeekNumber(d: Date): number {
    // ISO week number
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    return Math.ceil(
        ((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
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

        const startDate = parseDateOnly(start) ?? new Date();

        // If weekStart is invalid, we fall back to "today" to avoid crashing.
        // (This should be rare because the UI should supply a valid YYYY-MM-DD.)
        const wk = getIsoWeekNumber(startDate);
        const yy = startDate.getFullYear();

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
    periodLabel: string,
): string {
    const custom = (settings.customName ?? "").trim();
    if (custom.length > 0) return custom;
    return buildDefaultReportName(type, periodLabel);
}

function shouldApplyFiltersToPreview(
    settings: GenerateReportFormValues,
): boolean {
    if (settings.scopeMode !== "filtered") return false;
    return (
        settings.applyFiltersTo === "both" ||
        settings.applyFiltersTo === "preview_only"
    );
}

function applyPreviewFilters(
    leads: LeadRow[],
    settings: GenerateReportFormValues,
): LeadRow[] {
    if (!shouldApplyFiltersToPreview(settings)) return leads;

    const agents = settings.agents ?? [];
    const statuses = settings.statuses ?? [];
    const channels = settings.channels ?? [];
    const regions = settings.regions ?? [];
    const campaigns = settings.campaigns ?? [];

    // Normalize filter comparisons to avoid silent mismatches due to
    // casing or extra spaces (e.g., "Facebook" vs "facebook", "Yangon " vs "Yangon").
    //
    // This is important because report totals can look "wrong" simply because
    // the filter values don't exactly match the raw CSV strings.
    const norm = (s: string | undefined | null) =>
        (s ?? "").trim().toLowerCase();

    const toSet = (arr: string[]) => {
        // Keep only non-empty normalized values
        return new Set(arr.map(norm).filter(Boolean));
    };

    const agentSet = toSet(agents);
    const statusSet = toSet(statuses);
    const channelSet = toSet(channels);
    const regionSet = toSet(regions);
    const campaignSet = toSet(campaigns);

    const match = (v: string | undefined, set: Set<string>) =>
        set.size === 0 ? true : set.has(norm(v));

    return leads.filter((l) => {
        return (
            match(l.agent, agentSet) &&
            match(l.status, statusSet) &&
            match(l.channel, channelSet) &&
            match(l.region, regionSet) &&
            match(l.campaign, campaignSet)
        );
    });
}

function cleanFilterList(arr: string[] | undefined): string[] {
    // Keep the user’s selected labels readable, but remove empties.
    return (arr ?? []).map((x) => (x ?? "").trim()).filter(Boolean);
}

function buildReportFilterSnapshot(
    settings: GenerateReportFormValues,
): ReportFilterSnapshot {
    // NOTE:
    // The current generator uses applyPreviewFilters() to compute the dataset used for the report.
    // So "appliedToReport" matches shouldApplyFiltersToPreview(settings).
    const appliedToReport = shouldApplyFiltersToPreview(settings);

    return {
        scopeMode: settings.scopeMode ?? "all",
        applyFiltersTo: settings.applyFiltersTo ?? "both",
        appliedToReport,

        channels: cleanFilterList(settings.channels),
        regions: cleanFilterList(settings.regions),
        campaigns: cleanFilterList(settings.campaigns),
        agents: cleanFilterList(settings.agents),
        statuses: cleanFilterList(settings.statuses),
    };
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
    opts?: { generatedBy?: string; status?: ReportStatus },
): GenerateReportResult {
    const { periodStart, periodEnd, periodLabel, type } =
        buildPeriodRangeFromSettings(settings);

    // 1) Period filter (bucket by createdAt)
    const inPeriod = allLeads.filter((l) =>
        isBetweenInclusive(l.createdAt, periodStart, periodEnd),
    );

    // 2) Optional advanced filters (preview)
    const scoped = applyPreviewFilters(inPeriod, settings);

    // Store the user's scope settings into the report JSON.
    // This enables the Validation page to show exactly what scope produced the metrics.
    const filters = buildReportFilterSnapshot(settings);

    // Store lead-level data quality for validation + business intervention.
    // This avoids guessing completeness from grouped sums.
    const dataQuality = buildDataQuality(scoped);

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
        (s) => s === "Qualified",
    ).length;
    const statusConverted = statusBuckets.filter(
        (s) => s === "Converted",
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

    // Funnel stages must NOT double-count.
    // We also want funnel.converted to match executiveSummary.convertedLeads.
    //
    // Instead of summing buckets (Qualified + Converted), we compute each stage using
    // lead-level rules so "conversion=1 but status != Converted" is still counted.
    //
    // Stage meaning in this mock:
    // - Converted: isConvertedLead (conversion flag OR converted status)
    // - Qualified: status Qualified OR Converted
    // - Engaged: status Engaged OR Qualified OR Converted
    let funnelConvertedStage = 0;
    let funnelQualifiedStage = 0;
    let funnelEngagedStage = 0;

    for (let i = 0; i < scoped.length; i++) {
        const lead = scoped[i];
        const st = statusBuckets[i]; // normalized status for this lead

        // Same conversion rule as executive summary:
        // a lead is "converted" if conversion > 0 OR status is Converted/Won.
        const converted = (lead.conversion ?? 0) > 0 || st === "Converted";

        if (converted) funnelConvertedStage++;

        // Qualified includes leads explicitly qualified *or* already converted.
        if (st === "Qualified" || converted) funnelQualifiedStage++;

        // Engaged includes Engaged/Qualified/Converted.
        if (st === "Engaged" || st === "Qualified" || converted)
            funnelEngagedStage++;
    }

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
        (l) => (l.slaBreached ?? 0) > 0,
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
                  1,
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
        dataQuality,
        filters,
    };

    // Non-blocking validation to catch silent math drift during development.
    // This should never throw; it only warns in console when something is inconsistent.
    runReportSanityChecks(report);

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
    opts?: { generatedBy?: string; status?: ReportStatus },
): Promise<GenerateReportResult> {
    const leads = await leadsRepository.listAllLeads();
    return generateReportFromLeads(settings, leads, opts);
}
