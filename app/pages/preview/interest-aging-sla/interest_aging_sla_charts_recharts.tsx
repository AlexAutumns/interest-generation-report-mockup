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
} from "recharts";

import type { AgingRow } from "./interest_aging_sla_helpers";

type Props = {
    rows: AgingRow[];
};

export default function InterestAgingSlaChartsRecharts({ rows }: Props) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const data = useMemo(
        () =>
            rows.map((r) => ({
                label: r.label,
                count: r.count,
                percent: r.percent,
            })),
        [rows]
    );

    return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 min-w-0 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-[#193E6B]">
                        Interest aging distribution
                    </div>
                    <div className="text-xs text-gray-500">
                        Active leads only (mock distribution)
                    </div>
                </div>

                <div className="mt-4 h-[280px] min-w-0">
                    {mounted ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={data}
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
                                    formatter={(v: any, name: any) => {
                                        if (name === "count")
                                            return [v, "Leads"];
                                        if (name === "percent")
                                            return [
                                                `${Number(v).toFixed(1)}%`,
                                                "% of active",
                                            ];
                                        return [v, name];
                                    }}
                                />
                                <Legend />
                                <Bar
                                    dataKey="count"
                                    fill="#193E6B"
                                    radius={[6, 6, 0, 0]}
                                />
                                <Bar
                                    dataKey="percent"
                                    fill="#B3A125"
                                    radius={[6, 6, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full w-full animate-pulse rounded-lg bg-[#F5F5F5] ring-1 ring-gray-200" />
                    )}
                </div>

                <div className="mt-3 text-xs text-gray-500">
                    Tip: Aging helps identify backlog risk. Pair this with SLA
                    breaches to prioritize follow-ups.
                </div>
            </div>

            <div className="min-w-0 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="text-sm font-semibold text-[#193E6B]">
                    SLA definition (mock)
                </div>

                <div className="mt-3 rounded-lg bg-[#F5F5F5] p-3 ring-1 ring-gray-200">
                    <div className="text-xs text-gray-500">
                        Target response time
                    </div>
                    <div className="mt-1 text-lg font-semibold text-[#193E6B]">
                        24 hours
                    </div>
                    <div className="mt-2 text-xs text-gray-600">
                        Breach means follow-up was initiated after the target
                        window.
                    </div>
                </div>

                <div className="mt-3 rounded-lg border border-[#B3A125]/35 bg-[#B3A125]/10 p-3 text-xs text-[#193E6B]">
                    Note: In the full app, SLA thresholds will be configurable
                    by BU.
                </div>
            </div>
        </div>
    );
}
