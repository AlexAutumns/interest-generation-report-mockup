// app/pages/generate-report/generate_report_form.tsx
import { useMemo } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
    CalendarDays,
    CheckCircle2,
    FileSpreadsheet,
    FileText,
    Filter,
    Settings2,
    Sparkles,
    Wand2,
} from "lucide-react";

import { useReports } from "../../services/report_repository";

import FilterMultiSelect from "./filter_multi_select";
import { useGenerateReportStore } from "../../state/generate_report_store";
import WhatWillGeneratePanel from "./what_will_generate_panel";
import {
    buildAbsoluteUrl,
    deriveFilterOptions,
    QUARTERS,
    type ExportFormat,
    buildDefaultReportName,
} from "./generate_report_helpers";
import { generateReportSchema } from "./generate_report_schema";
import type { GenerateReportFormValues } from "./generate_report_schema";

function pillClass(active: boolean) {
    return active
        ? "bg-[#193E6B] text-white"
        : "border border-gray-200 bg-white text-[#193E6B] hover:bg-gray-50";
}

function cardClass() {
    return "rounded-xl border border-gray-200 bg-white p-5 shadow-sm";
}

export default function GenerateReportForm() {
    const navigate = useNavigate();

    const reports = useReports();
    const options = useMemo(
        () => deriveFilterOptions(reports ?? []),
        [reports]
    );

    const defaultYear = useMemo(() => new Date().getFullYear(), []);

    const { lastSettings, setLastSettings } = useGenerateReportStore();

    const fallbackDefaults: GenerateReportFormValues = {
        reportType: "weekly",
        customName: "",
        exports: ["pdf"],
        scopeMode: "all",
        applyFiltersTo: "both",
        channels: [],
        regions: [],
        campaigns: [],
        agents: [],
        statuses: [],
        includeAppendix: true,
        includeCommentaryDraft: true,
        year: defaultYear,
        quarter: "Q1",
        weekStart: "",
        weekEnd: "",
        month: "",
    };

    const form = useForm<GenerateReportFormValues>({
        resolver: zodResolver(generateReportSchema),
        defaultValues: lastSettings ?? fallbackDefaults,
        mode: "onSubmit",
    });

    const reportType = form.watch("reportType");
    const scopeMode = form.watch("scopeMode");
    const errors = form.formState.errors;

    function handleCopyLink() {
        const url = buildAbsoluteUrl("/generate");
        if (navigator?.clipboard?.writeText) {
            navigator.clipboard
                .writeText(url)
                .then(() => toast.success("Page link copied"))
                .catch(() =>
                    toast.info("Copy failed", {
                        description:
                            "Copy the link manually from the address bar.",
                    })
                );
        } else {
            toast.info("Copy not supported", {
                description: "Copy the link manually from the address bar.",
            });
        }
    }

    function toggleExport(value: ExportFormat) {
        const current = form.getValues("exports") ?? [];
        const exists = current.includes(value);
        const next = exists
            ? current.filter((x) => x !== value)
            : [...current, value];
        form.setValue("exports", next, { shouldDirty: true });
    }

    function buildMonthOptions() {
        const months = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
        ];
        const y = new Date().getFullYear();
        const years = [y - 1, y, y + 1]; // adjust if you want more
        const out: Array<{ label: string; value: string }> = [];

        for (const yr of years) {
            for (let i = 0; i < 12; i++) {
                const mm = String(i + 1).padStart(2, "0");
                out.push({ label: `${months[i]} ${yr}`, value: `${yr}-${mm}` });
            }
        }
        return out;
    }

    const monthOptions = useMemo(() => buildMonthOptions(), []);

    function onSubmit(values: GenerateReportFormValues) {
        // For now: we always produce an in-app report object (JSON) + selected exports.
        // The actual generation will later compute a new GeneratedReport from CSV/DB.
        toast.success("Report generation queued (mockup)", {
            description:
                "JSON report object will be created for in-app preview. Exports enabled later.",
        });

        setLastSettings(values);

        toast.success("Generation started (mockup)", {
            description: "Compiling data and preparing the report…",
        });
        navigate("/generate/loading");

        // Optional: inspect values during development
        console.log(values);
    }

    const values = form.watch();

    const customNameValue = form.watch("customName") ?? "";
    const customNameCount = customNameValue.trim().length;
    const customNameMax = 80;

    const defaultNamePreview = useMemo(() => {
        return buildDefaultReportName({
            reportType: values.reportType,
            weekStart: values.weekStart,
            weekEnd: values.weekEnd,
            month: values.month,
            quarter: values.quarter,
            year: values.year,
        });
    }, [
        values.reportType,
        values.weekStart,
        values.weekEnd,
        values.month,
        values.quarter,
        values.year,
    ]);

    return (
        <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid grid-cols-1 gap-6 lg:grid-cols-12"
        >
            {/* LEFT */}
            <div className="lg:col-span-8 flex flex-col gap-6">
                {/* Basics */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, delay: 0.05 }}
                    whileHover={{ y: -2 }}
                    className={cardClass()}
                >
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <Wand2 className="h-4 w-4 text-[#193E6B]" />
                                <div className="text-base font-semibold text-[#193E6B]">
                                    Report basics
                                </div>
                            </div>
                            <div className="mt-1 text-sm text-gray-600">
                                Pick a report type and select the reporting
                                period.
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleCopyLink}
                            className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-[#193E6B] hover:bg-gray-50"
                        >
                            Copy link
                        </button>
                    </div>

                    {/* Type pills */}
                    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <button
                            type="button"
                            onClick={() =>
                                form.setValue("reportType", "weekly", {
                                    shouldDirty: true,
                                })
                            }
                            className={`rounded-md px-3 py-3 text-sm font-semibold ${pillClass(reportType === "weekly")}`}
                        >
                            Weekly
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                form.setValue("reportType", "monthly", {
                                    shouldDirty: true,
                                })
                            }
                            className={`rounded-md px-3 py-3 text-sm font-semibold ${pillClass(reportType === "monthly")}`}
                        >
                            Monthly
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                form.setValue("reportType", "quarterly", {
                                    shouldDirty: true,
                                })
                            }
                            className={`rounded-md px-3 py-3 text-sm font-semibold ${pillClass(reportType === "quarterly")}`}
                        >
                            Quarterly
                        </button>
                    </div>

                    {/* Period inputs (real pickers) */}
                    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                        {reportType === "weekly" && (
                            <>
                                <div>
                                    <label className="text-sm font-semibold text-[#193E6B]">
                                        Start date
                                    </label>
                                    <div className="mt-1 flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2">
                                        <CalendarDays className="h-4 w-4 text-[#193E6B]/70" />
                                        <input
                                            type="date"
                                            className="w-full bg-transparent text-sm text-gray-900 outline-none"
                                            {...form.register("weekStart")}
                                        />
                                    </div>
                                    {errors.weekStart?.message && (
                                        <div className="mt-1 text-xs text-rose-600">
                                            {errors.weekStart.message}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="text-sm font-semibold text-[#193E6B]">
                                        End date
                                    </label>
                                    <div className="mt-1 flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2">
                                        <CalendarDays className="h-4 w-4 text-[#193E6B]/70" />
                                        <input
                                            type="date"
                                            className="w-full bg-transparent text-sm text-gray-900 outline-none"
                                            {...form.register("weekEnd")}
                                        />
                                    </div>
                                    {errors.weekEnd?.message && (
                                        <div className="mt-1 text-xs text-rose-600">
                                            {errors.weekEnd.message}
                                        </div>
                                    )}
                                </div>

                                <div className="md:col-span-2 rounded-md border border-[#B3A125]/35 bg-[#B3A125]/10 px-3 py-2 text-xs text-[#193E6B]">
                                    Tip: Use a Monday–Sunday range for weekly
                                    reporting.
                                </div>
                            </>
                        )}

                        {reportType === "monthly" && (
                            <div className="md:col-span-2">
                                <label className="text-sm font-semibold text-[#193E6B]">
                                    Month
                                </label>
                                <select
                                    className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none"
                                    {...form.register("month")}
                                >
                                    <option value="">Select a month…</option>
                                    {monthOptions.map((m) => (
                                        <option key={m.value} value={m.value}>
                                            {m.label}
                                        </option>
                                    ))}
                                </select>

                                {errors.month?.message && (
                                    <div className="mt-1 text-xs text-rose-600">
                                        {errors.month.message}
                                    </div>
                                )}
                            </div>
                        )}

                        {reportType === "quarterly" && (
                            <>
                                <div>
                                    <label className="text-sm font-semibold text-[#193E6B]">
                                        Quarter
                                    </label>
                                    <select
                                        className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none"
                                        {...form.register("quarter")}
                                    >
                                        {QUARTERS.map((q) => (
                                            <option key={q} value={q}>
                                                {q}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.quarter?.message && (
                                        <div className="mt-1 text-xs text-rose-600">
                                            {errors.quarter.message}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="text-sm font-semibold text-[#193E6B]">
                                        Year
                                    </label>
                                    <input
                                        type="number"
                                        className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none"
                                        {...form.register("year", {
                                            valueAsNumber: true,
                                        })}
                                    />
                                    {errors.year?.message && (
                                        <div className="mt-1 text-xs text-rose-600">
                                            {errors.year.message}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                    <div className="mt-4">
                        <label className="text-sm font-semibold text-[#193E6B]">
                            Report name (optional)
                        </label>
                        <input
                            type="text"
                            placeholder={defaultNamePreview}
                            className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none"
                            {...form.register("customName")}
                        />
                        <div className="mt-1 text-xs text-gray-500">
                            Leave blank to use:{" "}
                            <span className="font-semibold text-[#193E6B]">
                                {defaultNamePreview}
                            </span>
                        </div>

                        <div
                            className={`mt-1 text-xs ${
                                customNameCount > customNameMax
                                    ? "text-rose-600"
                                    : "text-gray-500"
                            }`}
                        >
                            {customNameCount}/{customNameMax} characters
                        </div>
                    </div>
                </motion.div>

                {/* Filter settings */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, delay: 0.08 }}
                    whileHover={{ y: -2 }}
                    className={cardClass()}
                >
                    <div className="flex items-center gap-2">
                        <Settings2 className="h-4 w-4 text-[#193E6B]" />
                        <div className="text-base font-semibold text-[#193E6B]">
                            Filter settings
                        </div>
                    </div>
                    <div className="mt-1 text-sm text-gray-600">
                        For management reporting, the default is to include all
                        data in the selected period.
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <div className="text-sm font-semibold text-[#193E6B]">
                                Scope mode
                            </div>
                            <div className="mt-2 grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() =>
                                        form.setValue("scopeMode", "all", {
                                            shouldDirty: true,
                                        })
                                    }
                                    className={`rounded-md px-3 py-2 text-sm font-semibold ${pillClass(scopeMode === "all")}`}
                                >
                                    All data
                                </button>
                                <button
                                    type="button"
                                    onClick={() =>
                                        form.setValue("scopeMode", "filtered", {
                                            shouldDirty: true,
                                        })
                                    }
                                    className={`rounded-md px-3 py-2 text-sm font-semibold ${pillClass(scopeMode === "filtered")}`}
                                >
                                    Advanced filters
                                </button>
                            </div>

                            <div className="mt-2 text-xs text-gray-500">
                                “All data” is recommended for KPI integrity and
                                comparisons.
                            </div>
                        </div>

                        <div>
                            <div className="text-sm font-semibold text-[#193E6B]">
                                Apply filters to
                            </div>
                            <select
                                className="mt-2 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none"
                                {...form.register("applyFiltersTo")}
                            >
                                <option value="both">Preview + exports</option>
                                <option value="preview_only">
                                    Preview only
                                </option>
                                <option value="exports_only">
                                    Exports only
                                </option>
                            </select>

                            <div className="mt-2 text-xs text-gray-500">
                                This becomes important later when stakeholders
                                want “full view” previews but filtered exports.
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Filters */}
                {scopeMode === "filtered" && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.22, delay: 0.11 }}
                        whileHover={{ y: -2 }}
                        className={cardClass()}
                    >
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-[#193E6B]" />
                            <div className="text-base font-semibold text-[#193E6B]">
                                Advanced filters
                            </div>
                        </div>
                        <div className="mt-1 text-sm text-gray-600">
                            Optional scoping for focused reviews (e.g., specific
                            agents, campaigns, or regions).
                        </div>

                        <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-2">
                            <FilterMultiSelect
                                title="Agents"
                                options={options.agentOptions}
                                value={form.watch("agents")}
                                onChange={(next) =>
                                    form.setValue("agents", next, {
                                        shouldDirty: true,
                                    })
                                }
                                placeholder="Search agents…"
                            />
                            <FilterMultiSelect
                                title="Statuses"
                                options={options.statusOptions}
                                value={form.watch("statuses")}
                                onChange={(next) =>
                                    form.setValue("statuses", next, {
                                        shouldDirty: true,
                                    })
                                }
                                placeholder="Search statuses…"
                            />
                            <FilterMultiSelect
                                title="Channels"
                                options={options.channelOptions}
                                value={form.watch("channels")}
                                onChange={(next) =>
                                    form.setValue("channels", next, {
                                        shouldDirty: true,
                                    })
                                }
                                placeholder="Search channels…"
                            />
                            <FilterMultiSelect
                                title="Regions"
                                options={options.regionOptions}
                                value={form.watch("regions")}
                                onChange={(next) =>
                                    form.setValue("regions", next, {
                                        shouldDirty: true,
                                    })
                                }
                                placeholder="Search regions…"
                            />
                            <FilterMultiSelect
                                title="Campaigns"
                                options={options.campaignOptions}
                                value={form.watch("campaigns")}
                                onChange={(next) =>
                                    form.setValue("campaigns", next, {
                                        shouldDirty: true,
                                    })
                                }
                                placeholder="Search campaigns…"
                            />
                        </div>
                    </motion.div>
                )}

                {/* Outputs */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, delay: 0.14 }}
                    whileHover={{ y: -2 }}
                    className={cardClass()}
                >
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-[#193E6B]" />
                        <div className="text-base font-semibold text-[#193E6B]">
                            Outputs
                        </div>
                    </div>
                    <div className="mt-1 text-sm text-gray-600">
                        The app always creates an in-app JSON report object for
                        preview pages. Exports are optional.
                    </div>

                    {/* In-app JSON output (always on) */}
                    <div className="mt-4 rounded-lg bg-[#F5F5F5] p-3 ring-1 ring-gray-200">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <div className="text-sm font-semibold text-[#193E6B]">
                                    In-app report (JSON)
                                </div>
                                <div className="mt-1 text-xs text-gray-500">
                                    Used by Preview pages + Archive. Stored
                                    later in Dataverse/DB.
                                </div>
                            </div>
                            <span className="rounded-full bg-[#193E6B]/10 px-3 py-1 text-xs font-semibold text-[#193E6B]">
                                Always enabled
                            </span>
                        </div>
                    </div>

                    {/* Export formats */}
                    <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                        <button
                            type="button"
                            onClick={() => toggleExport("pdf")}
                            className={`flex items-center justify-between rounded-md border px-3 py-3 text-sm ${
                                form.getValues("exports")?.includes("pdf")
                                    ? "border-[#B3A125]/45 bg-[#B3A125]/10"
                                    : "border-gray-200 bg-white hover:bg-gray-50"
                            }`}
                        >
                            <span className="inline-flex items-center gap-2 text-[#193E6B]">
                                <FileText className="h-4 w-4" />
                                PDF export
                            </span>
                            <span className="text-xs font-semibold text-[#193E6B]">
                                {form.getValues("exports")?.includes("pdf")
                                    ? "Selected"
                                    : "—"}
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => toggleExport("excel")}
                            className={`flex items-center justify-between rounded-md border px-3 py-3 text-sm ${
                                form.getValues("exports")?.includes("excel")
                                    ? "border-[#B3A125]/45 bg-[#B3A125]/10"
                                    : "border-gray-200 bg-white hover:bg-gray-50"
                            }`}
                        >
                            <span className="inline-flex items-center gap-2 text-[#193E6B]">
                                <FileSpreadsheet className="h-4 w-4" />
                                Excel export
                            </span>
                            <span className="text-xs font-semibold text-[#193E6B]">
                                {form.getValues("exports")?.includes("excel")
                                    ? "Selected"
                                    : "—"}
                            </span>
                        </button>
                    </div>

                    {errors.exports?.message && (
                        <div className="mt-2 text-xs text-rose-600">
                            {errors.exports.message as string}
                        </div>
                    )}

                    {/* Include sections */}
                    <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                        <label className="flex cursor-pointer items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-3 text-sm hover:bg-gray-50">
                            <span className="text-[#193E6B]">
                                Include appendix (tables)
                            </span>
                            <input
                                type="checkbox"
                                className="h-4 w-4 accent-[#193E6B]"
                                {...form.register("includeAppendix")}
                            />
                        </label>

                        <label className="flex cursor-pointer items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-3 text-sm hover:bg-gray-50">
                            <span className="text-[#193E6B]">
                                Include draft commentary
                            </span>
                            <input
                                type="checkbox"
                                className="h-4 w-4 accent-[#193E6B]"
                                {...form.register("includeCommentaryDraft")}
                            />
                        </label>
                    </div>

                    {/* Actions */}
                    <div className="mt-5 flex flex-wrap items-center justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                form.reset();
                                toast("Form reset");
                            }}
                            className="rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-[#193E6B] hover:bg-gray-50"
                        >
                            Reset
                        </button>

                        <button
                            type="submit"
                            className="rounded-md bg-[#193E6B] px-4 py-2 text-sm font-semibold text-white hover:bg-[#16365f]"
                        >
                            Generate report
                        </button>
                    </div>
                </motion.div>
            </div>

            {/* RIGHT: Checklist (consistent “premium filler”, like your Home CTA style) */}
            <div className="lg:col-span-4 flex flex-col gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, delay: 0.06 }}
                    whileHover={{ y: -2 }}
                    className={cardClass()}
                >
                    <WhatWillGeneratePanel values={values} />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, delay: 0.07 }}
                    whileHover={{ y: -2 }}
                    className={cardClass()}
                >
                    <div className="text-base font-semibold text-[#193E6B]">
                        Pre-generation checklist
                    </div>

                    <div className="mt-4 space-y-2 text-sm">
                        {[
                            "Confirm the reporting period is correct.",
                            "Use All data unless a scoped review is required.",
                            "If using filters, confirm stakeholders agree with scope.",
                            "Pick export formats (PDF/Excel) for distribution needs.",
                            "Appendix/commentary can be enabled as needed.",
                        ].map((t) => (
                            <div
                                key={t}
                                className="flex items-start gap-2 rounded-md border border-gray-200 bg-white p-3"
                            >
                                <CheckCircle2 className="mt-0.5 h-4 w-4 text-[#B3A125]" />
                                <span className="text-gray-700">{t}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </form>
    );
}
