import { toast } from "sonner";
import { Download } from "lucide-react";
import { cn } from "../../../utils/cn";
import type { CampaignRow } from "./campaign_channel_helpers";
import { formatUsd } from "./campaign_channel_helpers";

type Props = {
    rows: CampaignRow[];
};

export default function CampaignRoiTable({ rows }: Props) {
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
                        Campaign performance table
                    </div>
                    <p className="mt-1 text-sm text-gray-600">
                        ROI and efficiency metrics per campaign.
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
                            <th className="px-5 py-3">Campaign</th>
                            <th className="px-5 py-3">Leads</th>
                            <th className="px-5 py-3">Converted</th>
                            <th className="px-5 py-3">Conv. Rate</th>
                            <th className="px-5 py-3">Revenue</th>
                            <th className="px-5 py-3">Cost</th>
                            <th className="px-5 py-3">ROI</th>
                            <th className="px-5 py-3">CPL</th>
                            <th className="px-5 py-3">Cost/Conv</th>
                        </tr>
                    </thead>

                    <tbody>
                        {rows.map((r) => (
                            <tr
                                key={r.campaign}
                                className="border-t border-gray-100 hover:bg-[#193E6B]/[0.03]"
                            >
                                <td className="px-5 py-3 font-semibold text-[#193E6B]">
                                    {r.campaign}
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
                                <td className="px-5 py-3 text-gray-700">
                                    {formatUsd(r.cplUsd)}
                                </td>
                                <td className="px-5 py-3 text-gray-700">
                                    {r.converted > 0
                                        ? formatUsd(r.cpcUsd)
                                        : "—"}
                                </td>
                            </tr>
                        ))}

                        {rows.length === 0 && (
                            <tr>
                                <td
                                    className="px-5 py-6 text-sm text-gray-600"
                                    colSpan={9}
                                >
                                    No campaign data available for this report.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
