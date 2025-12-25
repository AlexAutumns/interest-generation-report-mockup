import type { AgingRow } from "./interest_aging_sla_helpers";

type Props = {
    rows: AgingRow[];
};

export default function InterestAgingTable({ rows }: Props) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="px-5 py-4">
                <div className="text-base font-semibold text-[#193E6B]">
                    Aging buckets (detail)
                </div>
                <p className="mt-1 text-sm text-gray-600">
                    Counts and share of active leads by aging bucket.
                </p>
            </div>

            <div className="overflow-auto border-t border-gray-200">
                <table className="w-full text-left text-sm">
                    <thead className="bg-white">
                        <tr className="text-xs uppercase tracking-wide text-gray-500">
                            <th className="px-5 py-3">Bucket</th>
                            <th className="px-5 py-3">Leads</th>
                            <th className="px-5 py-3">% of active</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((r) => (
                            <tr
                                key={r.bucket}
                                className="border-t border-gray-100 hover:bg-[#193E6B]/[0.03]"
                            >
                                <td className="px-5 py-3 font-semibold text-[#193E6B]">
                                    {r.label}
                                </td>
                                <td className="px-5 py-3 text-gray-700">
                                    {r.count}
                                </td>
                                <td className="px-5 py-3 text-gray-700">
                                    {r.percent.toFixed(1)}%
                                </td>
                            </tr>
                        ))}

                        {rows.length === 0 && (
                            <tr>
                                <td
                                    className="px-5 py-6 text-sm text-gray-600"
                                    colSpan={3}
                                >
                                    No aging data available for this report.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
