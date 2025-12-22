export type FunnelStageKey =
    | "captured"
    | "contacted"
    | "engaged"
    | "qualified"
    | "converted";

export type FunnelStage = {
    key: FunnelStageKey;
    label: string;
    value: number;
};

export type DropOffRow = {
    fromLabel: string;
    toLabel: string;
    fromValue: number;
    toValue: number;
    dropCount: number;
    dropRate: number; // %
};

export type ScoreBin = {
    label: string; // "0–20"
    min: number;
    max: number;
    count: number;
    percent: number; // %
};

export type FunnelSummary = {
    totalLeads: number;
    convertedLeads: number;
    conversionRate: number; // %
    avgLeadScore: number;
    avgFollowUpHours: number;
    contactedRate: number; // %
    engagedRate: number; // %
    qualifiedRate: number; // %
};

export type ConversionFunnelModel = {
    stages: FunnelStage[];
    dropOff: DropOffRow[];
    scoreBins: ScoreBin[];
    summary: FunnelSummary;
    insights: string[];
};
