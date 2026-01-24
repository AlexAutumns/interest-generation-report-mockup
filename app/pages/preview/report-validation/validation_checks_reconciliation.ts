// app/pages/preview/report-validation/validation_checks_reconciliation.ts
//
// Reconciliation checks:
// - Do grouped-table sums (channels/campaigns/regions/agents) match funnel totals?
// - Are there obvious mismatches between related aggregates?
//
// This file should NOT change logic — it just hosts code extracted from the main builder.

import type { GeneratedReport } from "../../../types/reports";
import type {
    ReconciliationRow,
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

function sumLeads(rows: any[] | undefined): number {
    if (!rows || rows.length === 0) return 0;
    return rows.reduce((s, r) => s + safeNumber((r as any).leads, 0), 0);
}

export function buildReconciliationChecks(
    report: GeneratedReport,
    issues: ValidationIssue[],
    makeIssue: MakeIssue,
): ReconciliationRow[] {
    const reconciliation: ReconciliationRow[] = [];

    // Funnel totals (NOTE: your model uses funnel.new as total)
    const total = safeNumber((report.funnel as any)?.new, 0);

    // Grouped sums
    const channelsSum = sumLeads((report as any).channels);
    const campaignsSum = sumLeads((report as any).campaigns);
    const regionsSum = sumLeads((report as any).regions);
    const agentsSum = sumLeads((report as any).agents);

    // Add reconciliation rows (shape should match your ReconciliationRow type)
    // If your row type differs (e.g., uses 'details' instead of 'notes'),
    // keep it consistent with your existing implementation when you paste code in R8B.
    reconciliation.push({
        label: "Channels sum vs Total",
        status: channelsSum === total ? "Pass" : "Warn",
        details: `Channels sum = ${channelsSum}, Total(New) = ${total}`,
    } as any);

    reconciliation.push({
        label: "Campaigns sum vs Total",
        status: campaignsSum === total ? "Pass" : "Warn",
        details: `Campaigns sum = ${campaignsSum}, Total(New) = ${total}`,
    } as any);

    reconciliation.push({
        label: "Regions sum vs Total",
        status: regionsSum === total ? "Pass" : "Warn",
        details: `Regions sum = ${regionsSum}, Total(New) = ${total}`,
    } as any);

    reconciliation.push({
        label: "Agents sum vs Total",
        status: agentsSum === total ? "Pass" : "Warn",
        details: `Agents sum = ${agentsSum}, Total(New) = ${total}`,
    } as any);

    // If mismatches are large, raise an issue (keep thresholds same as your current code)
    const mismatches = [
        { id: "recon-channels", name: "Channels", sum: channelsSum },
        { id: "recon-campaigns", name: "Campaigns", sum: campaignsSum },
        { id: "recon-regions", name: "Regions", sum: regionsSum },
        { id: "recon-agents", name: "Agents", sum: agentsSum },
    ].filter((x) => x.sum !== total);

    if (mismatches.length > 0) {
        issues.push(
            makeIssue(
                "recon-mismatch",
                "Warning",
                "Grouped totals do not match Total leads",
                `Some grouped breakdowns sum to a different total than the funnel Total(New). This can happen when leads have missing labels or when some rows are excluded from grouping.`,
                "Check missing/unknown values (Data completeness) and label normalization hints. Re-generate after cleanup.",
            ),
        );
    }

    return reconciliation;
}
