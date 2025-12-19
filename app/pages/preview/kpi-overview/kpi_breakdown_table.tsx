import { toast } from "sonner";
import { Download } from "lucide-react";
import type { BreakdownRow } from "./kpi_overview_types";
import { cn } from "../../../utils/cn";

type Props = {
    rows: BreakdownRow[];
};

export default function KpiBreakdownTable({ rows }: Props) {
    function handleDownloadMock() {
        toast.info("Download is coming soon (mockup)", {
            description:
                "Export will be enabled after generation logic is finalized.",
        });
    }

    return (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between px-5 py-4">
                <div>
                    <div className="text-base font-semibold text-[#193E6B]">
                        Top channels (breakdown)
                    </div>
                    <p className="mt-1 text-sm text-gray-600">
                        Channels ranked by total leads in the selected period.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={handleDownloadMock}
                    className={cn(
                        "inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-semibold",
                        "text-[#193E6B] hover:bg-gray-50"
                    )}
                >
                    <Download className="h-4 w-4 text-[#193E6B]/70" />
                    Export
                </button>
            </div>

            <div className="overflow-auto border-t border-gray-200">
                <table className="w-full text-left text-sm">
                    <thead className="bg-white">
                        <tr className="text-xs uppercase tracking-wide text-gray-500">
                            <th className="px-5 py-3">Channel</th>
                            <th className="px-5 py-3">Leads</th>
                            <th className="px-5 py-3">Converted</th>
                            <th className="px-5 py-3">Conversion Rate</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((r) => (
                            <tr
                                key={r.name}
                                className="border-t border-gray-100 hover:bg-[#193E6B]/[0.03]"
                            >
                                <td className="px-5 py-3 font-semibold text-[#193E6B]">
                                    {r.name}
                                </td>
                                <td className="px-5 py-3 text-gray-700">
                                    {r.totalLeads}
                                </td>
                                <td className="px-5 py-3 text-gray-700">
                                    {r.convertedLeads}
                                </td>
                                <td className="px-5 py-3 text-gray-700">
                                    {r.conversionRate.toFixed(1)}%
                                </td>
                            </tr>
                        ))}

                        {rows.length === 0 && (
                            <tr>
                                <td
                                    className="px-5 py-6 text-sm text-gray-600"
                                    colSpan={4}
                                >
                                    No channel data available for this report.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
