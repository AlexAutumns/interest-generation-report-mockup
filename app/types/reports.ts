// app/types/reports.ts

export type ReportType = "weekly" | "monthly" | "quarterly";
export type ReportStatus = "Completed" | "In Progress" | "Failed";

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
        lostReasons: Array<{ reason: string; count: number }>;
    };

    channels: Array<{
        channel: string;
        leads: number;
        converted: number;
        conversionRate: number; // percent
        revenueUsd: number;
        costUsd: number;
    }>;

    funnel: {
        new: number;
        engaged: number;
        qualified: number;
        converted: number;
        lost: number;
    };

    regions?: Array<{
        region: string;
        leads: number;
        converted: number;
        conversionRate: number; // percent
    }>;

    agents?: Array<{
        agent: string;
        leads: number;
        converted: number;
        conversionRate: number; // percent
        avgLeadScore: number;
    }>;
};
