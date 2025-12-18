import { Link, useSearchParams } from "react-router";
import { generatedReports } from "../../../data/mockReportsFull";
import { FileText, ArrowLeft } from "lucide-react";

import ReportInfo from "./report_info";
import KpiTiles from "./kpi_tiles";
import VisualHighlightsRecharts from "./visual_highlights_recharts";
import NextSteps from "./next_steps";
import ChannelPerformanceTable from "./channel_performance_table";
import {
    formatDateRange,
    formatDateTime,
    shortChannelLabel,
} from "./executive_summary_helpers";

type ChannelTopRow = {
    channel: string;
    channelShort: string;
    leads: number;
    converted: number;
};

type PieRow = { name: string; value: number };

export default function ExecutiveSummaryPage() {
    const [params] = useSearchParams();
    const reportId = params.get("reportId");

    const report =
        (reportId && generatedReports.find((r) => r.id === reportId)) ??
        generatedReports[0];

    if (!report) {
        return (
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="text-lg font-semibold text-[#193E6B]">
                    Executive Summary
                </div>
                <p className="mt-2 text-sm text-gray-600">
                    No report found. Please go back to Home or Archive and
                    select a report.
                </p>
                <div className="mt-4">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 rounded-md bg-[#193E6B] px-4 py-2 text-sm font-semibold text-white hover:bg-[#16365f]"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    const s = report.executiveSummary;

    const channelTop: ChannelTopRow[] = [...report.channels]
        .sort((a, b) => b.leads - a.leads)
        .slice(0, 6)
        .map((c) => ({
            channel: c.channel,
            channelShort: shortChannelLabel(c.channel),
            leads: c.leads,
            converted: c.converted,
        }));

    const conversionPie: PieRow[] = [
        { name: "Converted", value: s.convertedLeads },
        {
            name: "Not converted",
            value: Math.max(0, s.totalLeads - s.convertedLeads),
        },
    ];

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-[#193E6B]" />
                        <h1 className="text-xl font-semibold text-[#193E6B]">
                            Executive Summary
                        </h1>
                    </div>
                    <p className="text-sm text-gray-600">
                        High-level highlights, trends, and key performance
                        indicators for the selected period.
                    </p>
                </div>

                <Link
                    to="/archive"
                    className="inline-flex items-center gap-2 rounded-md border border-[#B3A125]/35 bg-[#B3A125]/10 px-3 py-2 text-sm font-semibold text-[#193E6B] hover:bg-[#B3A125]/15"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Archive
                </Link>
            </div>

            <ReportInfo
                name={report.name}
                periodLabel={report.periodLabel}
                periodStart={report.periodStart}
                periodEnd={report.periodEnd}
                status={report.status}
                generatedOn={report.generatedOn}
                generatedBy={report.generatedBy}
            />

            <KpiTiles executiveSummary={s} />

            <VisualHighlightsRecharts
                channelTop={channelTop}
                conversionPie={conversionPie}
                totalLeads={s.totalLeads}
                convertedLeads={s.convertedLeads}
                conversionRate={s.conversionRate}
            />

            {/* Narrative + Next steps */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="text-sm font-semibold text-[#193E6B]">
                        Summary
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-gray-700">
                        {s.summaryText}
                    </p>

                    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="rounded-lg bg-[#F5F5F5] p-3 ring-1 ring-gray-200">
                            <div className="text-xs text-gray-500">
                                Top channel
                            </div>
                            <div className="mt-1 text-sm font-semibold text-[#193E6B]">
                                {s.topChannel}
                            </div>
                        </div>

                        <div className="rounded-lg bg-[#F5F5F5] p-3 ring-1 ring-gray-200">
                            <div className="text-xs text-gray-500">
                                Top region
                            </div>
                            <div className="mt-1 text-sm font-semibold text-[#193E6B]">
                                {s.topRegion}
                            </div>
                        </div>

                        <div className="rounded-lg bg-[#F5F5F5] p-3 ring-1 ring-gray-200">
                            <div className="text-xs text-gray-500">
                                Avg follow-up time
                            </div>
                            <div className="mt-1 text-sm font-semibold text-[#193E6B]">
                                {s.avgFollowUpTime.toFixed(1)} hours
                            </div>
                        </div>

                        <div className="rounded-lg bg-[#F5F5F5] p-3 ring-1 ring-gray-200">
                            <div className="text-xs text-gray-500">
                                Report type
                            </div>
                            <div className="mt-1 text-sm font-semibold text-[#193E6B]">
                                {report.type}
                            </div>
                        </div>
                    </div>
                </div>

                <NextSteps reportId={report.id} />
            </div>

            <ChannelPerformanceTable channels={report.channels} />

            {/* Helper usage so TS doesn't tree-shake unused in this file */}
            {/* (kept because ReportInfo formats internally using helpers file) */}
            <span className="hidden">
                {formatDateRange(report.periodStart, report.periodEnd)}
                {formatDateTime(report.generatedOn)}
            </span>
        </div>
    );
}
