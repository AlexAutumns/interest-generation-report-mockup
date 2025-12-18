import { useEffect, useState } from "react";
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
} from "recharts";

type ChannelTopRow = {
    channel: string;
    channelShort: string;
    leads: number;
    converted: number;
};

type PieRow = {
    name: string;
    value: number;
};

type Props = {
    channelTop: ChannelTopRow[];
    conversionPie: PieRow[];
    totalLeads: number;
    convertedLeads: number;
    conversionRate: number;
};

export default function VisualHighlightsRecharts(props: Props) {
    const {
        channelTop,
        conversionPie,
        totalLeads,
        convertedLeads,
        conversionRate,
    } = props;

    // ✅ Client-only gate for Recharts in framework mode
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Bar chart */}
            <div className="lg:col-span-2 min-w-0 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-[#193E6B]">
                        Top channels (Leads vs Converted)
                    </div>
                    <span className="text-xs text-gray-500">
                        Top 6 by leads
                    </span>
                </div>

                <div className="mt-4 h-[260px] min-w-0">
                    {mounted ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={channelTop}
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
                                    labelFormatter={(label) =>
                                        `Channel: ${label}`
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

            {/* Donut chart */}
            <div className="min-w-0 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="text-sm font-semibold text-[#193E6B]">
                    Conversion split
                </div>
                <div className="mt-1 text-xs text-gray-500">
                    {convertedLeads} of {totalLeads} leads converted
                </div>

                <div className="mt-4 h-[220px] min-w-0">
                    {mounted ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={conversionPie}
                                    dataKey="value"
                                    nameKey="name"
                                    innerRadius={60}
                                    outerRadius={85}
                                    paddingAngle={2}
                                >
                                    <Cell fill="#B3A125" />
                                    <Cell fill="#193E6B" opacity={0.25} />
                                </Pie>
                                <Tooltip formatter={(v: any) => [v, "Leads"]} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full w-full animate-pulse rounded-lg bg-[#F5F5F5] ring-1 ring-gray-200" />
                    )}
                </div>

                <div className="mt-2 rounded-lg bg-[#F5F5F5] p-3 ring-1 ring-gray-200">
                    <div className="text-xs text-gray-500">Conversion rate</div>
                    <div className="text-lg font-semibold text-[#193E6B]">
                        {conversionRate.toFixed(1)}%
                    </div>
                </div>
            </div>
        </div>
    );
}
