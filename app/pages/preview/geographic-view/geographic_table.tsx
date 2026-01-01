import type { GeoMetricKey, RegionRow } from "./geographic_helpers";
import {
    formatMetricValue,
    getMetricValue,
    metricLabel,
} from "./geographic_helpers";

type Props = {
    rows: RegionRow[];
    metricKey: GeoMetricKey;
};

export default function GeographicTable({ rows, metricKey }: Props) {
    const sorted = [...rows].sort(
        (a, b) => getMetricValue(b, metricKey) - getMetricValue(a, metricKey)
    );

    return (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between px-5 py-4">
                <div>
                    <div className="text-base font-semibold text-[#193E6B]">
                        Country breakdown
                    </div>
                    <p className="mt-1 text-sm text-gray-600">
                        Sorted by {metricLabel(metricKey).toLowerCase()}.
                    </p>
                </div>

                <div className="rounded-md border border-[#B3A125]/35 bg-[#B3A125]/10 px-3 py-1 text-xs font-semibold text-[#193E6B]">
                    {metricLabel(metricKey)}
                </div>
            </div>

            <div className="overflow-auto border-t border-gray-200">
                <table className="w-full text-left text-sm">
                    <thead className="sticky top-0 bg-white">
                        <tr className="text-xs uppercase tracking-wide text-gray-500">
                            <th className="px-5 py-3">Country</th>
                            <th className="px-5 py-3">Leads</th>
                            <th className="px-5 py-3">Converted</th>
                            <th className="px-5 py-3">Conv. Rate</th>
                            <th className="px-5 py-3">
                                {metricLabel(metricKey)}
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {sorted.map((r) => (
                            <tr
                                key={r.region}
                                className="border-t border-gray-100 hover:bg-[#193E6B]/[0.03]"
                            >
                                <td className="px-5 py-3 font-semibold text-[#193E6B]">
                                    {r.region}
                                </td>
                                <td className="px-5 py-3 text-gray-700">
                                    {r.leads.toLocaleString()}
                                </td>
                                <td className="px-5 py-3 text-gray-700">
                                    {r.converted.toLocaleString()}
                                </td>
                                <td className="px-5 py-3 text-gray-700">
                                    {r.conversionRate.toFixed(1)}%
                                </td>
                                <td className="px-5 py-3 text-gray-700">
                                    {formatMetricValue(
                                        metricKey,
                                        getMetricValue(r, metricKey)
                                    )}
                                </td>
                            </tr>
                        ))}

                        {sorted.length === 0 && (
                            <tr>
                                <td
                                    className="px-5 py-6 text-sm text-gray-600"
                                    colSpan={5}
                                >
                                    No regional data available in this report.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
