import { useEffect, useMemo, useState } from "react";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    PieChart,
    Pie,
    Cell,
    Legend,
} from "recharts";

import type { LostReasonBarMode, LostReasonRowUi } from "./closed_lost_helpers";
import { buildLostReasonPie } from "./closed_lost_helpers";

type Props = {
    rows: LostReasonRowUi[];
};

function shortLabel(label: string, max = 14) {
    return label.length > max ? `${label.slice(0, max)}…` : label;
}

export default function ClosedLostChartsRecharts({ rows }: Props) {
    const [mounted, setMounted] = useState(false);
    const [barMode, setBarMode] = useState<LostReasonBarMode>("count");

    useEffect(() => {
        setMounted(true);
    }, []);

    const barData = useMemo(
        () =>
            rows.slice(0, 8).map((r) => ({
                reason: r.reason,
                reasonShort: shortLabel(r.reason),
                count: r.count,
                percent: r.percent,
            })),
        [rows]
    );

    const pieData = useMemo(() => buildLostReasonPie(rows, 5), [rows]);

    const activeKey = barMode === "count" ? "count" : "percent";
    const activeLabel = barMode === "count" ? "Lost leads" : "% of lost";

    return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Bar */}
            <div className="lg:col-span-2 min-w-0 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="text-sm font-semibold text-[#193E6B]">
                            Closed-lost reasons (top 8)
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                            View by count or share of lost leads
                        </div>
                    </div>

                    {/* Toggle */}
                    <div className="inline-flex overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm">
                        <button
                            type="button"
                            onClick={() => setBarMode("count")}
                            className={[
                                "px-3 py-2 text-xs font-semibold",
                                barMode === "count"
                                    ? "bg-[#193E6B] text-white"
                                    : "bg-white text-[#193E6B] hover:bg-gray-50",
                            ].join(" ")}
                        >
                            Count
                        </button>
                        <button
                            type="button"
                            onClick={() => setBarMode("percent")}
                            className={[
                                "px-3 py-2 text-xs font-semibold",
                                barMode === "percent"
                                    ? "bg-[#B3A125] text-white"
                                    : "bg-white text-[#193E6B] hover:bg-gray-50",
                            ].join(" ")}
                        >
                            % of lost
                        </button>
                    </div>
                </div>

                <div className="mt-4 h-[280px] min-w-0">
                    {mounted ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={barData}
                                margin={{
                                    top: 10,
                                    right: 20,
                                    left: 0,
                                    bottom: 10,
                                }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="reasonShort"
                                    tick={{ fontSize: 12 }}
                                />
                                <YAxis
                                    tick={{ fontSize: 12 }}
                                    tickFormatter={(v) =>
                                        barMode === "percent"
                                            ? `${Number(v).toFixed(0)}%`
                                            : `${Math.round(Number(v))}`
                                    }
                                />
                                <Tooltip
                                    formatter={(v: any) => {
                                        const n = Number(v);
                                        if (barMode === "percent") {
                                            return [
                                                `${n.toFixed(1)}%`,
                                                activeLabel,
                                            ];
                                        }
                                        return [Math.round(n), activeLabel];
                                    }}
                                    labelFormatter={(label) =>
                                        `Reason: ${label}`
                                    }
                                />
                                <Bar
                                    dataKey={activeKey}
                                    fill={
                                        barMode === "count"
                                            ? "#193E6B"
                                            : "#B3A125"
                                    }
                                    radius={[6, 6, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full w-full animate-pulse rounded-lg bg-[#F5F5F5] ring-1 ring-gray-200" />
                    )}
                </div>

                <div className="mt-3 text-xs text-gray-500">
                    Tip: Switch to “% of lost” to compare periods fairly even if
                    total lost volume changes.
                </div>
            </div>

            {/* Pie */}
            <div className="min-w-0 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="text-sm font-semibold text-[#193E6B]">
                    Share of lost reasons
                </div>
                <div className="mt-1 text-xs text-gray-500">Top 5 + Other</div>

                <div className="mt-4 h-[240px] min-w-0">
                    {mounted ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    dataKey="value"
                                    nameKey="name"
                                    innerRadius={55}
                                    outerRadius={85}
                                    paddingAngle={2}
                                >
                                    {pieData.map((_, idx) => (
                                        <Cell
                                            key={idx}
                                            fill={
                                                idx % 2 === 0
                                                    ? "#193E6B"
                                                    : "#B3A125"
                                            }
                                            opacity={
                                                idx === pieData.length - 1
                                                    ? 0.35
                                                    : 1
                                            }
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(v: any) => [v, "Lost leads"]}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full w-full animate-pulse rounded-lg bg-[#F5F5F5] ring-1 ring-gray-200" />
                    )}
                </div>

                <div className="mt-2 rounded-lg bg-[#F5F5F5] p-3 text-xs text-gray-600 ring-1 ring-gray-200">
                    Use this to spot “one big issue” vs “many small issues”.
                </div>
            </div>
        </div>
    );
}
