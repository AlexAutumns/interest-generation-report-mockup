// app/pages/preview/report-validation/validation_scoring.ts
//
// Scoring + "what to fix first" helpers.
// Extracted to keep the main validation builder readable.

import type { GeneratedReport } from "../../../types/reports";
import type {
    LabelVariantGroup,
    PriorityFix,
    ValidationHealth,
    ValidationIssue,
} from "./report_validation_types";
import { clamp, safeNumber } from "./validation_utils";

export function computeHealth(issues: ValidationIssue[]): ValidationHealth {
    if (issues.some((i) => i.severity === "Critical")) return "Critical";
    if (issues.some((i) => i.severity === "Warning")) return "Warning";
    return "Healthy";
}

export function computeDataQualityScore(report: GeneratedReport): number {
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

function pickWorstDQField(report: GeneratedReport): any | null {
    const dq: any = (report as any).dataQuality;
    if (!dq?.fields || !Array.isArray(dq.fields)) return null;

    // We care most about these for reporting consistency
    const important = new Set([
        "status",
        "channel",
        "region",
        "campaign",
        "agent",
    ]);

    const scored = dq.fields
        .filter((f: any) => important.has(f.field))
        .map((f: any) => ({
            ...f,
            impact:
                safeNumber(f.missingPercent, 0) * 1.2 +
                safeNumber(f.unknownPercent, 0) * 0.8,
        }))
        .sort((a: any, b: any) => b.impact - a.impact);

    return scored[0] ?? null;
}

export function makePriorityFixes(
    report: GeneratedReport,
    issues: ValidationIssue[],
    labelVariants: LabelVariantGroup[],
): PriorityFix[] {
    const fixes: PriorityFix[] = [];

    // 1) Funnel integrity: if any critical funnel mismatch exists, prioritize it first
    const funnelCritical = issues.find(
        (i) =>
            i.severity === "Critical" &&
            (i.id === "total-mismatch" ||
                i.id === "converted-mismatch" ||
                i.id === "funnel-monotonic"),
    );

    if (funnelCritical) {
        fixes.push({
            title: "Fix funnel consistency first",
            reason: funnelCritical.meaning,
            action: funnelCritical.action,
            severity: "Critical",
        });
    }

    // 2) Data Quality: worst missing/unknown field
    const worst = pickWorstDQField(report);
    if (
        worst &&
        (safeNumber(worst.missingPercent, 0) > 2 ||
            safeNumber(worst.unknownPercent, 0) > 2)
    ) {
        fixes.push({
            title: `Improve ${String(worst.field)} data completeness`,
            reason: `Missing: ${Number(worst.missingPercent).toFixed(
                1,
            )}%, Unknown: ${Number(worst.unknownPercent).toFixed(1)}%`,
            action: "Fill missing values and standardize labels in the source system, then re-generate the report.",
            severity:
                safeNumber(worst.missingPercent, 0) > 10 ||
                safeNumber(worst.unknownPercent, 0) > 10
                    ? "Critical"
                    : "Warning",
        });
    }

    // 3) Label variants: biggest duplicate group
    const biggestVariant = labelVariants
        .slice()
        .sort((a, b) => b.totalLeads - a.totalLeads)[0];

    if (biggestVariant && biggestVariant.aliases?.length > 0) {
        fixes.push({
            title: `Normalize ${biggestVariant.field} labels`,
            reason: `Multiple spellings detected for “${biggestVariant.canonical}” (affects ${biggestVariant.totalLeads} leads).`,
            action: `Map aliases into “${biggestVariant.canonical}” (e.g., ${biggestVariant.aliases
                .slice(0, 2)
                .map((a) => `"${a.label}"`)
                .join(
                    ", ",
                )} → "${biggestVariant.canonical}"), then re-generate the report.`,
            severity: "Warning",
        });
    }

    return fixes.filter(Boolean).slice(0, 3);
}
