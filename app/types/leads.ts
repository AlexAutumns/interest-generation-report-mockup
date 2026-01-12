// app/types/leads.ts (type definitions for lead data came from CSV import)
export type LeadRow = {
    id: string;

    createdAt: string; // ISO string
    firstResponseAt?: string; // ISO string | undefined
    resolvedAt?: string; // ISO string | undefined

    status: string;
    channel: string;
    campaign: string;
    industry: string;
    region: string;
    agent: string;

    leadScore: number;
    conversion: number; // 0/1
    revenueUsd: number;
    costUsd: number;

    followUpCount: number;
    avgFollowUpTime: number; // hours (based on your CSV)

    slaBreached: number; // 0/1
    lostReason?: string;
};
