// app/pages/preview/report-validation/validation_explainers.ts
//
// Business-friendly explanations of how key metrics are computed.
// Kept separate to reduce clutter in the main validation builder.

import type { ExplainerItem } from "./report_validation_types";

export function buildExplainers(): ExplainerItem[] {
    return [
        {
            title: "Total leads (Captured)",
            definition:
                "All leads included in the report period and filters. This is the total pipeline entry count for the selected scope.",
            formula: "Captured = count(leads in scope)",
            example:
                "If 157 leads were created in January and match filters, Captured = 157.",
        },
        {
            title: "Converted leads",
            definition:
                "Leads that have a conversion event. In the prototype, a lead is converted if the conversion flag is true OR status indicates conversion.",
            formula:
                "Converted = count(leads where conversion > 0 OR status == 'Converted')",
            example:
                "If a lead has conversion=1 but status isn’t updated yet, it is still counted as Converted.",
        },
        {
            title: "Conversion rate",
            definition:
                "The percentage of total leads that converted in the selected scope.",
            formula: "Conversion rate (%) = (Converted ÷ Total) × 100",
        },
        {
            title: "Funnel stages",
            definition:
                "Stages are cumulative: each stage includes leads at that stage or beyond (e.g., Engaged includes Qualified and Converted).",
            formula:
                "Engaged = Engaged-or-later, Qualified = Qualified-or-later, Converted = Converted",
        },
        {
            title: "Contacted (prototype)",
            definition:
                "Outreach initiated. In the prototype, this may be estimated based on follow-up speed until activity logs are available.",
            formula:
                "Contacted ≈ Captured × factor (based on avg follow-up time), clamped to be ≥ Engaged",
        },
        {
            title: "Lead score distribution",
            definition:
                "Leads are grouped into score bands to show lead quality at a glance.",
            formula:
                "Bins: 0–20, 21–40, 41–60, 61–80, 81–100 (count leads per band)",
        },
    ];
}
