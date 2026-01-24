// app/pages/preview/report-validation/validation_finalize.ts
//
// Final assembly of the validation model:
// - sort issues
// - compute health
// - return the full model object

import type {
    CompletenessRow,
    ExplainerItem,
    FunnelCheckRow,
    LabelVariantGroup,
    PriorityFix,
    ReconciliationRow,
    ReportValidationModel,
    ValidationIssue,
} from "./report_validation_types";
import type { ValidationHealth } from "./report_validation_types";
import { severityRank } from "./validation_utils";
import { computeHealth } from "./validation_scoring";

type FinalizeArgs = {
    issues: ValidationIssue[];
    funnelChecks: FunnelCheckRow[];
    reconciliation: ReconciliationRow[];
    completeness: CompletenessRow[];
    labelVariants: LabelVariantGroup[];
    priorityFixes: PriorityFix[];
    explainers: ExplainerItem[];
    dataQualityScore: number;
};

export function finalizeValidationModel(
    args: FinalizeArgs,
): ReportValidationModel {
    const issues = [...args.issues];

    // Sort issues by severity (Critical first) then title (stable readability).
    issues.sort((a, b) => {
        const d = severityRank(b.severity) - severityRank(a.severity);
        if (d !== 0) return d;
        return a.title.localeCompare(b.title);
    });

    // Health must be computed AFTER all issues are added.
    const health: ValidationHealth = computeHealth(issues);

    return {
        health,
        dataQualityScore: args.dataQualityScore,
        issues,
        funnelChecks: args.funnelChecks,
        reconciliation: args.reconciliation,
        completeness: args.completeness,
        labelVariants: args.labelVariants,
        priorityFixes: args.priorityFixes,
        explainers: args.explainers,
    };
}
