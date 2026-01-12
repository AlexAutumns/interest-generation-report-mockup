// app/pages/generate-report/generate_report_schema.ts
import { z } from "zod";
import {
    EXPORT_FORMATS,
    QUARTERS,
    REPORT_TYPES,
} from "./generate_report_helpers";

export const generateReportSchema = z
    .object({
        reportType: z.enum(REPORT_TYPES),

        customName: z
            .string()
            .max(80, "Report name must be 80 characters or less.")
            .optional()
            .or(z.literal("")),

        // Period selection
        weekStart: z.string().optional(),
        weekEnd: z.string().optional(),
        month: z.string().optional(), // yyyy-mm from input type="month"
        quarter: z.enum(QUARTERS).optional(),
        year: z.number().int().min(2020).max(2100).optional(),

        // Filter settings
        scopeMode: z.enum(["all", "filtered"]).default("all"),
        applyFiltersTo: z
            .enum(["preview_only", "exports_only", "both"])
            .default("both"),

        // Filters (only meaningful when scopeMode=filtered)
        channels: z.array(z.string()).default([]),
        regions: z.array(z.string()).default([]),
        campaigns: z.array(z.string()).default([]),
        agents: z.array(z.string()).default([]),
        statuses: z.array(z.string()).default([]),

        // Exports
        exports: z
            .array(z.enum(EXPORT_FORMATS))
            .min(1, "Select at least one export format."),

        // In-app report object is always created (JSON), but we keep options for sections
        includeAppendix: z.boolean().default(true),
        includeCommentaryDraft: z.boolean().default(true),
    })
    .superRefine((val, ctx) => {
        if (val.reportType === "weekly") {
            if (!val.weekStart) {
                ctx.addIssue({
                    code: "custom",
                    path: ["weekStart"],
                    message: "Start date is required.",
                });
            }
            if (!val.weekEnd) {
                ctx.addIssue({
                    code: "custom",
                    path: ["weekEnd"],
                    message: "End date is required.",
                });
            }
        }

        if (val.reportType === "monthly") {
            if (!val.month) {
                ctx.addIssue({
                    code: "custom",
                    path: ["month"],
                    message: "Month is required.",
                });
            }
        }

        if (val.reportType === "quarterly") {
            if (!val.quarter) {
                ctx.addIssue({
                    code: "custom",
                    path: ["quarter"],
                    message: "Quarter is required.",
                });
            }
            if (!val.year) {
                ctx.addIssue({
                    code: "custom",
                    path: ["year"],
                    message: "Year is required.",
                });
            }
        }

        // If user chooses "filtered", we allow empty filters = treated as "all",
        // but we still show UI settings. No extra validation needed.
    });

// RHF + zodResolver expects the INPUT shape (defaults make fields optional on input)
export type GenerateReportFormValues = z.input<typeof generateReportSchema>;

// Optional: “fully realized” type after parsing (defaults applied)
export type GenerateReportParsedValues = z.output<typeof generateReportSchema>;
