import { useEffect, useState } from "react";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    Legend,
} from "recharts";
import type { ChannelRow } from "./campaign_channel_helpers";
import { formatUsd } from "./campaign_channel_helpers";

type Props = {
    rows: ChannelRow[];
};

export default function ChannelChartsRecharts({ rows }: Props) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const top = rows.slice(0, 8);

    return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Leads vs Converted */}
            <div className="min-w-0 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-[#193E6B]">
                        Leads vs Converted (Top channels)
                    </div>
                    <div className="text-xs text-gray-500">Top 8 by leads</div>
                </div>

                <div className="mt-4 h-[280px] min-w-0">
                    {mounted ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={top}
                                margin={{
                                    top: 10,
                                    right: 20,
                                    left: 0,
                                    bottom: 10,
                                }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="channelShort"
                                    tick={{ fontSize: 12 }}
                                />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip
                                    formatter={(value: any, name: any) => {
                                        if (name === "leads")
                                            return [value, "Leads"];
                                        if (name === "converted")
                                            return [value, "Converted"];
                                        return [value, name];
                                    }}
                                />
                                <Legend />
                                <Bar
                                    dataKey="leads"
                                    fill="#193E6B"
                                    radius={[6, 6, 0, 0]}
                                />
                                <Bar
                                    dataKey="converted"
                                    fill="#B3A125"
                                    radius={[6, 6, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full w-full animate-pulse rounded-lg bg-[#F5F5F5] ring-1 ring-gray-200" />
                    )}
                </div>
            </div>

            {/* Revenue vs Cost */}
            <div className="min-w-0 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-[#193E6B]">
                        Revenue vs Cost (USD)
                    </div>
                    <div className="text-xs text-gray-500">Estimated</div>
                </div>

                <div className="mt-2 rounded-lg bg-[#F5F5F5] p-3 text-xs text-gray-600 ring-1 ring-gray-200">
                    Tip: ROI is derived as (Revenue − Cost) / Cost.
                </div>

                <div className="mt-4 h-[280px] min-w-0">
                    {mounted ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={top}
                                margin={{
                                    top: 10,
                                    right: 20,
                                    left: 0,
                                    bottom: 10,
                                }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="channelShort"
                                    tick={{ fontSize: 12 }}
                                />
                                <YAxis
                                    tick={{ fontSize: 12 }}
                                    tickFormatter={(v) => {
                                        const n = Number(v);
                                        if (!Number.isFinite(n))
                                            return String(v);
                                        if (n >= 1000)
                                            return `${Math.round(n / 1000)}k`;
                                        return `${n}`;
                                    }}
                                />
                                <Tooltip
                                    formatter={(value: any, name: any) => {
                                        if (name === "revenueUsd")
                                            return [
                                                formatUsd(Number(value)),
                                                "Revenue",
                                            ];
                                        if (name === "costUsd")
                                            return [
                                                formatUsd(Number(value)),
                                                "Cost",
                                            ];
                                        return [value, name];
                                    }}
                                />
                                <Legend />
                                <Bar
                                    dataKey="revenueUsd"
                                    fill="#193E6B"
                                    radius={[6, 6, 0, 0]}
                                />
                                <Bar
                                    dataKey="costUsd"
                                    fill="#B3A125"
                                    radius={[6, 6, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full w-full animate-pulse rounded-lg bg-[#F5F5F5] ring-1 ring-gray-200" />
                    )}
                </div>
            </div>
        </div>
    );
}
