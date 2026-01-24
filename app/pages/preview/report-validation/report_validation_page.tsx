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
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { cn } from "../../../utils/cn";
import { useReportByIdSafe } from "../../../services/report_repository";
import { buildReportValidationModel } from "./report_validation_helpers";
import { buildFilterSummary, detectFallbackFlags } from "./validation_filters";

import {
    HealthContextCard,
    PriorityFixesCard,
    IssuesCard,
    LabelVariantsCard,
    CompletenessCard,
    FunnelChecksCard,
    ReconciliationCard,
    ExplainersCard,
} from "./report_validation_sections";

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
    children?: ReactNode;
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

                <PriorityFixesCard model={model} />

                <HealthContextCard
                    report={report}
                    model={model}
                    filterSummary={filterSummary}
                    fallbacks={fallbacks}
                />
            </div>

            {/* Middle row: Funnel + reconciliation */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                <FunnelChecksCard rows={model.funnelChecks} />

                <ReconciliationCard rows={model.reconciliation} />
            </div>

            {/* Data completeness */}
            <CompletenessCard rows={model.completeness} />

            <IssuesCard issues={model.issues} />

            <LabelVariantsCard
                reportName={report.name}
                periodLabel={report.periodLabel}
                labelVariants={model.labelVariants}
            />

            {/* Calculation explainer */}
            <ExplainersCard items={model.explainers} />
        </div>
    );
}
