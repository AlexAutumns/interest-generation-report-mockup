import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
    CheckCircle2,
    Loader2,
    FileText,
    Database,
    BarChart3,
    Send,
} from "lucide-react";

import { useGenerateReportStore } from "../../state/generate_report_store";
import { reportRepository, useReports } from "../../services/report_repository";
import type { GeneratedReport, ReportSummary } from "../../types/reports";

type StepKey = "compile" | "compute" | "render" | "publish";

type Step = {
    key: StepKey;
    title: string;
    description: string;
    icon: any;
    ms: number;
};

function cardClass() {
    return "rounded-xl border border-gray-200 bg-white p-6 shadow-sm";
}

function buildMockReportId() {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const rand = Math.floor(Math.random() * 900 + 100);
    return `RPT-${yyyy}${mm}${dd}-${rand}`;
}

function buildMockReportFromLatest(
    latest: GeneratedReport,
    newId: string
): GeneratedReport {
    // Clone the latest mock report but update id/time/name a bit
    const nowIso = new Date().toISOString();
    return {
        ...latest,
        id: newId,
        name: latest.name.replace(
            /^Interest Generation Report/i,
            "Interest Generation Report"
        ),
        generatedOn: nowIso,
        status: "Completed",
    };
}

function buildSummaryFromReport(r: GeneratedReport): ReportSummary {
    return {
        id: r.id,
        name: r.name,
        type: r.type,
        periodLabel: r.periodLabel,
        periodStart: r.periodStart,
        periodEnd: r.periodEnd,
        generatedOn: r.generatedOn,
        generatedBy: r.generatedBy,
        status: r.status,
        metricsPreview: {
            totalLeads: r.executiveSummary.totalLeads,
            convertedLeads: r.executiveSummary.convertedLeads,
            conversionRate: r.executiveSummary.conversionRate,
            topChannel: r.executiveSummary.topChannel,
        },
    };
}

export default function GenerateLoadingPage() {
    const navigate = useNavigate();

    const { lastSettings } = useGenerateReportStore();
    const reports = useReports();
    const latest = useMemo(() => reports?.[0], [reports]);

    const steps: Step[] = [
        {
            key: "compile",
            title: "Compiling data",
            description:
                "Collecting leads and related activity within the selected period.",
            icon: Database,
            ms: 900,
        },
        {
            key: "compute",
            title: "Computing KPIs",
            description:
                "Calculating totals, conversion rate, SLAs, and breakdowns.",
            icon: BarChart3,
            ms: 1000,
        },
        {
            key: "render",
            title: "Preparing report package",
            description:
                "Building the JSON report object and export-ready structure.",
            icon: FileText,
            ms: 900,
        },
        {
            key: "publish",
            title: "Publishing",
            description: "Saving to archive and preparing preview pages.",
            icon: Send,
            ms: 700,
        },
    ];

    const [currentIdx, setCurrentIdx] = useState(0);

    useEffect(() => {
        // If user lands here without settings, push them back.
        if (!lastSettings) {
            toast.info("No report settings found", {
                description: "Please configure the report first.",
            });
            navigate("/generate");
            return;
        }

        if (!latest) {
            toast.error("No base report found", {
                description: "Seed data is missing.",
            });
            navigate("/home");
            return;
        }

        let cancelled = false;
        let timer: number | undefined;

        const run = async () => {
            for (let i = 0; i < steps.length; i++) {
                if (cancelled) return;
                setCurrentIdx(i);
                await new Promise((res) => {
                    timer = window.setTimeout(res, steps[i].ms);
                });
            }

            if (cancelled) return;

            // MOCK generation: copy latest report and treat as newly generated.
            const newId = buildMockReportId();
            const newReport = buildMockReportFromLatest(latest, newId);
            const newSummary = buildSummaryFromReport(newReport);

            reportRepository.addGeneratedReport(newReport, newSummary);

            toast.success("Report generated", {
                description: "Redirecting to Executive Summary…",
            });

            navigate(
                `/preview/executive-summary?reportId=${encodeURIComponent(newId)}`
            );
        };

        run();

        return () => {
            cancelled = true;
            if (timer) window.clearTimeout(timer);
        };
    }, [lastSettings, latest, navigate]);

    const progressPct = Math.round(((currentIdx + 1) / steps.length) * 100);

    return (
        <div className="flex flex-col gap-6">
            <div className={cardClass()}>
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <div className="text-xl font-semibold text-[#193E6B]">
                            Generating report…
                        </div>
                        <div className="mt-1 text-sm text-gray-600">
                            This page will run the generation pipeline (mock
                            now, real service later).
                        </div>
                    </div>

                    <div className="rounded-full bg-[#B3A125]/15 px-3 py-1 text-xs font-semibold text-[#193E6B]">
                        {progressPct}%
                    </div>
                </div>

                <div className="mt-4 rounded-lg bg-[#F5F5F5] p-3 ring-1 ring-gray-200">
                    <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Current request
                    </div>
                    <div className="mt-1 text-sm font-semibold text-[#193E6B]">
                        Type: {lastSettings?.reportType} • Scope:{" "}
                        {lastSettings?.scopeMode}
                    </div>
                    <div className="mt-1 text-xs text-gray-600">
                        Exports:{" "}
                        {(lastSettings?.exports ?? []).join(", ").toUpperCase()}{" "}
                        • JSON report object: always
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: 0.05 }}
                    className={`lg:col-span-8 ${cardClass()}`}
                >
                    <div className="text-base font-semibold text-[#193E6B]">
                        Pipeline steps
                    </div>
                    <div className="mt-1 text-sm text-gray-600">
                        Mimics the real report compilation flow.
                    </div>

                    <div className="mt-4 space-y-2">
                        {steps.map((s, idx) => {
                            const Icon = s.icon;
                            const isDone = idx < currentIdx;
                            const isActive = idx === currentIdx;

                            return (
                                <div
                                    key={s.key}
                                    className={`flex items-start gap-3 rounded-md border px-3 py-3 ${
                                        isActive
                                            ? "border-[#B3A125]/45 bg-[#B3A125]/10"
                                            : "border-gray-200 bg-white"
                                    }`}
                                >
                                    <div className="mt-0.5">
                                        {isDone ? (
                                            <CheckCircle2 className="h-5 w-5 text-[#B3A125]" />
                                        ) : isActive ? (
                                            <Loader2 className="h-5 w-5 animate-spin text-[#193E6B]" />
                                        ) : (
                                            <Icon className="h-5 w-5 text-[#193E6B]/70" />
                                        )}
                                    </div>

                                    <div className="min-w-0">
                                        <div className="text-sm font-semibold text-[#193E6B]">
                                            {s.title}
                                        </div>
                                        <div className="mt-0.5 text-sm text-gray-600">
                                            {s.description}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: 0.08 }}
                    className={`lg:col-span-4 ${cardClass()}`}
                >
                    <div className="text-base font-semibold text-[#193E6B]">
                        What happens next?
                    </div>
                    <div className="mt-1 text-sm text-gray-600">
                        After this mock pipeline, you’ll be redirected to the
                        report preview.
                    </div>

                    <div className="mt-4 space-y-2 text-sm">
                        <div className="rounded-md border border-gray-200 bg-white p-3">
                            <div className="text-xs text-gray-500">Creates</div>
                            <div className="font-semibold text-[#193E6B]">
                                GeneratedReport (JSON)
                            </div>
                        </div>
                        <div className="rounded-md border border-gray-200 bg-white p-3">
                            <div className="text-xs text-gray-500">Updates</div>
                            <div className="font-semibold text-[#193E6B]">
                                Archive + Home recent list
                            </div>
                        </div>
                        <div className="rounded-md border border-[#B3A125]/35 bg-[#B3A125]/10 p-3 text-xs text-[#193E6B]">
                            Later: This page will call a real generation service
                            that queries Dataverse and computes KPIs.
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
