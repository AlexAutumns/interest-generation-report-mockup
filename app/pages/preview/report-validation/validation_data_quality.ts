// app/pages/preview/report-validation/validation_data_quality.ts
//
// Lead-level data quality helpers built from report.dataQuality.
// Extracted to reduce clutter in the main validation builder.

import type { GeneratedReport } from "../../../types/reports";
import type {
    CompletenessRow,
    ValidationIssue,
} from "./report_validation_types";
import { safeNumber } from "./validation_utils";

// Read field stats out of report.dataQuality if present.
export function getFieldDQ(report: GeneratedReport, field: string) {
    const dq: any = (report as any).dataQuality;
    if (!dq?.fields || !Array.isArray(dq.fields)) return null;
    return dq.fields.find((x: any) => x.field === field) ?? null;
}

export function buildCompletenessRows(
    report: GeneratedReport,
    issues: ValidationIssue[],
    makeIssue: (
        id: string,
        severity: "Critical" | "Warning" | "Info",
        title: string,
        meaning: string,
        action: string,
    ) => any,
): CompletenessRow[] {
    const completeness: CompletenessRow[] = [];

    const fieldsToShow: Array<{ field: string; label: string }> = [
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

        // Simple thresholds (adjust later if needed)
        const isWarn = missing > 2 || unknown > 2;

        completeness.push({
            label: f.label,
            status: isWarn ? "Warn" : "Pass",
            details: `Missing: ${missing.toFixed(1)}% (${st.missingCount}), Unknown/invalid: ${unknown.toFixed(1)}% (${st.unknownCount}).`,
        });

        // For key fields, raise an explicit warning if noticeably bad.
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

    return completeness;
}
