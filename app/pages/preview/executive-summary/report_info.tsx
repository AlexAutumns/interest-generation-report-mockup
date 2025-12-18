import { BadgeCheck, CalendarDays, User } from "lucide-react";
import {
    formatDateRange,
    formatDateTime,
    statusBadge,
} from "./executive_summary_helpers";

type Props = {
    name: string;
    periodLabel: string;
    periodStart: string;
    periodEnd: string;
    status: string;
    generatedOn: string;
    generatedBy: string;
};

export default function ReportInfo(props: Props) {
    const {
        name,
        periodLabel,
        periodStart,
        periodEnd,
        status,
        generatedOn,
        generatedBy,
    } = props;

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <div className="text-base font-semibold text-[#193E6B]">
                        {name}
                    </div>
                    <div className="mt-1 text-sm text-gray-600">
                        {periodLabel} •{" "}
                        {formatDateRange(periodStart, periodEnd)}
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${statusBadge(
                            status
                        )}`}
                    >
                        <BadgeCheck className="h-4 w-4" />
                        {status}
                    </span>

                    <span className="inline-flex items-center gap-2 rounded-full bg-[#193E6B]/5 px-3 py-1 text-xs font-semibold text-[#193E6B] ring-1 ring-[#193E6B]/10">
                        <CalendarDays className="h-4 w-4" />
                        Generated: {formatDateTime(generatedOn)}
                    </span>

                    <span className="inline-flex items-center gap-2 rounded-full bg-[#193E6B]/5 px-3 py-1 text-xs font-semibold text-[#193E6B] ring-1 ring-[#193E6B]/10">
                        <User className="h-4 w-4" />
                        {generatedBy}
                    </span>
                </div>
            </div>
        </div>
    );
}
