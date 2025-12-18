import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { latestReportSummary } from "../../data/mockReportSummaries";
import { Sparkles, ArrowRight } from "lucide-react";
import { formatGeneratedOn } from "./home_helpers";

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

export default function LatestSnapshotRecharts() {
    const latest = latestReportSummary;

    // ✅ Client-only gate for Recharts (prevents width/height -1)
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    const { totalLeads, convertedLeads, pieData } = useMemo(() => {
        if (!latest) {
            return { totalLeads: 0, convertedLeads: 0, pieData: [] as any[] };
        }

        const total = latest.metricsPreview.totalLeads ?? 0;

        // Summary mock only has conversionRate, so estimate converted
        const converted = Math.round(
            (latest.metricsPreview.conversionRate / 100) * total
        );

        const pie = [
            { name: "Converted", value: Math.max(0, converted) },
            { name: "Not converted", value: Math.max(0, total - converted) },
        ];

        return { totalLeads: total, convertedLeads: converted, pieData: pie };
    }, [latest]);

    return (
        <div className="h-full rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-[#193E6B]" />
                    <h2 className="text-base font-semibold text-[#193E6B]">
                        Latest report snapshot
                    </h2>
                </div>
                <div className="h-2.5 w-2.5 rounded-full bg-[#B3A125]" />
            </div>

            {!latest ? (
                <div className="mt-4 rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
                    No reports yet. Generate your first report to see a snapshot
                    here.
                </div>
            ) : (
                <>
                    <div className="mt-3">
                        <div className="text-sm font-semibold text-[#193E6B]">
                            {latest.name}
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                            {latest.periodLabel} • Generated on{" "}
                            {formatGeneratedOn(latest.generatedOn)}
                        </div>
                    </div>

                    <div className="mt-4 rounded-lg bg-[#F5F5F5] p-3 ring-1 ring-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-xs text-gray-500">
                                    Conversion split
                                </div>
                                <div className="mt-1 text-sm font-semibold text-[#193E6B]">
                                    {latest.metricsPreview.conversionRate.toFixed(
                                        1
                                    )}
                                    % conversion
                                </div>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-[#B3A125]/15 ring-1 ring-[#B3A125]/30" />
                        </div>

                        <div className="mt-3 h-[180px] min-w-0">
                            {mounted ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            dataKey="value"
                                            nameKey="name"
                                            innerRadius={55}
                                            outerRadius={80}
                                            paddingAngle={2}
                                        >
                                            <Cell fill="#B3A125" />
                                            <Cell
                                                fill="#193E6B"
                                                opacity={0.25}
                                            />
                                        </Pie>
                                        <Tooltip
                                            formatter={(v: any) => [v, "Leads"]}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full w-full animate-pulse rounded-lg bg-white/60 ring-1 ring-gray-200" />
                            )}
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 font-semibold text-[#193E6B] ring-1 ring-gray-200">
                                <span className="h-2 w-2 rounded-full bg-[#B3A125]" />
                                Converted: {convertedLeads}
                            </span>
                            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 font-semibold text-[#193E6B] ring-1 ring-gray-200">
                                <span className="h-2 w-2 rounded-full bg-[#193E6B]/40" />
                                Not converted:{" "}
                                {Math.max(0, totalLeads - convertedLeads)}
                            </span>
                            <span className="ml-auto text-[11px] text-gray-500">
                                *Converted is estimated
                            </span>
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-3">
                            <div className="rounded-lg bg-white p-3 ring-1 ring-gray-200">
                                <div className="text-xs text-gray-500">
                                    Total leads
                                </div>
                                <div className="text-lg font-semibold text-[#193E6B]">
                                    {latest.metricsPreview.totalLeads}
                                </div>
                            </div>

                            <div className="rounded-lg bg-white p-3 ring-1 ring-gray-200">
                                <div className="text-xs text-gray-500">
                                    Top channel
                                </div>
                                <div className="text-sm font-semibold text-[#193E6B]">
                                    {latest.metricsPreview.topChannel}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4">
                        <Link
                            to={`/preview/executive-summary?reportId=${encodeURIComponent(latest.id)}`}
                            className="inline-flex items-center gap-2 text-sm font-semibold text-[#193E6B] hover:underline"
                        >
                            Open preview <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </>
            )}
        </div>
    );
}
