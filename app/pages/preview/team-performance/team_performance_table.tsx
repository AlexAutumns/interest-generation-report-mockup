import { toast } from "sonner";
import { Download } from "lucide-react";
import type { AgentRowUi } from "./team_performance_helpers";

type Props = {
    rows: AgentRowUi[];
};

export default function TeamPerformanceTable({ rows }: Props) {
    function handleExportMock() {
        toast.info("Export is coming soon (mockup)", {
            description: "This will export the team performance table later.",
        });
    }

    return (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between px-5 py-4">
                <div>
                    <div className="text-base font-semibold text-[#193E6B]">
                        Team ranking (detail)
                    </div>
                    <p className="mt-1 text-sm text-gray-600">
                        Compare performance by volume, conversion, and lead
                        quality.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={handleExportMock}
                    className="inline-flex items-center gap-2 rounded-md border border-[#B3A125]/35 bg-[#B3A125]/10 px-3 py-2 text-sm font-semibold text-[#193E6B] hover:bg-[#B3A125]/15"
                >
                    <Download className="h-4 w-4" />
                    Export (mock)
                </button>
            </div>

            <div className="overflow-auto border-t border-gray-200">
                <table className="w-full text-left text-sm">
                    <thead className="bg-white">
                        <tr className="text-xs uppercase tracking-wide text-gray-500">
                            <th className="px-5 py-3">Rank</th>
                            <th className="px-5 py-3">Agent</th>
                            <th className="px-5 py-3">Leads</th>
                            <th className="px-5 py-3">Converted</th>
                            <th className="px-5 py-3">Conv. Rate</th>
                            <th className="px-5 py-3">Avg Lead Score</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((r, idx) => (
                            <tr
                                key={r.agent}
                                className="border-t border-gray-100 hover:bg-[#193E6B]/[0.03]"
                            >
                                <td className="px-5 py-3 text-gray-700">
                                    {idx + 1}
                                </td>
                                <td className="px-5 py-3 font-semibold text-[#193E6B]">
                                    {r.agent}
                                </td>
                                <td className="px-5 py-3 text-gray-700">
                                    {r.leads}
                                </td>
                                <td className="px-5 py-3 text-gray-700">
                                    {r.converted}
                                </td>
                                <td className="px-5 py-3 text-gray-700">
                                    {r.conversionRate.toFixed(1)}%
                                </td>
                                <td className="px-5 py-3 text-gray-700">
                                    {r.avgLeadScore.toFixed(1)}
                                </td>
                            </tr>
                        ))}

                        {rows.length === 0 && (
                            <tr>
                                <td
                                    className="px-5 py-6 text-sm text-gray-600"
                                    colSpan={6}
                                >
                                    No team performance data available for this
                                    report.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
