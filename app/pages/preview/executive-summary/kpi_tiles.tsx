import { BarChart3, Target, TrendingUp } from "lucide-react";

type ExecutiveSummary = {
    totalLeads: number;
    convertedLeads: number;
    conversionRate: number;
    avgLeadScore: number;
};

type Props = {
    executiveSummary: ExecutiveSummary;
};

function SparkleDot() {
    return (
        <span className="inline-flex h-4 w-4 items-center justify-center">
            <span className="h-2.5 w-2.5 rounded-full bg-[#B3A125]" />
        </span>
    );
}

export default function KpiTiles(props: Props) {
    const { executiveSummary } = props;

    return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#193E6B]">
                    <BarChart3 className="h-4 w-4" />
                    Total leads
                </div>
                <div className="mt-2 text-2xl font-semibold text-[#193E6B]">
                    {executiveSummary.totalLeads}
                </div>
                <div className="mt-1 text-xs text-gray-500">
                    Leads created within the selected period
                </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#193E6B]">
                    <Target className="h-4 w-4" />
                    Converted leads
                </div>
                <div className="mt-2 text-2xl font-semibold text-[#193E6B]">
                    {executiveSummary.convertedLeads}
                </div>
                <div className="mt-1 text-xs text-gray-500">
                    Leads marked as converted
                </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#193E6B]">
                    <TrendingUp className="h-4 w-4" />
                    Conversion rate
                </div>
                <div className="mt-2 text-2xl font-semibold text-[#193E6B]">
                    {executiveSummary.conversionRate.toFixed(1)}%
                </div>
                <div className="mt-1 text-xs text-gray-500">
                    Converted / total leads
                </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#193E6B]">
                    <SparkleDot />
                    Lead score (avg)
                </div>
                <div className="mt-2 text-2xl font-semibold text-[#193E6B]">
                    {executiveSummary.avgLeadScore.toFixed(1)}
                </div>
                <div className="mt-1 text-xs text-gray-500">
                    Average engagement/quality score
                </div>
            </div>
        </div>
    );
}
