import { toast } from "sonner";
import { Download } from "lucide-react";
import { cn } from "../../../utils/cn";
import type { ChannelRow } from "./campaign_channel_helpers";
import { formatUsd } from "./campaign_channel_helpers";

type Props = {
    rows: ChannelRow[];
};

export default function ChannelRoiTable({ rows }: Props) {
    function handleExportMock() {
        toast.info("Export is coming soon (mockup)", {
            description:
                "Export will be enabled after generation logic is finalized.",
        });
    }

    return (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between px-5 py-4">
                <div>
                    <div className="text-base font-semibold text-[#193E6B]">
                        Channel performance (table)
                    </div>
                    <p className="mt-1 text-sm text-gray-600">
                        Leads, conversion, and ROI view (USD).
                    </p>
                </div>

                <button
                    type="button"
                    onClick={handleExportMock}
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
                            <th className="px-5 py-3">Conv. Rate</th>
                            <th className="px-5 py-3">Revenue (USD)</th>
                            <th className="px-5 py-3">Cost (USD)</th>
                            <th className="px-5 py-3">ROI</th>
                        </tr>
                    </thead>

                    <tbody>
                        {rows.map((r) => (
                            <tr
                                key={r.channel}
                                className="border-t border-gray-100 hover:bg-[#193E6B]/[0.03]"
                            >
                                <td className="px-5 py-3 font-semibold text-[#193E6B]">
                                    {r.channel}
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
                                    {formatUsd(r.revenueUsd)}
                                </td>
                                <td className="px-5 py-3 text-gray-700">
                                    {formatUsd(r.costUsd)}
                                </td>
                                <td className="px-5 py-3">
                                    <span
                                        className={cn(
                                            "inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ring-1",
                                            r.roiPercent >= 0
                                                ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                                                : "bg-rose-50 text-rose-700 ring-rose-200"
                                        )}
                                    >
                                        {r.roiPercent.toFixed(1)}%
                                    </span>
                                </td>
                            </tr>
                        ))}

                        {rows.length === 0 && (
                            <tr>
                                <td
                                    className="px-5 py-6 text-sm text-gray-600"
                                    colSpan={7}
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
