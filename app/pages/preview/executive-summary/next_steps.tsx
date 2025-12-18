import { Link } from "react-router";
import { ArrowRight } from "lucide-react";

type Props = {
    reportId: string;
};

export default function NextSteps(props: Props) {
    const { reportId } = props;

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="text-sm font-semibold text-[#193E6B]">
                Next steps
            </div>

            <div className="mt-3 flex flex-col gap-2">
                <Link
                    to={`/preview/kpi-overview?reportId=${encodeURIComponent(reportId)}`}
                    className="inline-flex items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-[#193E6B] hover:bg-gray-50"
                >
                    KPI Overview
                    <ArrowRight className="h-4 w-4 text-[#193E6B]/70" />
                </Link>

                <Link
                    to={`/preview/campaign-channel?reportId=${encodeURIComponent(reportId)}`}
                    className="inline-flex items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-[#193E6B] hover:bg-gray-50"
                >
                    Campaign & Channel Analysis
                    <ArrowRight className="h-4 w-4 text-[#193E6B]/70" />
                </Link>

                <Link
                    to={`/preview/conversion-funnel?reportId=${encodeURIComponent(reportId)}`}
                    className="inline-flex items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-[#193E6B] hover:bg-gray-50"
                >
                    Conversion & Funnel
                    <ArrowRight className="h-4 w-4 text-[#193E6B]/70" />
                </Link>

                <div className="mt-3 rounded-lg border border-[#B3A125]/35 bg-[#B3A125]/10 p-3 text-xs text-[#193E6B]">
                    Tip: Use the Archive page to compare periods and identify
                    patterns before exporting.
                </div>
            </div>
        </div>
    );
}
