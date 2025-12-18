import { BadgeCheck, CalendarDays, Layers, Percent, Files } from "lucide-react";
import { formatGeneratedOn, mostCommonType, percent } from "./archive_helpers";

type ReportSummary = {
    id: string;
    name: string;
    periodLabel: string;
    generatedOn: string;
    generatedBy: string;
    type: string;
    status: string;
};

type Props = {
    reports: ReportSummary[];
};

export default function ArchiveInsights(props: Props) {
    const { reports } = props;

    const total = reports.length;
    const completed = reports.filter((r) => r.status === "Completed").length;

    const latest = [...reports].sort(
        (a, b) =>
            new Date(b.generatedOn).getTime() -
            new Date(a.generatedOn).getTime()
    )[0];

    const commonType = mostCommonType(reports.map((r) => r.type));
    const completionRate = percent(completed, total);

    return (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#193E6B]">
                    <Files className="h-4 w-4" />
                    Total reports
                </div>
                <div className="mt-2 text-2xl font-semibold text-[#193E6B]">
                    {total}
                </div>
                <div className="mt-1 text-xs text-gray-500">
                    Filtered results
                </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#193E6B]">
                    <BadgeCheck className="h-4 w-4" />
                    Completion
                </div>
                <div className="mt-2 text-2xl font-semibold text-[#193E6B]">
                    {completionRate.toFixed(0)}%
                </div>
                <div className="mt-1 text-xs text-gray-500">
                    {completed} completed
                </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#193E6B]">
                    <Layers className="h-4 w-4" />
                    Most common type
                </div>
                <div className="mt-2 text-2xl font-semibold text-[#193E6B]">
                    {commonType}
                </div>
                <div className="mt-1 text-xs text-gray-500">
                    Within filtered set
                </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#193E6B]">
                    <CalendarDays className="h-4 w-4" />
                    Latest generated
                </div>
                <div className="mt-2 text-sm font-semibold text-[#193E6B]">
                    {latest ? formatGeneratedOn(latest.generatedOn) : "—"}
                </div>
                <div className="mt-1 text-xs text-gray-500">
                    {latest ? latest.name : "No reports"}
                </div>
            </div>
        </div>
    );
}
