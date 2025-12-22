import { useEffect, useState } from "react";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
} from "recharts";
import { motion } from "framer-motion";
import { Sparkles, ShieldAlert, ShieldCheck, Target } from "lucide-react";
import type { FunnelSummary, ScoreBin } from "./conversion_funnel_types";
import { cn } from "../../../utils/cn";

type Props = {
    scoreBins: ScoreBin[];
    summary: FunnelSummary;
};

export default function LeadScorePanel({ scoreBins, summary }: Props) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    const highIntent = scoreBins
        .filter((b) => b.min >= 61) // 61–100
        .reduce((a, b) => a + b.count, 0);

    const lowIntent = scoreBins
        .filter((b) => b.max <= 40) // 0–40
        .reduce((a, b) => a + b.count, 0);

    const total = summary.totalLeads || 1;

    const highIntentPct = (highIntent / total) * 100;
    const lowIntentPct = (lowIntent / total) * 100;

    return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Score KPIs */}
            <motion.div
                whileHover={{ y: -2 }}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
            >
                <div className="flex items-center gap-2 text-sm font-semibold text-[#193E6B]">
                    <Sparkles className="h-4 w-4" />
                    Lead scoring overview
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3">
                    <div className="rounded-lg bg-[#F5F5F5] p-3 ring-1 ring-gray-200">
                        <div className="text-xs text-gray-500">
                            Average lead score
                        </div>
                        <div className="mt-1 text-2xl font-semibold text-[#193E6B]">
                            {summary.avgLeadScore.toFixed(1)}
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                            Engagement/quality indicator (mock)
                        </div>
                    </div>

                    <div className="rounded-lg bg-[#B3A125]/10 p-3 ring-1 ring-[#B3A125]/25">
                        <div className="flex items-center justify-between">
                            <div className="text-xs text-[#193E6B]">
                                High intent (61–100)
                            </div>
                            <span
                                className={cn(
                                    "rounded-full px-2 py-1 text-xs font-semibold",
                                    "bg-white/70 ring-1 ring-[#B3A125]/25 text-[#193E6B]"
                                )}
                            >
                                {highIntentPct.toFixed(1)}%
                            </span>
                        </div>
                        <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-[#193E6B]">
                            <ShieldCheck className="h-4 w-4" />
                            {highIntent} leads
                        </div>
                    </div>

                    <div className="rounded-lg bg-rose-50 p-3 ring-1 ring-rose-200">
                        <div className="flex items-center justify-between">
                            <div className="text-xs text-rose-700">
                                Low intent (0–40)
                            </div>
                            <span className="rounded-full bg-white/70 px-2 py-1 text-xs font-semibold text-rose-700 ring-1 ring-rose-200">
                                {lowIntentPct.toFixed(1)}%
                            </span>
                        </div>
                        <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-rose-700">
                            <ShieldAlert className="h-4 w-4" />
                            {lowIntent} leads
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            alert(
                                "Mockup note:\n\nLead score will later be computed from engagement events (opens, clicks, replies, meetings, etc.)."
                            )
                        }
                        className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-[#193E6B] hover:bg-gray-50"
                    >
                        <Target className="h-4 w-4" />
                        View scoring rules (mock)
                    </button>
                </div>
            </motion.div>

            {/* Distribution chart */}
            <motion.div
                whileHover={{ y: -2 }}
                className="lg:col-span-2 min-w-0 rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
            >
                <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-[#193E6B]">
                        Lead score distribution
                    </div>
                    <div className="text-xs text-gray-500">By score band</div>
                </div>

                <div className="mt-4 h-[300px] min-w-0">
                    {mounted ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={scoreBins}
                                margin={{
                                    top: 10,
                                    right: 20,
                                    left: 0,
                                    bottom: 10,
                                }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="label"
                                    tick={{ fontSize: 12 }}
                                />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip
                                    formatter={(
                                        v: any,
                                        name: any,
                                        item: any
                                    ) => {
                                        if (name === "count")
                                            return [v, "Leads"];
                                        return [v, name];
                                    }}
                                    labelFormatter={(label) =>
                                        `Score band: ${label}`
                                    }
                                />
                                <Bar
                                    dataKey="count"
                                    fill="#193E6B"
                                    radius={[8, 8, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full w-full animate-pulse rounded-lg bg-[#F5F5F5] ring-1 ring-gray-200" />
                    )}
                </div>

                <div className="mt-3 rounded-lg bg-[#F5F5F5] p-3 text-xs text-gray-600 ring-1 ring-gray-200">
                    In real generation, score bands will be computed from
                    engagement signals and mapped to stages.
                </div>
            </motion.div>
        </div>
    );
}
