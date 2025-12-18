import GenerateReportCta from "./generate_report_cta";
import LatestSnapshotRecharts from "./latest_snapshot_recharts";
import RecentReportsTable from "./recent_reports_table";

import { Home as HomeIcon } from "lucide-react";

export default function HomePage() {
    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                    <HomeIcon className="h-5 w-5 text-[#193E6B]" />
                    <h1 className="text-xl font-semibold text-[#193E6B]">
                        Home
                    </h1>
                </div>
                <p className="text-sm text-gray-600">
                    Generate and review weekly, monthly, and quarterly Interest
                    Generation reports.
                </p>
            </div>

            {/* Top row */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <GenerateReportCta />
                <LatestSnapshotRecharts />
            </div>

            {/* Recent Reports */}
            <RecentReportsTable />
        </div>
    );
}
