// app/types/reports.ts

export type ReportType = "weekly" | "monthly" | "quarterly";
export type ReportStatus = "Completed" | "In Progress" | "Failed";

/**
 * Lightweight metrics used in Home + Archive list views.
 */
export type MetricsPreview = {
    totalLeads: number;
    convertedLeads: number;
    conversionRate: number; // percent, e.g. 20.5 means 20.5%
    topChannel: string;
};

export type ReportSummary = {
    id: string;
    name: string;
    type: ReportType;

    periodLabel: string; // e.g. "Week 22 2025", "March 2025", "Q2 2025"
    periodStart: string; // ISO date: "2025-06-01"
    periodEnd: string; // ISO date: "2025-06-30"

    generatedOn: string; // ISO datetime: "2025-06-30T09:15:00Z"
    generatedBy: string;
    status: ReportStatus;

    metricsPreview: MetricsPreview;
};

/**
 * Shared row types (so you can reuse in helpers/pages cleanly).
 */
export type LostReasonRow = {
    reason: string;
    count: number;
};

export type ChannelPerformanceRow = {
    channel: string;
    leads: number;
    converted: number;
    conversionRate: number; // percent
    revenueUsd: number;
    costUsd: number;
};

export type CampaignPerformanceRow = {
    campaign: string;
    leads: number;
    converted: number;
    conversionRate: number; // percent
    revenueUsd: number;
    costUsd: number;
};

/**
 * Optional “matrix” row if you later want Campaign x Channel visuals.
 * (Not required right now — but useful later.)
 */
export type CampaignChannelRow = {
    campaign: string;
    channel: string;
    leads: number;
    converted: number;
    conversionRate: number; // percent
};

export type RegionPerformanceRow = {
    region: string;
    leads: number;
    converted: number;
    conversionRate: number; // percent
};

export type AgentPerformanceRow = {
    agent: string;
    leads: number;
    converted: number;
    conversionRate: number; // percent
    avgLeadScore: number;
};

// Lead score distribution bin stored in generated report JSON.
// Kept inside reports.ts to avoid coupling the page model types to report types.
export type LeadScoreBin = {
    label: string; // e.g. "0–20"
    min: number; // inclusive lower bound
    max: number; // inclusive upper bound
    count: number; // number of leads in this band
    percent: number; // percent of total leads (0–100)
};

// Data quality snapshot for the leads used in the report scope.
// This is designed to be business-friendly and actionable.
export type DataQualityFieldStats = {
    field:
        | "status"
        | "agent"
        | "channel"
        | "campaign"
        | "region"
        | "leadScore"
        | "createdAt";
    total: number;

    missingCount: number;
    missingPercent: number; // 0–100

    // “Unknown” is when the string exists but is blank-like or obviously invalid.
    // (We keep this separate from “missing” to make intervention easier.)
    unknownCount: number;
    unknownPercent: number; // 0–100

    // Top raw values (helps spot variants like "FB" vs "Facebook ")
    topValues: Array<{
        value: string;
        count: number;
        percent: number; // 0–100
    }>;
};

export type ReportDataQuality = {
    version: 1;
    totalScopedLeads: number;
    fields: DataQualityFieldStats[];
};

// Snapshot of filter settings used when the report was generated.
// This is stored in the report so preview/validation pages can show the true scope.
export type ReportFilterSnapshot = {
    scopeMode: "all" | "filtered";
    applyFiltersTo: "preview_only" | "exports_only" | "both";

    // Whether filters were actually applied to the dataset used for THIS report object.
    // (If applyFiltersTo=exports_only, then the report preview won’t be filtered.)
    appliedToReport: boolean;

    channels: string[];
    regions: string[];
    campaigns: string[];
    agents: string[];
    statuses: string[];
};

export type GeneratedReport = {
    id: string;
    name: string;
    type: ReportType;

    periodLabel: string;
    periodStart: string;
    periodEnd: string;

    generatedOn: string;
    generatedBy: string;
    status: ReportStatus;

    executiveSummary: {
        totalLeads: number;
        convertedLeads: number;
        conversionRate: number; // percent
        avgLeadScore: number;
        avgFollowUpTime: number; // hours
        topChannel: string;
        topRegion: string;
        summaryText: string;
    };

    kpis: {
        newLeads: number;
        engagedLeads: number;
        qualifiedLeads: number;
        lostLeads: number;
        slaBreachCount: number;
        lostReasons: LostReasonRow[];
    };

    channels: ChannelPerformanceRow[];

    // NEW (optional for backwards compatibility)
    campaigns?: CampaignPerformanceRow[];

    // NEW (optional) campaign x channel matrix
    campaignChannels?: CampaignChannelRow[];

    funnel: {
        new: number;

        // Optional for backwards compatibility:
        // older mock reports / older generated reports may not have this yet.
        contacted?: number;

        engaged: number;
        qualified: number;
        converted: number;
        lost: number;
    };

    // Optional: if present, Conversion & Funnel can show real score distribution
    leadScoreBins?: LeadScoreBin[];

    // Optional: stored data quality stats used by Report Validation page.
    dataQuality?: ReportDataQuality;

    // Filter scope snapshot (used by Report Validation page).
    filters?: ReportFilterSnapshot;

    regions?: RegionPerformanceRow[];
    agents?: AgentPerformanceRow[];
};
