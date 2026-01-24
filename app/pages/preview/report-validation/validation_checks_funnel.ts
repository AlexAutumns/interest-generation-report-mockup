// app/pages/preview/report-validation/validation_checks_funnel.ts
//
// Funnel integrity checks (counts + monotonic stage ordering).
// Extracted to keep the main validation builder shorter.

import type { GeneratedReport } from "../../../types/reports";
import type {
    FunnelCheckRow,
    ValidationIssue,
} from "./report_validation_types";
import { safeNumber } from "./validation_utils";

type MakeIssue = (
    id: string,
    severity: "Critical" | "Warning" | "Info",
    title: string,
    meaning: string,
    action: string,
) => ValidationIssue;

export function buildFunnelChecks(
    report: GeneratedReport,
    issues: ValidationIssue[],
    makeIssue: MakeIssue,
): FunnelCheckRow[] {
    const funnelChecks: FunnelCheckRow[] = [];

    // NOTE: In your report model the top-of-funnel is named "new" (not "captured").
    const total = safeNumber((report.funnel as any)?.new, 0);
    const engaged = safeNumber(report.funnel?.engaged, 0);
    const qualified = safeNumber(report.funnel?.qualified, 0);
    const converted = safeNumber(report.funnel?.converted, 0);

    // Contacted may be optional in some reports.
    const hasContacted = Object.prototype.hasOwnProperty.call(
        report.funnel as any,
        "contacted",
    );
    const contacted = hasContacted
        ? safeNumber((report.funnel as any).contacted, 0)
        : null;

    // Monotonic stage ordering: New ≥ Contacted ≥ Engaged ≥ Qualified ≥ Converted
    // (Contacted is optional)
    let monotonicOk = true;

    if (contacted !== null && contacted < engaged) monotonicOk = false;
    if (engaged < qualified) monotonicOk = false;
    if (qualified < converted) monotonicOk = false;

    if (total < engaged || total < qualified || total < converted)
        monotonicOk = false;
    if (contacted !== null && total < contacted) monotonicOk = false;

    if (!monotonicOk) {
        issues.push(
            makeIssue(
                "funnel-monotonic",
                "Critical",
                "Funnel stages are not monotonic",
                "A later stage has more leads than an earlier stage. This usually indicates stage mapping or calculation errors.",
                "Check stage definitions and mapping (Engaged → Qualified → Converted). Verify the generator is using correct status rules.",
            ),
        );
    }

    // FunnelCheckRow in your project does NOT have expected/actual,
    // so we store the important information as a readable details string.
    funnelChecks.push({
        label: "Funnel stage ordering",
        status: monotonicOk ? "Pass" : "Fail",
        details:
            contacted === null
                ? `Expected: New ≥ Engaged ≥ Qualified ≥ Converted. Actual: New=${total}, Engaged=${engaged}, Qualified=${qualified}, Converted=${converted}. (Contacted not stored)`
                : `Expected: New ≥ Contacted ≥ Engaged ≥ Qualified ≥ Converted. Actual: New=${total}, Contacted=${contacted}, Engaged=${engaged}, Qualified=${qualified}, Converted=${converted}.`,
    });

    // Additional hard sanity checks
    if (converted > total) {
        issues.push(
            makeIssue(
                "converted-mismatch",
                "Critical",
                "Converted exceeds total leads",
                "Converted leads cannot exceed total leads in scope.",
                "Check conversion flag/status mapping and scoped lead counting.",
            ),
        );
    }

    if (
        engaged > total ||
        qualified > total ||
        (contacted !== null && contacted > total)
    ) {
        issues.push(
            makeIssue(
                "total-mismatch",
                "Critical",
                "A funnel stage exceeds total leads",
                "One of the funnel stage counts is larger than New (total leads in scope).",
                "Check stage mapping logic and ensure counts are calculated from the same scoped dataset.",
            ),
        );
    }

    return funnelChecks;
}
