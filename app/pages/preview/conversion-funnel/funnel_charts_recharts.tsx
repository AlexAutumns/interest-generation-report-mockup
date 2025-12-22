import { useEffect, useMemo, useState } from "react";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    Legend,
    LineChart,
    Line,
} from "recharts";
import type { DropOffRow, FunnelStage } from "./conversion_funnel_types";

type Props = {
    stages: FunnelStage[];
    dropOff: DropOffRow[];
};

export default function FunnelChartsRecharts({ stages, dropOff }: Props) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    const funnelData = useMemo(() => {
        return stages.map((s) => ({
            stage: s.label,
            value: s.value,
        }));
    }, [stages]);

    const dropData = useMemo(() => {
        return dropOff.map((d) => ({
            step: `${d.fromLabel} → ${d.toLabel}`,
            dropCount: d.dropCount,
            dropRate: d.dropRate,
        }));
    }, [dropOff]);

    return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Funnel (counts) */}
            <div className="min-w-0 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-[#193E6B]">
                        Funnel stages (count)
                    </div>
                    <div className="text-xs text-gray-500">
                        Estimated from KPIs
                    </div>
                </div>

                <div className="mt-4 h-[280px] min-w-0">
                    {mounted ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={funnelData}
                                margin={{
                                    top: 10,
                                    right: 20,
                                    left: 0,
                                    bottom: 10,
                                }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="stage"
                                    tick={{ fontSize: 12 }}
                                />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip formatter={(v: any) => [v, "Leads"]} />
                                <Legend />
                                <Bar
                                    dataKey="value"
                                    name="Leads"
                                    fill="#193E6B"
                                    radius={[8, 8, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full w-full animate-pulse rounded-lg bg-[#F5F5F5] ring-1 ring-gray-200" />
                    )}
                </div>
            </div>

            {/* Drop-off (rate + count) */}
            <div className="min-w-0 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-[#193E6B]">
                        Drop-off (rate & count)
                    </div>
                    <div className="text-xs text-gray-500">
                        Where leads are lost
                    </div>
                </div>

                <div className="mt-4 h-[280px] min-w-0">
                    {mounted ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                                data={dropData}
                                margin={{
                                    top: 10,
                                    right: 20,
                                    left: 0,
                                    bottom: 10,
                                }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="step" tick={{ fontSize: 11 }} />
                                <YAxis
                                    yAxisId="left"
                                    tick={{ fontSize: 12 }}
                                    tickFormatter={(v) => `${v}`}
                                />
                                <YAxis
                                    yAxisId="right"
                                    orientation="right"
                                    tick={{ fontSize: 12 }}
                                    tickFormatter={(v) =>
                                        `${Number(v).toFixed(0)}%`
                                    }
                                />
                                <Tooltip
                                    formatter={(value: any, name: any) => {
                                        if (name === "dropCount")
                                            return [value, "Drop count"];
                                        if (name === "dropRate")
                                            return [
                                                `${Number(value).toFixed(1)}%`,
                                                "Drop rate",
                                            ];
                                        return [value, name];
                                    }}
                                />
                                <Legend />
                                <Line
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="dropCount"
                                    name="Drop count"
                                    stroke="#193E6B"
                                    strokeWidth={2}
                                    dot={false}
                                />
                                <Line
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="dropRate"
                                    name="Drop rate (%)"
                                    stroke="#B3A125"
                                    strokeWidth={2}
                                    dot={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full w-full animate-pulse rounded-lg bg-[#F5F5F5] ring-1 ring-gray-200" />
                    )}
                </div>
            </div>
        </div>
    );
}
