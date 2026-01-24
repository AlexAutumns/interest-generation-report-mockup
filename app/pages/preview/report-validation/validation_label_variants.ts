// app/pages/preview/report-validation/validation_label_variants.ts
//
// Label variant detection (e.g., "FB" vs "Facebook").
// Extracted to reduce noise in the main validation builder.
//
// Design:
// - Prefer lead-level dataQuality.topValues when available (more accurate).
// - Fallback to grouped tables for older reports.
// - Always return LabelVariantGroup with canonical + aliases.

import type { GeneratedReport } from "../../../types/reports";
import type { LabelVariantGroup } from "./report_validation_types";
import { normalizeKey, safeNumber } from "./validation_utils";

type GroupRow = { name: string; leads: number };
type GetFieldDQ = (report: GeneratedReport, fieldKey: string) => any | null;

function fieldToDQKey(field: LabelVariantGroup["field"]): string {
    switch (field) {
        case "Channel":
            return "channel";
        case "Campaign":
            return "campaign";
        case "Region":
            return "region";
        case "Agent":
            return "agent";
    }
}

function findLabelVariantsFromGrouped(
    field: LabelVariantGroup["field"],
    rows: GroupRow[] | undefined,
): LabelVariantGroup[] {
    if (!rows || rows.length === 0) return [];

    // Group original labels by normalized key
    const map = new Map<string, { label: string; leads: number }[]>();

    for (const r of rows) {
        const label = String((r as any).name ?? "").trim();
        if (!label) continue;

        const key = normalizeKey(label);
        const arr = map.get(key) ?? [];
        arr.push({ label, leads: safeNumber((r as any).leads, 0) });
        map.set(key, arr);
    }

    const groups: LabelVariantGroup[] = [];

    for (const [key, variants] of map.entries()) {
        // Only consider it a "variant problem" if there are at least 2 distinct labels
        const distinctLabels = Array.from(
            new Set(variants.map((v) => v.label)),
        );
        if (distinctLabels.length < 2) continue;

        const totalLeads = variants.reduce(
            (s, v) => s + safeNumber(v.leads, 0),
            0,
        );

        // Sort variants by impact (highest leads first) so it's easy to read
        variants.sort((a, b) => b.leads - a.leads);

        const canonical = variants[0]?.label ?? distinctLabels[0];
        const aliases = variants
            .slice(1)
            .map((v) => ({ label: v.label, leads: v.leads }));

        groups.push({
            field,
            normalizedKey: key,
            variants: variants.map((v) => ({ label: v.label, leads: v.leads })),
            canonical,
            aliases,
            totalLeads,
        });
    }

    // Most impactful first
    groups.sort((a, b) => b.totalLeads - a.totalLeads);

    return groups;
}

function findLabelVariantsFromDataQuality(
    report: GeneratedReport,
    field: LabelVariantGroup["field"],
    getFieldDQ: GetFieldDQ,
): LabelVariantGroup[] {
    const dqFieldKey = fieldToDQKey(field);
    const dq = getFieldDQ(report, dqFieldKey);

    // If we don't have dataQuality for this report, return empty and let fallback handle it.
    if (!dq || !Array.isArray(dq.topValues)) return [];

    // Group raw top values by normalized key
    const map = new Map<string, { label: string; leads: number }[]>();

    for (const tv of dq.topValues) {
        const label = String(tv.value ?? "").trim();
        if (!label) continue;

        const key = normalizeKey(label);
        const arr = map.get(key) ?? [];
        arr.push({ label, leads: safeNumber(tv.count, 0) });
        map.set(key, arr);
    }

    const groups: LabelVariantGroup[] = [];

    for (const [key, variants] of map.entries()) {
        const distinctLabels = Array.from(
            new Set(variants.map((v) => v.label)),
        );
        if (distinctLabels.length < 2) continue;

        variants.sort((a, b) => b.leads - a.leads);

        const totalLeads = variants.reduce(
            (s, v) => s + safeNumber(v.leads, 0),
            0,
        );
        const canonical = variants[0]?.label ?? distinctLabels[0];
        const aliases = variants
            .slice(1)
            .map((v) => ({ label: v.label, leads: v.leads }));

        groups.push({
            field,
            normalizedKey: key,
            variants: variants.map((v) => ({ label: v.label, leads: v.leads })),
            canonical,
            aliases,
            totalLeads,
        });
    }

    groups.sort((a, b) => b.totalLeads - a.totalLeads);
    return groups;
}

export function buildLabelVariants(
    report: GeneratedReport,
    getFieldDQ: GetFieldDQ,
): LabelVariantGroup[] {
    // Prefer lead-level dataQuality if available (more accurate).
    const fromDQ: LabelVariantGroup[] = [
        ...findLabelVariantsFromDataQuality(report, "Channel", getFieldDQ),
        ...findLabelVariantsFromDataQuality(report, "Campaign", getFieldDQ),
        ...findLabelVariantsFromDataQuality(report, "Region", getFieldDQ),
        ...findLabelVariantsFromDataQuality(report, "Agent", getFieldDQ),
    ];

    if (fromDQ.length > 0) return fromDQ;

    // Fallback to grouped tables for older reports
    return [
        ...findLabelVariantsFromGrouped("Channel", (report as any).channels),
        ...findLabelVariantsFromGrouped("Campaign", (report as any).campaigns),
        ...findLabelVariantsFromGrouped("Region", (report as any).regions),
        ...findLabelVariantsFromGrouped("Agent", (report as any).agents),
    ];
}
