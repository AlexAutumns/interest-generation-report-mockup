import { useEffect, useState } from "react";
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
} from "recharts";
import type { TrendPoint } from "./kpi_overview_types";

type Props = {
    trend: TrendPoint[];
};

export default function KpiTrendRecharts({ trend }: Props) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div className="min-w-0 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-semibold text-[#193E6B]">
                    KPI trend (mock)
                </div>
                <div className="text-xs text-gray-500">Leads vs Converted</div>
            </div>

            <div className="mt-4 h-[280px] min-w-0">
                {mounted ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={trend}
                            margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip
                                formatter={(value: any, name: any) => {
                                    if (name === "totalLeads")
                                        return [value, "Total leads"];
                                    if (name === "convertedLeads")
                                        return [value, "Converted"];
                                    if (name === "conversionRate")
                                        return [
                                            `${Number(value).toFixed(1)}%`,
                                            "Conv. rate",
                                        ];
                                    return [value, name];
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="totalLeads"
                                stroke="#193E6B"
                                strokeWidth={2}
                                dot={false}
                            />
                            <Line
                                type="monotone"
                                dataKey="convertedLeads"
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
    );
}
