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
    PriorityFix,
} from "./report_validation_types";

import {
    clamp,
    cleanList,
    normalizeKey,
    safeNumber,
    severityRank,
} from "./validation_utils";

import { buildExplainers } from "./validation_explainers";

import { buildLabelVariants } from "./validation_label_variants";

import {
    computeDataQualityScore,
    computeHealth,
    makePriorityFixes,
} from "./validation_scoring";

import { buildCompletenessRows, getFieldDQ } from "./validation_data_quality";

import { buildFunnelChecks } from "./validation_checks_funnel";

import { buildReconciliationChecks } from "./validation_checks_reconciliation";

import { finalizeValidationModel } from "./validation_finalize";

function sumLeads<T extends { leads: number }>(rows: T[] | undefined): number {
    if (!rows || rows.length === 0) return 0;
    return rows.reduce((s, r) => s + safeNumber(r.leads, 0), 0);
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
    const reconciliation = buildReconciliationChecks(report, issues, makeIssue);

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
    const funnelChecks = buildFunnelChecks(report, issues, makeIssue);

    // ----------------------------
    // Completeness panel (MVP version, report-only)
    // Note: true missing-field coverage needs raw lead-level data.
    // For now we surface “coverage” via sum mismatches and optional arrays.
    // ----------------------------
    const completeness = buildCompletenessRows(report, issues, makeIssue);

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
    const labelVariants = buildLabelVariants(report, getFieldDQ);

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

    const dataQualityScore = computeDataQualityScore(report);

    const priorityFixes = makePriorityFixes(report, issues, labelVariants);

    return finalizeValidationModel({
        issues,
        funnelChecks,
        reconciliation,
        completeness,
        labelVariants,
        priorityFixes,
        explainers,
        dataQualityScore,
    });
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
