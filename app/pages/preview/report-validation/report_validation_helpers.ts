// app/pages/preview/report-validation/report_validation_helpers.ts
//
// Builds a business-friendly validation model from a GeneratedReport.
// This is intentionally light-weight and non-blocking.
// (We only read computed report fields; we do not re-scan raw leads here.)

import type { GeneratedReport } from "../../../types/reports";
import type {
    CompletenessRow,
    ExplainerItem,
    FunnelCheckRow,
    ReconciliationRow,
    ReportValidationModel,
    ValidationHealth,
    ValidationIssue,
    ValidationSeverity,
    LabelVariantGroup,
} from "./report_validation_types";

export type ReportFallbackFlags = {
    contactedMissing: boolean;
    leadScoreBinsMissing: boolean;
    trendMissing: boolean;
};

export type ReportFilterSummary = {
    periodLabel: string;

    scopeMode: "all" | "filtered" | "unknown";
    applyFiltersTo: "preview_only" | "exports_only" | "both" | "unknown";

    // null means "report is old and doesn’t store this yet"
    appliedToReport: boolean | null;

    agents: string[];
    statuses: string[];
    channels: string[];
    regions: string[];
    campaigns: string[];
};

function safeNumber(n: unknown, fallback = 0): number {
    const v = Number(n);
    return Number.isFinite(v) ? v : fallback;
}

function sumLeads<T extends { leads: number }>(rows: T[] | undefined): number {
    if (!rows || rows.length === 0) return 0;
    return rows.reduce((s, r) => s + safeNumber(r.leads, 0), 0);
}

function normalizeKey(raw: string): string {
    // Normalization intended for "are these likely the same label?"
    // - trim + lowercase
    // - collapse multiple spaces
    // - remove common separators/punctuation that cause splits
    return raw
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ")
        .replace(/[_\-\/\\]+/g, " ")
        .replace(/[.,:;()]/g, "")
        .trim();
}

function findLabelVariants<T extends { name: string; leads: number }>(
    field: LabelVariantGroup["field"],
    rows: T[] | undefined,
): LabelVariantGroup[] {
    if (!rows || rows.length === 0) return [];

    // Group original labels by normalized key
    const map = new Map<string, { label: string; leads: number }[]>();

    for (const r of rows) {
        const label = String((r as any).name ?? "").trim();
        if (!label) continue;

        const key = normalizeKey(label);
        const arr = map.get(key) ?? [];
        arr.push({ label, leads: safeNumber((r as any).leads, 0) });
        map.set(key, arr);
    }

    const groups: LabelVariantGroup[] = [];

    for (const [key, variants] of map.entries()) {
        // Only consider it a "variant problem" if there are at least 2 distinct labels
        const distinctLabels = Array.from(
            new Set(variants.map((v) => v.label)),
        );
        if (distinctLabels.length < 2) continue;

        const totalLeads = variants.reduce(
            (s, v) => s + safeNumber(v.leads, 0),
            0,
        );

        // Sort variants by impact (highest leads first) so it's easy to read
        variants.sort((a, b) => b.leads - a.leads);

        const canonical = variants[0]?.label ?? distinctLabels[0];
        const aliases = variants
            .slice(1)
            .map((v) => ({ label: v.label, leads: v.leads }));

        groups.push({
            field,
            normalizedKey: key,
            variants: variants.map((v) => ({ label: v.label, leads: v.leads })),
            canonical,
            aliases,
            totalLeads,
        });
    }

    // Most impactful first
    groups.sort((a, b) => b.totalLeads - a.totalLeads);

    return groups;
}

function severityRank(s: ValidationSeverity): number {
    switch (s) {
        case "Critical":
            return 3;
        case "Warning":
            return 2;
        case "Info":
            return 1;
    }
}

function clamp(n: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, n));
}

function computeDataQualityScore(report: GeneratedReport): number {
    const dq: any = (report as any).dataQuality;
    if (!dq?.fields || !Array.isArray(dq.fields)) {
        // Older reports: neutral but not perfect.
        return 70;
    }

    // Key fields that strongly affect reporting.
    const keyFields = new Set([
        "status",
        "channel",
        "region",
        "campaign",
        "agent",
        "leadScore",
        "createdAt",
    ]);

    let score = 100;

    for (const f of dq.fields) {
        if (!keyFields.has(f.field)) continue;

        const missing = safeNumber(f.missingPercent, 0);
        const unknown = safeNumber(f.unknownPercent, 0);

        // Penalty weights:
        // - Missing is worse than unknown because it cannot be normalized.
        // - Unknown still hurts but can be fixed via standardization.
        score -= missing * 1.2;
        score -= unknown * 0.8;
    }

    return clamp(Math.round(score), 0, 100);
}

function computeHealth(issues: ValidationIssue[]): ValidationHealth {
    if (issues.some((i) => i.severity === "Critical")) return "Critical";
    if (issues.some((i) => i.severity === "Warning")) return "Warning";
    return "Healthy";
}

function makeIssue(
    id: string,
    severity: ValidationSeverity,
    title: string,
    meaning: string,
    action: string,
    details?: string,
): ValidationIssue {
    return { id, severity, title, meaning, action, details };
}

export function buildReportValidationModel(
    report: GeneratedReport,
): ReportValidationModel {
    const issues: ValidationIssue[] = [];

    const total = safeNumber(report.executiveSummary?.totalLeads);
    const convertedSummary = safeNumber(
        report.executiveSummary?.convertedLeads,
    );

    const fNew = safeNumber(report.funnel?.new);
    const fContacted = safeNumber((report.funnel as any)?.contacted); // optional (back-compat)
    const fEngaged = safeNumber(report.funnel?.engaged);
    const fQualified = safeNumber(report.funnel?.qualified);
    const fConverted = safeNumber(report.funnel?.converted);

    // ----------------------------
    // Critical consistency checks
    // ----------------------------
    if (fNew !== total) {
        issues.push(
            makeIssue(
                "total-mismatch",
                "Critical",
                "Total leads mismatch",
                "The report’s total lead count does not match the funnel’s Captured stage.",
                "Check filters and data mappings (status/channel/region). Re-generate after correcting source values.",
                `funnel.new=${fNew}, executiveSummary.totalLeads=${total}`,
            ),
        );
    }

    if (fConverted !== convertedSummary) {
        issues.push(
            makeIssue(
                "converted-mismatch",
                "Critical",
                "Converted leads mismatch",
                "The funnel Converted stage does not match the Executive Summary converted total.",
                "Check the conversion definition (conversion flag vs status) and ensure data is consistently updated.",
                `funnel.converted=${fConverted}, executiveSummary.convertedLeads=${convertedSummary}`,
            ),
        );
    }

    // Monotonic funnel: Captured ≥ Contacted ≥ Engaged ≥ Qualified ≥ Converted
    // Contacted may be 0 if missing (older reports) — we handle that separately.
    const hasContacted = Object.prototype.hasOwnProperty.call(
        report.funnel as any,
        "contacted",
    );
    if (hasContacted) {
        if (
            !(
                fNew >= fContacted &&
                fContacted >= fEngaged &&
                fEngaged >= fQualified &&
                fQualified >= fConverted
            )
        ) {
            issues.push(
                makeIssue(
                    "funnel-monotonic",
                    "Critical",
                    "Funnel stage ordering is inconsistent",
                    "Some funnel stages are larger than the stage before them, which should not happen in a well-formed funnel.",
                    "Review status progression rules and ensure updates follow the agreed process (Engaged → Qualified → Converted).",
                    `Captured=${fNew}, Contacted=${fContacted}, Engaged=${fEngaged}, Qualified=${fQualified}, Converted=${fConverted}`,
                ),
            );
        }
    }

    // ----------------------------
    // Warning-level reconciliation checks
    // ----------------------------
    const reconciliation: ReconciliationRow[] = [];

    const channelsTotal = sumLeads(report.channels);
    reconciliation.push({
        label: "Channels",
        expectedTotal: total,
        actualTotal: channelsTotal,
        status: channelsTotal === total ? "Pass" : "Warn",
        note:
            channelsTotal === total
                ? "All leads are accounted for by channel."
                : `Difference: ${Math.abs(total - channelsTotal)} lead(s) may have missing/unknown channel.`,
    });

    const campaignsTotal = sumLeads(report.campaigns);
    if (report.campaigns && report.campaigns.length > 0) {
        reconciliation.push({
            label: "Campaigns",
            expectedTotal: total,
            actualTotal: campaignsTotal,
            status: campaignsTotal === total ? "Pass" : "Warn",
            note:
                campaignsTotal === total
                    ? "All leads are accounted for by campaign."
                    : `Difference: ${Math.abs(total - campaignsTotal)} lead(s) may have missing/unknown campaign.`,
        });
    }

    const regionsTotal = sumLeads(report.regions);
    if (report.regions && report.regions.length > 0) {
        reconciliation.push({
            label: "Regions",
            expectedTotal: total,
            actualTotal: regionsTotal,
            status: regionsTotal === total ? "Pass" : "Warn",
            note:
                regionsTotal === total
                    ? "All leads are accounted for by region."
                    : `Difference: ${Math.abs(total - regionsTotal)} lead(s) may have missing/unknown region.`,
        });
    }

    const agentsTotal = sumLeads(report.agents);
    if (report.agents && report.agents.length > 0) {
        reconciliation.push({
            label: "Agents",
            expectedTotal: total,
            actualTotal: agentsTotal,
            status: agentsTotal === total ? "Pass" : "Warn",
            note:
                agentsTotal === total
                    ? "All leads are accounted for by agent."
                    : `Difference: ${Math.abs(total - agentsTotal)} lead(s) may have missing/unknown agent.`,
        });
    }

    // If any reconciliation row warns, add a warning issue (business-friendly)
    const hasReconWarn = reconciliation.some((r) => r.status === "Warn");
    if (hasReconWarn) {
        issues.push(
            makeIssue(
                "group-sum-mismatch",
                "Warning",
                "Grouped totals do not match total leads",
                "One or more grouped tables (channel/campaign/region/agent) does not add up to the total lead count.",
                "Check for missing values or inconsistent labels (e.g., 'Facebook', 'FB', 'Facebook '). Normalize and re-generate.",
            ),
        );
    }

    // ----------------------------
    // Plausibility checks (Warning/Info)
    // ----------------------------
    const convRate = safeNumber(report.executiveSummary?.conversionRate);
    if (total >= 30 && convRate >= 80) {
        issues.push(
            makeIssue(
                "conversion-rate-high",
                "Warning",
                "Conversion rate is unusually high",
                "Conversion rate is very high for the lead volume. This can be valid, but often indicates filtered data or missing non-converted leads.",
                "Confirm filters and ensure lost/unqualified leads are included. Review lead status updates.",
            ),
        );
    }

    const avgScore = safeNumber(report.executiveSummary?.avgLeadScore);
    if (avgScore < 0 || avgScore > 100) {
        issues.push(
            makeIssue(
                "avg-score-range",
                "Warning",
                "Average lead score is outside the expected range",
                "Lead scores are expected to be between 0 and 100.",
                "Check lead score calculation or source field mapping.",
            ),
        );
    }

    const avgFollowUp = safeNumber(report.executiveSummary?.avgFollowUpTime);
    if (avgFollowUp < 0) {
        issues.push(
            makeIssue(
                "followup-negative",
                "Warning",
                "Average follow-up time is negative",
                "Follow-up time should not be negative and may indicate incorrect date/time parsing.",
                "Check activity timestamps and date parsing logic.",
            ),
        );
    } else if (avgFollowUp > 168) {
        issues.push(
            makeIssue(
                "followup-very-high",
                "Info",
                "Average follow-up time is very high",
                "Average follow-up time is over 7 days. This may indicate backlog or missing follow-up data.",
                "Review follow-up SLAs and confirm follow-up timestamps are recorded.",
            ),
        );
    }

    // ----------------------------
    // Funnel check rows (for a clear “Pass/Fail” panel)
    // ----------------------------
    const funnelChecks: FunnelCheckRow[] = [];

    funnelChecks.push({
        label: "Captured equals total leads",
        status: fNew === total ? "Pass" : "Fail",
        details: `Captured=${fNew}, Total=${total}`,
    });

    funnelChecks.push({
        label: "Converted equals executive summary converted",
        status: fConverted === convertedSummary ? "Pass" : "Fail",
        details: `Converted=${fConverted}, Summary Converted=${convertedSummary}`,
    });

    if (hasContacted) {
        const ok =
            fNew >= fContacted &&
            fContacted >= fEngaged &&
            fEngaged >= fQualified &&
            fQualified >= fConverted;

        funnelChecks.push({
            label: "Monotonic funnel ordering",
            status: ok ? "Pass" : "Fail",
            details: `Captured=${fNew} ≥ Contacted=${fContacted} ≥ Engaged=${fEngaged} ≥ Qualified=${fQualified} ≥ Converted=${fConverted}`,
        });
    } else {
        funnelChecks.push({
            label: "Contacted stored in report",
            status: "Fail",
            details:
                "This report does not include funnel.contacted (older format).",
        });
    }

    // ----------------------------
    // Completeness panel (MVP version, report-only)
    // Note: true missing-field coverage needs raw lead-level data.
    // For now we surface “coverage” via sum mismatches and optional arrays.
    // ----------------------------
    const completeness: CompletenessRow[] = [];

    const fieldsToShow: Array<{ field: any; label: string }> = [
        { field: "status", label: "Status completeness" },
        { field: "agent", label: "Agent completeness" },
        { field: "channel", label: "Channel completeness" },
        { field: "campaign", label: "Campaign completeness" },
        { field: "region", label: "Region completeness" },
        { field: "leadScore", label: "Lead score completeness" },
        { field: "createdAt", label: "Created date completeness" },
    ];

    for (const f of fieldsToShow) {
        const st = getFieldDQ(report, f.field);

        if (!st) {
            completeness.push({
                label: f.label,
                status: "Info",
                details:
                    "Data quality stats not available in this report (re-generate using the latest generator).",
            });
            continue;
        }

        const missing = safeNumber(st.missingPercent);
        const unknown = safeNumber(st.unknownPercent);

        // Simple thresholds (tweak later)
        const isWarn = missing > 2 || unknown > 2;

        completeness.push({
            label: f.label,
            status: isWarn ? "Warn" : "Pass",
            details: `Missing: ${missing.toFixed(1)}% (${st.missingCount}), Unknown/invalid: ${unknown.toFixed(1)}% (${st.unknownCount}).`,
        });

        // If it’s a key field and fairly bad, add an explicit warning issue.
        if (
            (f.field === "channel" ||
                f.field === "region" ||
                f.field === "status") &&
            (missing > 5 || unknown > 5)
        ) {
            issues.push(
                makeIssue(
                    `dq-${f.field}`,
                    "Warning",
                    `${f.label} needs attention`,
                    `A noticeable share of leads are missing or have invalid values for ${f.field}. This can distort breakdowns and totals.`,
                    "Normalize values in the source data (fill blanks, standardize labels) and re-generate the report.",
                ),
            );
        }
    }

    // ----------------------------
    // Label variants (helps business users fix split categories)
    // ----------------------------
    // Prefer lead-level dataQuality if available (more accurate).
    // Fallback to grouped tables for older reports.
    const labelVariants: LabelVariantGroup[] = [
        ...findLabelVariantsFromDataQuality(report, "Channel"),
        ...findLabelVariantsFromDataQuality(report, "Campaign"),
        ...findLabelVariantsFromDataQuality(report, "Region"),
        ...findLabelVariantsFromDataQuality(report, "Agent"),
    ];

    if (labelVariants.length === 0) {
        // Fallback (older reports without dataQuality)
        labelVariants.push(
            ...findLabelVariants("Channel", report.channels as any),
            ...findLabelVariants("Campaign", report.campaigns as any),
            ...findLabelVariants("Region", report.regions as any),
            ...findLabelVariants("Agent", report.agents as any),
        );
    }

    // If variants exist, raise a Warning issue.
    // This is one of the most common real-world reasons totals “feel wrong”.
    if (labelVariants.length > 0) {
        issues.push(
            makeIssue(
                "label-variants",
                "Warning",
                "Inconsistent labels detected (possible duplicates)",
                "Some categories may be split across multiple spellings or formats (e.g., 'FB' vs 'Facebook'). This can distort channel/campaign/region comparisons.",
                "Normalize labels in the source data (choose one standard label) and re-generate the report.",
            ),
        );
    }

    // ----------------------------
    // Fallback usage (Info-level issues)
    // These help business users understand when a chart may be using placeholders.
    // ----------------------------
    const hasBins =
        Array.isArray((report as any).leadScoreBins) &&
        (report as any).leadScoreBins.length > 0;

    const hasTrend =
        Array.isArray((report as any).trend) &&
        (report as any).trend.length > 0;

    if (!hasContacted) {
        issues.push(
            makeIssue(
                "fallback-contacted",
                "Info",
                "Contacted stage is estimated or missing",
                "This report does not store a Contacted value, so some views may estimate Contacted.",
                "Re-generate the report using the latest generator to store funnel.contacted.",
            ),
        );
    }

    if (!hasBins) {
        issues.push(
            makeIssue(
                "fallback-bins",
                "Info",
                "Lead score bins are missing",
                "Lead score distribution may use fallback logic if score bins were not generated.",
                "Re-generate the report to store leadScoreBins for stable distribution reporting.",
            ),
        );
    }

    if (!hasTrend) {
        issues.push(
            makeIssue(
                "fallback-trend",
                "Info",
                "Trend series is missing",
                "The KPI Trend view may use a generated placeholder series when the report does not store trend data.",
                "Generate and store a trend series to enable real trend reporting.",
            ),
        );
    }

    // ----------------------------
    // Explainers (static, non-programmer friendly)
    // ----------------------------
    const explainers: ExplainerItem[] = buildExplainers();

    // Sort issues by severity (Critical first) then title.
    issues.sort((a, b) => {
        const d = severityRank(b.severity) - severityRank(a.severity);
        if (d !== 0) return d;
        return a.title.localeCompare(b.title);
    });

    // Health must be computed AFTER all issues are added.
    const health = computeHealth(issues);

    const dataQualityScore = computeDataQualityScore(report);

    return {
        health,
        dataQualityScore,
        issues,
        funnelChecks,
        reconciliation,
        completeness,
        labelVariants,
        explainers,
    };
}

function cleanList(arr: unknown): string[] {
    if (!Array.isArray(arr)) return [];
    return arr.map((x) => String(x ?? "").trim()).filter(Boolean);
}

export function buildFilterSummary(
    report: GeneratedReport,
): ReportFilterSummary {
    // We pull from report.filters if available.
    // This keeps the page aligned with whatever scope the report was generated with.
    const f: any = (report as any).filters;

    if (!f) {
        return {
            periodLabel: report.periodLabel,
            scopeMode: "unknown",
            applyFiltersTo: "unknown",
            appliedToReport: null,

            agents: [],
            statuses: [],
            channels: [],
            regions: [],
            campaigns: [],
        };
    }

    return {
        periodLabel: report.periodLabel,
        scopeMode: f.scopeMode ?? "unknown",
        applyFiltersTo: f.applyFiltersTo ?? "unknown",
        appliedToReport:
            typeof f.appliedToReport === "boolean" ? f.appliedToReport : null,

        agents: cleanList(f.agents),
        statuses: cleanList(f.statuses),
        channels: cleanList(f.channels),
        regions: cleanList(f.regions),
        campaigns: cleanList(f.campaigns),
    };
}

export function detectFallbackFlags(
    report: GeneratedReport,
): ReportFallbackFlags {
    const hasContacted = Object.prototype.hasOwnProperty.call(
        report.funnel as any,
        "contacted",
    );
    const hasBins =
        Array.isArray((report as any).leadScoreBins) &&
        (report as any).leadScoreBins.length > 0;
    const hasTrend =
        Array.isArray((report as any).trend) &&
        (report as any).trend.length > 0;

    return {
        contactedMissing: !hasContacted,
        leadScoreBinsMissing: !hasBins,
        trendMissing: !hasTrend,
    };
}

function getFieldDQ(report: GeneratedReport, field: string) {
    const dq: any = (report as any).dataQuality;
    if (!dq?.fields || !Array.isArray(dq.fields)) return null;
    return dq.fields.find((x: any) => x.field === field) ?? null;
}

function fieldToDQKey(field: LabelVariantGroup["field"]): string {
    switch (field) {
        case "Channel":
            return "channel";
        case "Campaign":
            return "campaign";
        case "Region":
            return "region";
        case "Agent":
            return "agent";
    }
}

function findLabelVariantsFromDataQuality(
    report: GeneratedReport,
    field: LabelVariantGroup["field"],
): LabelVariantGroup[] {
    const dqFieldKey = fieldToDQKey(field);
    const dq = getFieldDQ(report, dqFieldKey);

    // If we don't have dataQuality for this report, return empty and let fallback handle it.
    if (!dq || !Array.isArray(dq.topValues)) return [];

    // Group raw top values by normalized key (trim/lower/collapse separators).
    const map = new Map<string, { label: string; leads: number }[]>();

    for (const tv of dq.topValues) {
        const label = String(tv.value ?? "").trim();
        if (!label) continue;

        const key = normalizeKey(label);
        const arr = map.get(key) ?? [];
        arr.push({ label, leads: safeNumber(tv.count, 0) });
        map.set(key, arr);
    }

    const groups: LabelVariantGroup[] = [];

    for (const [key, variants] of map.entries()) {
        // Only consider duplicates if we have 2+ distinct labels
        const distinctLabels = Array.from(
            new Set(variants.map((v) => v.label)),
        );
        if (distinctLabels.length < 2) continue;

        const totalLeads = variants.reduce(
            (s, v) => s + safeNumber(v.leads, 0),
            0,
        );

        // Sort variants by impact (highest leads first) so it's easy to read
        variants.sort((a, b) => b.leads - a.leads);

        const canonical = variants[0]?.label ?? distinctLabels[0];
        const aliases = variants
            .slice(1)
            .map((v) => ({ label: v.label, leads: v.leads }));

        groups.push({
            field,
            normalizedKey: key,
            variants: variants.map((v) => ({ label: v.label, leads: v.leads })),
            canonical,
            aliases,
            totalLeads,
        });
    }

    // Most impactful first
    groups.sort((a, b) => b.totalLeads - a.totalLeads);
    return groups;
}

function buildExplainers(): ExplainerItem[] {
    return [
        {
            title: "Total leads (Captured)",
            definition:
                "All leads included in the report period and filters. This is the total pipeline entry count for the selected scope.",
            formula: "Captured = count(leads in scope)",
            example:
                "If 157 leads were created in January and match filters, Captured = 157.",
        },
        {
            title: "Converted leads",
            definition:
                "Leads that have a conversion event. In the prototype, a lead is converted if the conversion flag is true OR status indicates conversion.",
            formula:
                "Converted = count(leads where conversion > 0 OR status == 'Converted')",
            example:
                "If a lead has conversion=1 but status isn’t updated yet, it is still counted as Converted.",
        },
        {
            title: "Conversion rate",
            definition:
                "The percentage of total leads that converted in the selected scope.",
            formula: "Conversion rate (%) = (Converted ÷ Total) × 100",
        },
        {
            title: "Funnel stages",
            definition:
                "Stages are cumulative: each stage includes leads at that stage or beyond (e.g., Engaged includes Qualified and Converted).",
            formula:
                "Engaged = Engaged-or-later, Qualified = Qualified-or-later, Converted = Converted",
        },
        {
            title: "Contacted (prototype)",
            definition:
                "Outreach initiated. In the prototype, this may be estimated based on follow-up speed until activity logs are available.",
            formula:
                "Contacted ≈ Captured × factor (based on avg follow-up time), clamped to be ≥ Engaged",
        },
        {
            title: "Lead score distribution",
            definition:
                "Leads are grouped into score bands to show lead quality at a glance.",
            formula:
                "Bins: 0–20, 21–40, 41–60, 61–80, 81–100 (count leads per band)",
        },
    ];
}
