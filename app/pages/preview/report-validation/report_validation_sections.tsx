// app/pages/preview/report-validation/report_validation_sections.tsx
//
// Large UI sections for the Report Validation page.
// We keep the main page file small by extracting “cards/sections” here.
//
// NOTE: This file is intentionally minimal (only 2 sections for now).
// We'll move other sections later.

import { motion } from "framer-motion";
import type { GeneratedReport } from "../../../types/reports";
import type {
    ReportFilterSummary,
    ReportFallbackFlags,
} from "./validation_filters";
import type { ReportValidationModel } from "./report_validation_types";

import { Copy } from "lucide-react";
import { toast } from "sonner";
import type {
    LabelVariantGroup,
    ValidationIssue,
    CompletenessRow,
    FunnelCheckRow,
    ReconciliationRow,
    ExplainerItem,
} from "./report_validation_types";

import { cn } from "../../../utils/cn";
import type { ReactNode } from "react";

function Card({
    title,
    subtitle,
    children,
    className,
}: {
    title: string;
    subtitle?: string;
    children?: ReactNode;
    className?: string;
}) {
    return (
        <div
            className={cn(
                "rounded-xl border border-gray-200 bg-white p-5 shadow-sm flex flex-col h-full",
                className,
            )}
        >
            <div className="flex flex-col gap-1">
                <div className="text-sm font-semibold text-[#193E6B]">
                    {title}
                </div>
                {subtitle && (
                    <div className="text-xs text-gray-600">{subtitle}</div>
                )}
            </div>

            {/* flex-1 allows the card body to stretch when the grid row stretches */}
            <div className="mt-4 flex-1">{children}</div>
        </div>
    );
}

type ValidationSummaryCardProps = {
    issues: {
        id: string;
        title: string;
        severity: "Critical" | "Warning" | "Info";
        meaning: string;
        action: string;
        details?: string;
    }[];
};

export function ValidationSummaryCard({ issues }: ValidationSummaryCardProps) {
    const critical = issues.filter((i) => i.severity === "Critical").length;
    const warning = issues.filter((i) => i.severity === "Warning").length;
    const info = issues.filter((i) => i.severity === "Info").length;

    return (
        <motion.div
            className="h-full"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, delay: 0.03 }}
            whileHover={{ y: -2 }}
        >
            <Card
                className="h-full"
                title="Validation summary"
                subtitle="A quick overview of the most important checks."
            >
                <div className="flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-[#F5F5F5] px-2 py-1 font-semibold text-gray-700 ring-1 ring-gray-200">
                        Critical: {critical}
                    </span>
                    <span className="rounded-full bg-[#F5F5F5] px-2 py-1 font-semibold text-gray-700 ring-1 ring-gray-200">
                        Warning: {warning}
                    </span>
                    <span className="rounded-full bg-[#F5F5F5] px-2 py-1 font-semibold text-gray-700 ring-1 ring-gray-200">
                        Info: {info}
                    </span>
                </div>

                {issues.length === 0 ? (
                    <div className="mt-4 rounded-lg bg-[#F5F5F5] p-4 text-sm text-gray-700 ring-1 ring-gray-200">
                        No issues detected.
                    </div>
                ) : (
                    <div className="mt-4 divide-y divide-gray-200 rounded-lg border border-gray-200">
                        {issues.slice(0, 6).map((issue) => (
                            <div key={issue.id} className="p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="text-sm font-semibold text-[#193E6B]">
                                        {issue.title}
                                    </div>
                                    <span className="rounded-full bg-[#F5F5F5] px-2 py-0.5 text-xs font-semibold text-gray-700 ring-1 ring-gray-200">
                                        {issue.severity}
                                    </span>
                                </div>
                                <div className="mt-2 text-sm text-gray-700">
                                    <span className="font-semibold">
                                        Meaning:
                                    </span>{" "}
                                    {issue.meaning}
                                </div>
                                <div className="mt-1 text-sm text-gray-700">
                                    <span className="font-semibold">
                                        Action:
                                    </span>{" "}
                                    {issue.action}
                                </div>
                                {issue.details && (
                                    <div className="mt-2 text-xs text-gray-500">
                                        {issue.details}
                                    </div>
                                )}
                            </div>
                        ))}
                        {issues.length > 6 && (
                            <div className="p-3 text-xs text-gray-600">
                                Showing 6 of {issues.length} issues. See the
                                full list below.
                            </div>
                        )}
                    </div>
                )}
            </Card>
        </motion.div>
    );
}

type HealthContextCardProps = {
    report: GeneratedReport;
    model: ReportValidationModel;
    filterSummary: ReportFilterSummary;
    fallbacks: ReportFallbackFlags;
};

export function HealthContextCard(props: HealthContextCardProps) {
    const { report, model, filterSummary, fallbacks } = props;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22 }}
            whileHover={{ y: -2 }}
            className="h-full"
        >
            <Card
                title="Health & context"
                subtitle="High-level summary of report integrity and scope."
                className="h-full"
            >
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div className="rounded-lg bg-[#F5F5F5] p-4 ring-1 ring-gray-200">
                        <div className="text-xs font-semibold text-gray-600">
                            Overall health
                        </div>
                        <div className="mt-1 text-lg font-semibold text-[#193E6B]">
                            {model.health}
                        </div>

                        <div className="mt-2 text-sm font-semibold text-[#193E6B]">
                            Data quality score: {model.dataQualityScore}/100
                        </div>
                        <div className="mt-1 text-xs text-[#193E6B]/80">
                            Based on missing/unknown values in key fields.
                        </div>
                    </div>

                    <div className="rounded-lg bg-[#F5F5F5] p-4 ring-1 ring-gray-200">
                        <div className="text-xs font-semibold text-gray-600">
                            Period
                        </div>
                        <div className="mt-1 text-sm font-semibold text-[#193E6B]">
                            {report.periodLabel}
                        </div>

                        <div className="mt-2 text-xs text-gray-700">
                            <span className="font-semibold">
                                Filters applied to this report:
                            </span>{" "}
                            {filterSummary.appliedToReport === null
                                ? "Unknown (older report)"
                                : filterSummary.appliedToReport
                                  ? "Yes"
                                  : "No"}
                        </div>

                        {filterSummary.appliedToReport === false &&
                            filterSummary.scopeMode === "filtered" && (
                                <div className="mt-1 text-xs text-gray-600">
                                    Note: filters were configured but not
                                    applied to the report dataset
                                    (applyFiltersTo ={" "}
                                    {filterSummary.applyFiltersTo}).
                                </div>
                            )}
                    </div>
                </div>

                <div className="mt-4 rounded-lg bg-[#F5F5F5] p-4 ring-1 ring-gray-200">
                    <div className="text-xs font-semibold text-gray-600">
                        Data availability
                    </div>

                    <div className="mt-2 grid grid-cols-1 gap-2 text-sm text-gray-700 sm:grid-cols-3">
                        <div>
                            <span className="font-semibold">Contacted:</span>{" "}
                            {fallbacks.contactedMissing ? "Missing" : "Stored"}
                        </div>
                        <div>
                            <span className="font-semibold">Score bins:</span>{" "}
                            {fallbacks.leadScoreBinsMissing
                                ? "Missing"
                                : "Stored"}
                        </div>
                        <div>
                            <span className="font-semibold">Trend series:</span>{" "}
                            {fallbacks.trendMissing ? "Missing" : "Stored"}
                        </div>
                    </div>

                    <div className="mt-4 rounded-lg border border-[#B3A125]/25 bg-[#B3A125]/10 p-3 text-xs text-[#193E6B]">
                        <div className="font-semibold">Quick actions</div>

                        <ul className="mt-2 list-disc space-y-1 pl-4">
                            <li>
                                If you see missing{" "}
                                <span className="font-semibold">Channel</span>,{" "}
                                <span className="font-semibold">Region</span>,
                                or <span className="font-semibold">Status</span>
                                , assign these fields before the next reporting
                                cycle.
                            </li>
                            <li>
                                If you see duplicates like “FB” vs “Facebook”,
                                normalize labels in the source system (choose
                                one standard label).
                            </li>
                            <li>
                                Re-generate the report after cleanup to confirm
                                the issues are resolved.
                            </li>
                            <li>
                                If funnel stages look inconsistent, review the
                                status workflow (Engaged → Qualified →
                                Converted) and update records accordingly.
                            </li>
                        </ul>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
}

type PriorityFixesCardProps = {
    model: ReportValidationModel;
};

export function PriorityFixesCard(props: PriorityFixesCardProps) {
    const { model } = props;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, delay: 0.05 }}
            whileHover={{ y: -2 }}
            className="h-full"
        >
            <Card
                title="Top priority fixes"
                subtitle="Auto-selected actions to improve report accuracy and data quality."
                className="h-full"
            >
                {model.priorityFixes.length === 0 ? (
                    <div className="rounded-lg bg-[#F5F5F5] p-4 text-sm text-gray-700 ring-1 ring-gray-200">
                        No priority fixes detected.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {model.priorityFixes.map((f, idx) => (
                            <div
                                key={`${f.title}-${idx}`}
                                className="rounded-lg bg-[#F5F5F5] p-4 text-sm text-gray-700 ring-1 ring-gray-200"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="font-semibold text-[#193E6B]">
                                        {idx + 1}. {f.title}
                                    </div>
                                    <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-gray-700 ring-1 ring-gray-200">
                                        {f.severity}
                                    </span>
                                </div>

                                <div className="mt-2 text-sm">
                                    <span className="font-semibold">Why:</span>{" "}
                                    {f.reason}
                                </div>
                                <div className="mt-1 text-sm">
                                    <span className="font-semibold">
                                        Action:
                                    </span>{" "}
                                    {f.action}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </motion.div>
    );
}

type IssuesCardProps = {
    issues: ValidationIssue[];
};

export function IssuesCard(props: IssuesCardProps) {
    const { issues } = props;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, delay: 0.08 }}
            whileHover={{ y: -2 }}
            className="h-full"
        >
            <Card
                title="Validation issues"
                subtitle="Potential problems that can affect report accuracy."
                className="h-full"
            >
                {issues.length === 0 ? (
                    <div className="rounded-lg bg-[#F5F5F5] p-4 text-sm text-gray-700 ring-1 ring-gray-200">
                        No issues detected.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {issues.map((i) => (
                            <div
                                key={i.id}
                                className="rounded-lg bg-[#F5F5F5] p-4 text-sm text-gray-700 ring-1 ring-gray-200"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="font-semibold text-[#193E6B]">
                                        {i.title}
                                    </div>
                                    <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-gray-700 ring-1 ring-gray-200">
                                        {i.severity}
                                    </span>
                                </div>

                                <div className="mt-2 text-sm">
                                    <span className="font-semibold">
                                        Meaning:
                                    </span>{" "}
                                    {i.meaning}
                                </div>
                                <div className="mt-1 text-sm">
                                    <span className="font-semibold">
                                        Action:
                                    </span>{" "}
                                    {i.action}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </motion.div>
    );
}

type LabelVariantsCardProps = {
    reportName: string;
    periodLabel: string;
    labelVariants: LabelVariantGroup[];
};

export function LabelVariantsCard(props: LabelVariantsCardProps) {
    const { reportName, periodLabel, labelVariants } = props;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, delay: 0.1 }}
            whileHover={{ y: -2 }}
            className="h-full"
        >
            <Card
                title="Label normalization hints"
                subtitle="Detects likely duplicate labels (e.g., 'FB' vs 'Facebook') that split your totals."
                className="h-full"
            >
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-xs text-gray-600">
                        Showing top {Math.min(10, labelVariants.length)} groups
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            if (labelVariants.length === 0) {
                                toast.info("No suggested mappings found", {
                                    description:
                                        "No likely duplicate labels were detected.",
                                });
                                return;
                            }

                            const lines = labelVariants
                                .slice(0, 30)
                                .flatMap((g) => {
                                    if (!g.aliases || g.aliases.length === 0)
                                        return [];
                                    return g.aliases.map((a) => {
                                        return `• ${g.field}: "${a.label}" → "${g.canonical}" (${a.leads} leads)`;
                                    });
                                });

                            const text = [
                                `Suggested label mappings: ${reportName} (${periodLabel})`,
                                "",
                                ...lines,
                            ].join("\n");

                            if (navigator?.clipboard?.writeText) {
                                navigator.clipboard
                                    .writeText(text)
                                    .then(() =>
                                        toast.success("Mappings copied"),
                                    )
                                    .catch(() =>
                                        toast.info("Copy failed", {
                                            description:
                                                "Please copy the mappings manually from the page.",
                                        }),
                                    );
                            } else {
                                toast.info("Copy not supported", {
                                    description:
                                        "Please copy the mappings manually from the page.",
                                });
                            }
                        }}
                        className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-[#193E6B] hover:bg-gray-50"
                    >
                        <Copy className="h-4 w-4 text-[#193E6B]/70" />
                        Copy mappings
                    </button>
                </div>

                {labelVariants.length === 0 ? (
                    <div className="mt-4 rounded-lg bg-[#F5F5F5] p-4 text-sm text-gray-700 ring-1 ring-gray-200">
                        No likely duplicate labels detected.
                    </div>
                ) : (
                    <div className="mt-4 space-y-3">
                        {labelVariants.slice(0, 10).map((g) => (
                            <div
                                key={`${g.field}-${g.normalizedKey}`}
                                className="rounded-lg bg-[#F5F5F5] p-4 text-sm text-gray-700 ring-1 ring-gray-200"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="font-semibold text-[#193E6B]">
                                        {g.field}: “{g.canonical}”
                                    </div>
                                    <div className="text-xs font-semibold text-gray-700">
                                        {g.totalLeads} leads
                                    </div>
                                </div>

                                <div className="mt-2 text-xs text-gray-600">
                                    Variants detected:
                                </div>

                                <div className="mt-2 space-y-1 text-sm">
                                    {g.variants.map((v) => (
                                        <div
                                            key={v.label}
                                            className="flex justify-between gap-3"
                                        >
                                            <div className="truncate">
                                                “{v.label}”
                                            </div>
                                            <div className="font-semibold">
                                                {v.leads}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-3 text-xs text-gray-700">
                                    <div className="font-semibold text-[#193E6B]">
                                        Suggested standard label:
                                    </div>
                                    <div className="mt-1 rounded-md bg-white px-2 py-1 text-xs font-semibold text-gray-800 ring-1 ring-gray-200">
                                        {g.canonical}
                                    </div>

                                    {g.aliases.length > 0 && (
                                        <div className="mt-2">
                                            <div className="font-semibold text-[#193E6B]">
                                                Map these into “{g.canonical}”:
                                            </div>
                                            <div className="mt-1 space-y-1">
                                                {g.aliases.map((a) => (
                                                    <div
                                                        key={a.label}
                                                        className="flex justify-between gap-3"
                                                    >
                                                        <div className="truncate">
                                                            “{a.label}” → “
                                                            {g.canonical}”
                                                        </div>
                                                        <div className="font-semibold">
                                                            {a.leads}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </motion.div>
    );
}

type CompletenessCardProps = {
    rows: CompletenessRow[];
};

export function CompletenessCard(props: CompletenessCardProps) {
    const { rows } = props;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, delay: 0.12 }}
            whileHover={{ y: -2 }}
            className="h-full"
        >
            <Card
                title="Data completeness"
                subtitle="Checks for missing or invalid values in key fields."
                className="h-full"
            >
                <div className="space-y-2">
                    {rows.map((r, idx) => (
                        <div
                            key={`${r.label}-${idx}`}
                            className="rounded-lg bg-[#F5F5F5] p-4 text-sm text-gray-700 ring-1 ring-gray-200"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="font-semibold text-[#193E6B]">
                                    {r.label}
                                </div>
                                <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-gray-700 ring-1 ring-gray-200">
                                    {r.status}
                                </span>
                            </div>
                            <div className="mt-2 text-sm">{r.details}</div>
                        </div>
                    ))}
                </div>
            </Card>
        </motion.div>
    );
}

type FunnelChecksCardProps = {
    rows: FunnelCheckRow[];
};

export function FunnelChecksCard(props: FunnelChecksCardProps) {
    const { rows } = props;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, delay: 0.14 }}
            whileHover={{ y: -2 }}
            className="h-full"
        >
            <Card
                title="Funnel integrity"
                subtitle="Validates that funnel stages are ordered and plausible."
                className="h-full"
            >
                <div className="space-y-2">
                    {rows.map((r, idx) => (
                        <div
                            key={`${r.label}-${idx}`}
                            className="rounded-lg bg-[#F5F5F5] p-4 text-sm text-gray-700 ring-1 ring-gray-200"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="font-semibold text-[#193E6B]">
                                    {r.label}
                                </div>
                                <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-gray-700 ring-1 ring-gray-200">
                                    {r.status}
                                </span>
                            </div>
                            <div className="mt-2 text-sm">{r.details}</div>
                        </div>
                    ))}
                </div>
            </Card>
        </motion.div>
    );
}

type ReconciliationCardProps = {
    rows: ReconciliationRow[];
};

export function ReconciliationCard(props: ReconciliationCardProps) {
    const { rows } = props;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, delay: 0.16 }}
            whileHover={{ y: -2 }}
            className="h-full"
        >
            <Card
                title="Reconciliation"
                subtitle="Cross-checks totals across breakdown tables to detect inconsistencies."
                className="h-full"
            >
                <div className="space-y-2">
                    {rows.map((r, idx) => (
                        <div
                            key={`${r.label}-${idx}`}
                            className="rounded-lg bg-[#F5F5F5] p-4 text-sm text-gray-700 ring-1 ring-gray-200"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="font-semibold text-[#193E6B]">
                                    {r.label}
                                </div>
                                <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-gray-700 ring-1 ring-gray-200">
                                    {r.status}
                                </span>
                            </div>
                            <div className="mt-2 text-sm">{r.details}</div>
                        </div>
                    ))}
                </div>
            </Card>
        </motion.div>
    );
}

type ExplainersCardProps = {
    items: ExplainerItem[];
};

export function ExplainersCard(props: ExplainersCardProps) {
    const { items } = props;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, delay: 0.18 }}
            whileHover={{ y: -2 }}
            className="h-full"
        >
            <Card
                title="How metrics are calculated"
                subtitle="Plain-language definitions so non-programmers can understand the logic."
                className="h-full"
            >
                <div className="space-y-3">
                    {items.map((e, idx) => (
                        <div
                            key={`${e.title}-${idx}`}
                            className="rounded-lg bg-[#F5F5F5] p-4 text-sm text-gray-700 ring-1 ring-gray-200"
                        >
                            <div className="font-semibold text-[#193E6B]">
                                {e.title}
                            </div>

                            <div className="mt-2 text-sm">
                                <span className="font-semibold">
                                    Definition:
                                </span>{" "}
                                {e.definition}
                            </div>

                            {e.formula && (
                                <div className="mt-2 text-sm">
                                    <span className="font-semibold">
                                        Formula:
                                    </span>{" "}
                                    {e.formula}
                                </div>
                            )}

                            {e.example && (
                                <div className="mt-2 text-sm">
                                    <span className="font-semibold">
                                        Example:
                                    </span>{" "}
                                    {e.example}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </Card>
        </motion.div>
    );
}
