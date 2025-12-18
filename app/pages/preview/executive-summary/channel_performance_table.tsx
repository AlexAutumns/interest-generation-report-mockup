type ChannelRow = {
    channel: string;
    leads: number;
    converted: number;
    conversionRate: number;
    revenueUsd: number;
    costUsd: number;
};

type Props = {
    channels: ChannelRow[];
};

export default function ChannelPerformanceTable(props: Props) {
    const { channels } = props;

    return (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between px-5 py-4">
                <div className="text-base font-semibold text-[#193E6B]">
                    Channel performance (summary)
                </div>
                <span className="text-xs text-gray-500">
                    Revenue and cost in USD
                </span>
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
                        </tr>
                    </thead>

                    <tbody>
                        {channels.map((c) => (
                            <tr
                                key={c.channel}
                                className="border-t border-gray-100"
                            >
                                <td className="px-5 py-3 font-semibold text-[#193E6B]">
                                    {c.channel}
                                </td>
                                <td className="px-5 py-3 text-gray-700">
                                    {c.leads}
                                </td>
                                <td className="px-5 py-3 text-gray-700">
                                    {c.converted}
                                </td>
                                <td className="px-5 py-3 text-gray-700">
                                    {c.conversionRate.toFixed(1)}%
                                </td>
                                <td className="px-5 py-3 text-gray-700">
                                    ${c.revenueUsd.toLocaleString()}
                                </td>
                                <td className="px-5 py-3 text-gray-700">
                                    ${c.costUsd.toLocaleString()}
                                </td>
                            </tr>
                        ))}

                        {channels.length === 0 && (
                            <tr>
                                <td
                                    className="px-5 py-6 text-sm text-gray-600"
                                    colSpan={6}
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
