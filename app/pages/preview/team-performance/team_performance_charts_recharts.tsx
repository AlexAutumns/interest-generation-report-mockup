import { useEffect, useMemo, useState } from "react";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
} from "recharts";

import type { AgentRowUi } from "./team_performance_helpers";

type Props = {
    rows: AgentRowUi[];
};

function shortName(name: string) {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0];
    return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

export default function TeamPerformanceChartsRecharts({ rows }: Props) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const top = useMemo(
        () =>
            rows.slice(0, 8).map((r) => ({
                agent: r.agent,
                agentShort: shortName(r.agent),
                leads: r.leads,
                converted: r.converted,
                conversionRate: r.conversionRate,
            })),
        [rows]
    );

    return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 min-w-0 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-[#193E6B]">
                        Top performers (Leads vs Converted)
                    </div>
                    <div className="text-xs text-gray-500">
                        Top 8 by rank score
                    </div>
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
                                    dataKey="agentShort"
                                    tick={{ fontSize: 12 }}
                                />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip
                                    formatter={(v: any, name: any) => {
                                        if (name === "leads")
                                            return [v, "Leads"];
                                        if (name === "converted")
                                            return [v, "Converted"];
                                        return [v, name];
                                    }}
                                    labelFormatter={(label) =>
                                        `Agent: ${label}`
                                    }
                                />
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

            <div className="min-w-0 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="text-sm font-semibold text-[#193E6B]">
                    How ranking works (mock)
                </div>

                <div className="mt-3 rounded-lg bg-[#F5F5F5] p-3 ring-1 ring-gray-200">
                    <ul className="list-disc space-y-2 pl-5 text-xs text-gray-700">
                        <li>
                            <span className="font-semibold text-[#193E6B]">
                                Conversion rate
                            </span>{" "}
                            (highest weight)
                        </li>
                        <li>
                            <span className="font-semibold text-[#193E6B]">
                                Avg lead score
                            </span>{" "}
                            (quality)
                        </li>
                        <li>
                            <span className="font-semibold text-[#193E6B]">
                                Leads volume
                            </span>{" "}
                            (lower weight)
                        </li>
                    </ul>
                </div>

                <div className="mt-3 rounded-lg border border-[#B3A125]/35 bg-[#B3A125]/10 p-3 text-xs text-[#193E6B]">
                    In the full app, ranking logic can be aligned to DSM/EBM
                    KPIs.
                </div>
            </div>
        </div>
    );
}
