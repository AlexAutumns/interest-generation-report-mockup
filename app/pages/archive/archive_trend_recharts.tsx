import { useEffect, useMemo, useState } from "react";
import { BarChart3 } from "lucide-react";
import { getMonthKey, monthLabelFromKey } from "./archive_helpers";

import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
} from "recharts";

type ReportSummary = {
    generatedOn: string;
};

type Props = {
    reports: ReportSummary[];
};

export default function ArchiveTrendRecharts(props: Props) {
    const { reports } = props;

    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    const data = useMemo(() => {
        const counts = new Map<string, number>();
        for (const r of reports) {
            const key = getMonthKey(r.generatedOn);
            counts.set(key, (counts.get(key) ?? 0) + 1);
        }

        const sortedKeys = [...counts.keys()].sort(); // YYYY-MM
        return sortedKeys.map((k) => ({
            monthKey: k,
            month: monthLabelFromKey(k),
            reports: counts.get(k) ?? 0,
        }));
    }, [reports]);

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-[#193E6B]" />
                    <div className="text-sm font-semibold text-[#193E6B]">
                        Archive trend
                    </div>
                </div>
                <div className="h-2.5 w-2.5 rounded-full bg-[#B3A125]" />
            </div>

            <div className="mt-1 text-xs text-gray-500">
                Reports generated per month (based on current filters)
            </div>

            <div className="mt-3 h-[220px] min-w-0">
                {mounted ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={data}
                            margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                            <YAxis
                                tick={{ fontSize: 12 }}
                                allowDecimals={false}
                            />
                            <Tooltip formatter={(v: any) => [v, "Reports"]} />
                            <Bar
                                dataKey="reports"
                                fill="#193E6B"
                                radius={[6, 6, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full w-full animate-pulse rounded-lg bg-[#F5F5F5] ring-1 ring-gray-200" />
                )}
            </div>
        </div>
    );
}
