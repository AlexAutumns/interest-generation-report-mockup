export type TrendPoint = {
    label: string;
    totalLeads: number;
    convertedLeads: number;
    conversionRate: number; // %
};

export type BreakdownRow = {
    name: string;
    totalLeads: number;
    convertedLeads: number;
    conversionRate: number; // %
};

export type KpiTilesData = {
    totalLeads: number;
    convertedLeads: number;
    conversionRate: number; // %
    avgFollowUpHours: number;
    avgLeadScore: number;
    totalRevenueUsd: number;
    totalCostUsd: number;
    roiPercent: number; // %
};

export type ExecutiveSummaryShape = {
    totalLeads: number;
    convertedLeads: number;
    conversionRate: number;
    avgFollowUpTime: number;
    avgLeadScore: number;
};

export type ChannelShape = {
    channel: string;
    leads: number;
    converted: number;
    conversionRate: number;
    revenueUsd?: number;
    costUsd?: number;
};

export type GeneratedReportShape = {
    id: string;
    name: string;
    periodLabel: string;
    periodStart: string;
    periodEnd: string;
    generatedOn: string;
    generatedBy: string;
    status: string;
    type: string;
    executiveSummary: ExecutiveSummaryShape;
    channels: ChannelShape[];
    trend?: Array<{
        label: string;
        totalLeads: number;
        convertedLeads: number;
        conversionRate: number;
    }>;
};
