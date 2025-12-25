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
        engaged: number;
        qualified: number;
        converted: number;
        lost: number;
    };

    regions?: RegionPerformanceRow[];
    agents?: AgentPerformanceRow[];
};
