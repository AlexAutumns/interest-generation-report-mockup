// app/pages/preview/report-validation/report_validation_types.ts
//
// Types used by the Report Validation page.
// Keep these separate so UI stays clean and helpers stay testable.

export type ValidationSeverity = "Critical" | "Warning" | "Info";
export type ValidationHealth = "Healthy" | "Warning" | "Critical";

export type ValidationIssue = {
    id: string;
    severity: ValidationSeverity;

    // Business-friendly title
    title: string;

    // Plain language: what it means
    meaning: string;

    // Plain language: what to do next
    action: string;

    // Optional extra context for you (not mandatory to show in UI)
    details?: string;
};

export type ReconciliationRow = {
    label: string; // e.g. "Channels", "Campaigns"
    expectedTotal: number; // total leads
    actualTotal: number; // sum of table leads
    status: "Pass" | "Warn";
    note?: string; // e.g. "1 lead is missing a region"
};

export type FunnelCheckRow = {
    label: string; // e.g. "Captured ≥ Contacted"
    status: "Pass" | "Fail";
    details: string;
};

export type CompletenessRow = {
    label: string; // e.g. "Campaign coverage"
    status: "Pass" | "Warn" | "Info";
    details: string;
};

export type LabelVariantItem = {
    label: string; // original label as shown in tables
    leads: number; // how many leads are under this label
};

export type LabelVariantGroup = {
    field: "Channel" | "Campaign" | "Region" | "Agent";
    normalizedKey: string; // e.g. "facebook"
    variants: LabelVariantItem[]; // e.g. Facebook / FB / Facebook␠
    totalLeads: number; // sum of variants leads
};

export type ExplainerItem = {
    title: string;
    definition: string;
    formula: string;
    example?: string;
};

export type ReportValidationModel = {
    health: ValidationHealth;
    issues: ValidationIssue[];

    funnelChecks: FunnelCheckRow[];
    reconciliation: ReconciliationRow[];

    completeness: CompletenessRow[];

    // NEW: shows likely duplicates like "FB" vs "Facebook"
    labelVariants: LabelVariantGroup[];

    explainers: ExplainerItem[];
};
