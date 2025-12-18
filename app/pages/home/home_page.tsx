import GenerateReportCta from "./generate_report_cta";
import LatestSnapshotRecharts from "./latest_snapshot_recharts";
import RecentReportsTable from "./recent_reports_table";

import { Home as HomeIcon, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function HomePage() {
    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col gap-1"
            >
                <div className="flex items-center gap-2">
                    <HomeIcon className="h-5 w-5 text-[#193E6B]" />
                    <h1 className="text-xl font-semibold text-[#193E6B]">
                        Home
                    </h1>

                    <span className="ml-2 inline-flex items-center gap-2 rounded-full bg-[#B3A125]/10 px-3 py-1 text-xs font-semibold text-[#193E6B] ring-1 ring-[#B3A125]/25">
                        <Sparkles className="h-3.5 w-3.5" />
                        Report Workspace
                    </span>
                </div>

                <p className="text-sm text-gray-600">
                    Generate and review weekly, monthly, and quarterly Interest
                    Generation reports.
                </p>
            </motion.div>

            {/* Top row */}
            <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: 0.05 }}
                    whileHover={{ y: -2 }}
                    className="lg:col-span-6 h-full"
                >
                    <GenerateReportCta />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: 0.1 }}
                    whileHover={{ y: -2 }}
                    className="lg:col-span-6 h-full min-w-0"
                >
                    <LatestSnapshotRecharts />
                </motion.div>
            </div>

            {/* Recent Reports */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.05 }}
                whileHover={{ y: -2 }}
            >
                <RecentReportsTable />
            </motion.div>
        </div>
    );
}
