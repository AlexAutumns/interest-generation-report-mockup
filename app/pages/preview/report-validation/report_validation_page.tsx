// app/pages/preview/report-validation/report_validation_page.tsx
//
// Report Validation page (skeleton)
//
// Goal (MVP):
// - Show a business-friendly "health" view of the report
// - Later we will wire real checks + issue list + calculations explainer
//
// For now, we create the layout + connect to report repository (reportId).

import { Link, useSearchParams } from "react-router";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { cn } from "../../../utils/cn";
import { useReportByIdSafe } from "../../../services/report_repository";
import {
    buildReportValidationModel,
    buildFilterSummary,
    detectFallbackFlags,
} from "./report_validation_helpers";

import {
    ShieldCheck,
    ArrowLeft,
    Copy,
    Download,
    ExternalLink,
} from "lucide-react";

function buildReportValidationPath(reportId: string) {
    return `/preview/report-validation?reportId=${encodeURIComponent(reportId)}`;
}

function buildAbsoluteUrl(path: string) {
    if (typeof window === "undefined") return path;
    return `${window.location.origin}${path}`;
}

function Card({
    title,
    subtitle,
    children,
}: {
    title: string;
    subtitle?: string;
    children?: React.ReactNode;
}) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-1">
                <div className="text-sm font-semibold text-[#193E6B]">
                    {title}
                </div>
                {subtitle && (
                    <div className="text-xs text-gray-600">{subtitle}</div>
                )}
            </div>

            <div className="mt-4">{children}</div>
        </div>
    );
}

export default function ReportValidationPage() {
    const [params] = useSearchParams();
    const reportId = params.get("reportId") ?? undefined;

    const report = useReportByIdSafe(reportId);

    if (!report) {
        return (
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="text-lg font-semibold text-[#193E6B]">
                    Report Validation
                </div>
                <p className="mt-2 text-sm text-gray-600">
                    No report found. Please go back to Home or Archive and
                    select a report.
                </p>
                <div className="mt-4">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 rounded-md bg-[#193E6B] px-4 py-2 text-sm font-semibold text-white hover:bg-[#16365f]"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    const reportPath = buildReportValidationPath(report.id);

    const model = buildReportValidationModel(report);
    const filterSummary = buildFilterSummary(report);
    const fallbacks = detectFallbackFlags(report);

    function handleCopyLink() {
        const url = buildAbsoluteUrl(reportPath);

        if (navigator?.clipboard?.writeText) {
            navigator.clipboard
                .writeText(url)
                .then(() => toast.success("Page link copied"))
                .catch(() =>
                    toast.info("Copy failed", {
                        description:
                            "Please copy the link manually from the address bar.",
                    }),
                );
        } else {
            toast.info("Copy not supported", {
                description:
                    "Please copy the link manually from the address bar.",
            });
        }
    }

    function handleDownloadMock() {
        toast.info("Download is coming soon (mockup)", {
            description:
                "Validation export will be enabled after the checks are finalized.",
        });
    }

    function handleOpenNewTab() {
        const url = buildAbsoluteUrl(reportPath);
        if (typeof window !== "undefined") {
            window.open(url, "_blank", "noopener,noreferrer");
        }
        toast("Opened in a new tab", { description: report?.name });
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22 }}
                className="flex items-start justify-between gap-4"
            >
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-[#193E6B]" />
                        <h1 className="text-xl font-semibold text-[#193E6B]">
                            Report Validation
                        </h1>
                    </div>
                    <p className="text-sm text-gray-600">
                        Consistency checks, data completeness, and plain-English
                        explanations of how key metrics are calculated.
                    </p>
                    <div className="text-xs text-gray-500">
                        {report.name} • {report.periodLabel}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={handleCopyLink}
                        className={cn(
                            "inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-semibold",
                            "text-[#193E6B] hover:bg-gray-50",
                        )}
                    >
                        <Copy className="h-4 w-4 text-[#193E6B]/70" />
                        Copy link
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            const lines =
                                model.issues.length === 0
                                    ? ["No validation issues detected."]
                                    : model.issues.map((i) => {
                                          return `• [${i.severity}] ${i.title}\n  - What it means: ${i.meaning}\n  - Suggested action: ${i.action}`;
                                      });

                            const text = [
                                `Report Validation: ${report.name} (${report.periodLabel})`,
                                "",
                                ...lines,
                            ].join("\n");

                            if (navigator?.clipboard?.writeText) {
                                navigator.clipboard
                                    .writeText(text)
                                    .then(() => toast.success("Issues copied"))
                                    .catch(() =>
                                        toast.info("Copy failed", {
                                            description:
                                                "Please copy manually from the page.",
                                        }),
                                    );
                            } else {
                                toast.info("Copy not supported", {
                                    description:
                                        "Please copy manually from the page.",
                                });
                            }
                        }}
                        className={cn(
                            "inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-semibold",
                            "text-[#193E6B] hover:bg-gray-50",
                        )}
                    >
                        <Copy className="h-4 w-4 text-[#193E6B]/70" />
                        Copy issues
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            if (model.labelVariants.length === 0) {
                                toast.info("No suggested mappings found", {
                                    description:
                                        "No likely duplicate labels were detected.",
                                });
                                return;
                            }

                            const lines = model.labelVariants
                                .slice(0, 30) // prevent huge copy payloads
                                .flatMap((g) => {
                                    if (!g.aliases || g.aliases.length === 0)
                                        return [];
                                    return g.aliases.map((a) => {
                                        return `• ${g.field}: "${a.label}" → "${g.canonical}" (${a.leads} leads)`;
                                    });
                                });

                            const text = [
                                `Suggested label mappings: ${report.name} (${report.periodLabel})`,
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
                        className={cn(
                            "inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-semibold",
                            "text-[#193E6B] hover:bg-gray-50",
                        )}
                    >
                        <Copy className="h-4 w-4 text-[#193E6B]/70" />
                        Copy mappings
                    </button>

                    <button
                        type="button"
                        onClick={handleDownloadMock}
                        className={cn(
                            "inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-semibold",
                            "text-[#193E6B] hover:bg-gray-50",
                        )}
                    >
                        <Download className="h-4 w-4 text-[#193E6B]/70" />
                        Export
                    </button>

                    <button
                        type="button"
                        onClick={handleOpenNewTab}
                        className={cn(
                            "hidden items-center gap-2 rounded-md border border-[#B3A125]/35 bg-[#B3A125]/10 px-3 py-2 text-sm font-semibold",
                            "text-[#193E6B] hover:bg-[#B3A125]/15 sm:inline-flex",
                        )}
                    >
                        <ExternalLink className="h-4 w-4" />
                        New tab
                    </button>

                    <Link
                        to="/archive"
                        className="inline-flex items-center gap-2 rounded-md border border-[#B3A125]/35 bg-[#B3A125]/10 px-3 py-2 text-sm font-semibold text-[#193E6B] hover:bg-[#B3A125]/15"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Archive
                    </Link>
                </div>
            </motion.div>

            {/* Top row: Issues + Health */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, delay: 0.04 }}
                    whileHover={{ y: -2 }}
                    className="lg:col-span-8"
                >
                    <Card
                        title="Validation summary"
                        subtitle="We will list Critical / Warning / Info checks here."
                    >
                        <div className="divide-y divide-gray-200 rounded-lg border border-gray-200">
                            {model.issues.length === 0 ? (
                                <div className="p-4 text-sm text-gray-700">
                                    No issues detected.
                                </div>
                            ) : (
                                model.issues.map((issue) => (
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
                                                What it means:
                                            </span>{" "}
                                            {issue.meaning}
                                        </div>
                                        <div className="mt-1 text-sm text-gray-700">
                                            <span className="font-semibold">
                                                Suggested action:
                                            </span>{" "}
                                            {issue.action}
                                        </div>
                                        {issue.details && (
                                            <div className="mt-2 text-xs text-gray-500">
                                                {issue.details}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, delay: 0.06 }}
                    whileHover={{ y: -2 }}
                    className="lg:col-span-4"
                >
                    <Card
                        title="Health & context"
                        subtitle="Overall status + filters used."
                    >
                        <div className="space-y-3">
                            <div className="rounded-lg bg-[#B3A125]/10 p-3 ring-1 ring-[#B3A125]/25">
                                <div className="text-xs text-[#193E6B]">
                                    Overall health
                                </div>
                                <div className="mt-1 text-lg font-semibold text-[#193E6B]">
                                    {model.health}
                                </div>
                                <div className="mt-1 text-sm font-semibold text-[#193E6B]">
                                    Data quality score: {model.dataQualityScore}
                                    /100
                                </div>
                                <div className="mt-1 text-xs text-[#193E6B]/80">
                                    Based on missing/unknown values in key
                                    fields (status/channel/region/etc.).
                                </div>

                                <div className="mt-1 text-xs text-[#193E6B]">
                                    {
                                        model.issues.filter(
                                            (i) => i.severity === "Critical",
                                        ).length
                                    }{" "}
                                    critical,{" "}
                                    {
                                        model.issues.filter(
                                            (i) => i.severity === "Warning",
                                        ).length
                                    }{" "}
                                    warning,{" "}
                                    {
                                        model.issues.filter(
                                            (i) => i.severity === "Info",
                                        ).length
                                    }{" "}
                                    info
                                </div>
                            </div>

                            <div className="rounded-lg bg-[#F5F5F5] p-3 text-xs text-gray-700 ring-1 ring-gray-200">
                                <div>
                                    <span className="font-semibold">
                                        Report ID:
                                    </span>{" "}
                                    {report.id}
                                </div>
                                <div className="mt-1">
                                    <span className="font-semibold">
                                        Period:
                                    </span>{" "}
                                    {filterSummary.periodLabel}
                                </div>

                                <div className="mt-1">
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
                                            Note: filters were configured but
                                            not applied to the report dataset
                                            (applyFiltersTo ={" "}
                                            {filterSummary.applyFiltersTo}).
                                        </div>
                                    )}

                                <div className="mt-3 font-semibold text-gray-800">
                                    Filters applied
                                </div>

                                <div className="mt-1 space-y-1">
                                    <div>
                                        <span className="font-semibold">
                                            Agents:
                                        </span>{" "}
                                        {filterSummary.agents.length > 0
                                            ? filterSummary.agents.join(", ")
                                            : "All"}
                                    </div>
                                    <div>
                                        <span className="font-semibold">
                                            Statuses:
                                        </span>{" "}
                                        {filterSummary.statuses.length > 0
                                            ? filterSummary.statuses.join(", ")
                                            : "All"}
                                    </div>
                                    <div>
                                        <span className="font-semibold">
                                            Channels:
                                        </span>{" "}
                                        {filterSummary.channels.length > 0
                                            ? filterSummary.channels.join(", ")
                                            : "All"}
                                    </div>
                                    <div>
                                        <span className="font-semibold">
                                            Regions:
                                        </span>{" "}
                                        {filterSummary.regions.length > 0
                                            ? filterSummary.regions.join(", ")
                                            : "All"}
                                    </div>
                                    <div>
                                        <span className="font-semibold">
                                            Campaigns:
                                        </span>{" "}
                                        {filterSummary.campaigns.length > 0
                                            ? filterSummary.campaigns.join(", ")
                                            : "All"}
                                    </div>
                                </div>

                                <div className="mt-3 font-semibold text-gray-800">
                                    Data availability
                                </div>
                                <div className="mt-1 space-y-1">
                                    <div>
                                        <span className="font-semibold">
                                            Contacted stored:
                                        </span>{" "}
                                        {fallbacks.contactedMissing
                                            ? "No (estimated/older report)"
                                            : "Yes"}
                                    </div>
                                    <div>
                                        <span className="font-semibold">
                                            Lead score bins:
                                        </span>{" "}
                                        {fallbacks.leadScoreBinsMissing
                                            ? "No (fallback distribution)"
                                            : "Yes"}
                                    </div>
                                    <div>
                                        <span className="font-semibold">
                                            Trend series:
                                        </span>{" "}
                                        {fallbacks.trendMissing
                                            ? "No (may use placeholder)"
                                            : "Yes"}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 rounded-lg border border-[#B3A125]/25 bg-[#B3A125]/10 p-3 text-xs text-[#193E6B]">
                                <div className="font-semibold">
                                    Quick actions
                                </div>

                                <ul className="mt-2 list-disc space-y-1 pl-4">
                                    <li>
                                        If you see missing{" "}
                                        <span className="font-semibold">
                                            Channel
                                        </span>
                                        ,{" "}
                                        <span className="font-semibold">
                                            Region
                                        </span>
                                        , or{" "}
                                        <span className="font-semibold">
                                            Status
                                        </span>
                                        , assign these fields before the next
                                        reporting cycle.
                                    </li>
                                    <li>
                                        If you see duplicates like “FB” vs
                                        “Facebook”, normalize labels in the
                                        source system (choose one standard
                                        label).
                                    </li>
                                    <li>
                                        Re-generate the report after cleanup to
                                        confirm the issues are resolved.
                                    </li>
                                    <li>
                                        If funnel stages look inconsistent,
                                        review the status workflow (Engaged →
                                        Qualified → Converted) and update
                                        records accordingly.
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            </div>

            {/* Middle row: Funnel + reconciliation */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, delay: 0.08 }}
                    whileHover={{ y: -2 }}
                    className="lg:col-span-6"
                >
                    <Card
                        title="Funnel integrity"
                        subtitle="Monotonic checks + totals alignment."
                    >
                        <div className="space-y-2">
                            {model.funnelChecks.map((row) => (
                                <div
                                    key={row.label}
                                    className="flex items-start justify-between gap-3 rounded-lg bg-[#F5F5F5] p-3 text-sm text-gray-700 ring-1 ring-gray-200"
                                >
                                    <div>
                                        <div className="font-semibold text-[#193E6B]">
                                            {row.label}
                                        </div>
                                        <div className="mt-1 text-xs text-gray-600">
                                            {row.details}
                                        </div>
                                    </div>
                                    <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-gray-700 ring-1 ring-gray-200">
                                        {row.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, delay: 0.1 }}
                    whileHover={{ y: -2 }}
                    className="lg:col-span-6"
                >
                    <Card
                        title="Totals reconciliation"
                        subtitle="Do grouped totals add up to total leads?"
                    >
                        <div className="space-y-2">
                            {model.reconciliation.map((row) => (
                                <div
                                    key={row.label}
                                    className="flex items-start justify-between gap-3 rounded-lg bg-[#F5F5F5] p-3 text-sm text-gray-700 ring-1 ring-gray-200"
                                >
                                    <div>
                                        <div className="font-semibold text-[#193E6B]">
                                            {row.label}
                                        </div>
                                        <div className="mt-1 text-xs text-gray-600">
                                            Expected: {row.expectedTotal} •
                                            Actual: {row.actualTotal}
                                        </div>
                                        {row.note && (
                                            <div className="mt-1 text-xs text-gray-500">
                                                {row.note}
                                            </div>
                                        )}
                                    </div>
                                    <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-gray-700 ring-1 ring-gray-200">
                                        {row.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </motion.div>
            </div>

            {/* Data completeness */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, delay: 0.12 }}
                whileHover={{ y: -2 }}
            >
                <Card
                    title="Data completeness"
                    subtitle="Missing fields, inconsistent labels, and cleanup hints."
                >
                    <div className="space-y-2">
                        {model.completeness.map((row) => (
                            <div
                                key={row.label}
                                className="flex items-start justify-between gap-3 rounded-lg bg-[#F5F5F5] p-3 text-sm text-gray-700 ring-1 ring-gray-200"
                            >
                                <div>
                                    <div className="font-semibold text-[#193E6B]">
                                        {row.label}
                                    </div>
                                    <div className="mt-1 text-xs text-gray-600">
                                        {row.details}
                                    </div>
                                </div>
                                <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-gray-700 ring-1 ring-gray-200">
                                    {row.status}
                                </span>
                            </div>
                        ))}

                        <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4">
                            <div className="text-sm font-semibold text-[#193E6B]">
                                Top values (helps spot inconsistent labels)
                            </div>
                            <div className="mt-3 space-y-3 text-sm text-gray-700">
                                {(
                                    [
                                        "channel",
                                        "campaign",
                                        "region",
                                        "agent",
                                        "status",
                                    ] as const
                                ).map((field) => {
                                    const dq = (
                                        report as any
                                    ).dataQuality?.fields?.find(
                                        (x: any) => x.field === field,
                                    );
                                    if (!dq) return null;

                                    return (
                                        <div
                                            key={field}
                                            className="rounded-lg bg-[#F5F5F5] p-3 ring-1 ring-gray-200"
                                        >
                                            <div className="font-semibold text-[#193E6B] capitalize">
                                                {field}
                                            </div>
                                            <div className="mt-2 space-y-1 text-xs">
                                                {(dq.topValues ?? [])
                                                    .slice(0, 5)
                                                    .map((v: any) => (
                                                        <div
                                                            key={v.value}
                                                            className="flex justify-between gap-3"
                                                        >
                                                            <div className="truncate">
                                                                “{v.value}”
                                                            </div>
                                                            <div className="font-semibold">
                                                                {v.count} (
                                                                {Number(
                                                                    v.percent,
                                                                ).toFixed(1)}
                                                                %)
                                                            </div>
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </Card>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, delay: 0.13 }}
                whileHover={{ y: -2 }}
            >
                <Card
                    title="Label normalization hints"
                    subtitle="Finds likely duplicates like “FB” vs “Facebook” that split reporting."
                >
                    {model.labelVariants.length === 0 ? (
                        <div className="rounded-lg bg-[#F5F5F5] p-4 text-sm text-gray-700 ring-1 ring-gray-200">
                            No likely label duplicates detected.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {model.labelVariants.slice(0, 10).map((g) => (
                                <div
                                    key={`${g.field}:${g.normalizedKey}`}
                                    className="rounded-lg bg-[#F5F5F5] p-4 text-sm text-gray-700 ring-1 ring-gray-200"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <div className="font-semibold text-[#193E6B]">
                                                {g.field}: possible duplicates
                                            </div>
                                            <div className="mt-1 text-xs text-gray-600">
                                                Normalized key:{" "}
                                                <span className="font-mono">
                                                    {g.normalizedKey}
                                                </span>
                                            </div>
                                        </div>
                                        <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-gray-700 ring-1 ring-gray-200">
                                            {g.totalLeads} leads
                                        </span>
                                    </div>

                                    <div className="mt-3 space-y-1 text-xs text-gray-700">
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
                                                    Map these into “
                                                    {g.canonical}”:
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

                                    <div className="mt-3 text-xs text-gray-500">
                                        Suggested action: pick one label (e.g.,
                                        “Facebook”) and map the others to it.
                                    </div>
                                </div>
                            ))}

                            {model.labelVariants.length > 10 && (
                                <div className="text-xs text-gray-500">
                                    Showing top 10 groups by impact.
                                </div>
                            )}
                        </div>
                    )}
                </Card>
            </motion.div>

            {/* Calculation explainer */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, delay: 0.14 }}
                whileHover={{ y: -2 }}
            >
                <Card
                    title="How we calculate key metrics"
                    subtitle="Plain-English definitions (expandable)."
                >
                    <div className="space-y-3">
                        {model.explainers.map((x) => (
                            <div
                                key={x.title}
                                className="rounded-lg border border-[#B3A125]/25 bg-[#B3A125]/10 p-4"
                            >
                                <div className="text-sm font-semibold text-[#193E6B]">
                                    {x.title}
                                </div>
                                <div className="mt-2 text-sm text-[#193E6B]">
                                    <span className="font-semibold">
                                        Definition:
                                    </span>{" "}
                                    {x.definition}
                                </div>
                                <div className="mt-2 text-sm text-[#193E6B]">
                                    <span className="font-semibold">
                                        Formula:
                                    </span>{" "}
                                    {x.formula}
                                </div>
                                {x.example && (
                                    <div className="mt-2 text-xs text-[#193E6B]/80">
                                        <span className="font-semibold">
                                            Example:
                                        </span>{" "}
                                        {x.example}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </Card>
            </motion.div>
        </div>
    );
}
