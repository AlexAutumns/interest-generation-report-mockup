import { motion } from "framer-motion";
import {
    BarChart3,
    Target,
    TrendingUp,
    Timer,
    Sparkles,
    DollarSign,
    Wallet,
    BadgePercent,
} from "lucide-react";
import { cn } from "../../../utils/cn";
import type { KpiTilesData } from "./kpi_overview_types";
import { formatUsd } from "./kpi_overview_helpers";

type Props = {
    tiles: KpiTilesData;
};

function Tile(props: {
    title: string;
    value: string;
    subtitle: string;
    icon: React.ReactNode;
    accent?: "blue" | "gold";
}) {
    const accent = props.accent ?? "blue";
    const ring =
        accent === "gold"
            ? "ring-1 ring-[#B3A125]/25 bg-[#B3A125]/10"
            : "ring-1 ring-[#193E6B]/10 bg-[#193E6B]/5";

    return (
        <motion.div whileHover={{ y: -2 }} className="h-full">
            <div className="h-full rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-[#193E6B]">
                        {props.icon}
                        {props.title}
                    </div>
                    <span
                        className={cn(
                            "rounded-full px-3 py-1 text-xs font-semibold",
                            ring
                        )}
                    >
                        KPI
                    </span>
                </div>

                <div className="mt-2 text-2xl font-semibold text-[#193E6B]">
                    {props.value}
                </div>
                <div className="mt-1 text-xs text-gray-500">
                    {props.subtitle}
                </div>
            </div>
        </motion.div>
    );
}

export default function KpiTiles({ tiles }: Props) {
    return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
            <Tile
                title="Total leads"
                value={`${tiles.totalLeads}`}
                subtitle="Leads created within the selected period"
                icon={<BarChart3 className="h-4 w-4" />}
            />
            <Tile
                title="Converted leads"
                value={`${tiles.convertedLeads}`}
                subtitle="Leads marked as converted"
                icon={<Target className="h-4 w-4" />}
                accent="gold"
            />
            <Tile
                title="Conversion rate"
                value={`${tiles.conversionRate.toFixed(1)}%`}
                subtitle="Converted / total leads"
                icon={<TrendingUp className="h-4 w-4" />}
            />
            <Tile
                title="Avg follow-up time"
                value={`${tiles.avgFollowUpHours.toFixed(1)}h`}
                subtitle="Average time to first follow-up"
                icon={<Timer className="h-4 w-4" />}
            />

            <Tile
                title="Avg lead score"
                value={`${tiles.avgLeadScore.toFixed(1)}`}
                subtitle="Engagement/quality score (mock)"
                icon={<Sparkles className="h-4 w-4" />}
                accent="gold"
            />
            <Tile
                title="Revenue (USD)"
                value={formatUsd(tiles.totalRevenueUsd)}
                subtitle="Estimated revenue from converted leads"
                icon={<DollarSign className="h-4 w-4" />}
            />
            <Tile
                title="Cost (USD)"
                value={formatUsd(tiles.totalCostUsd)}
                subtitle="Estimated spend across channels"
                icon={<Wallet className="h-4 w-4" />}
            />
            <Tile
                title="ROI"
                value={`${tiles.roiPercent.toFixed(1)}%`}
                subtitle="(Revenue − Cost) / Cost"
                icon={<BadgePercent className="h-4 w-4" />}
                accent="gold"
            />
        </div>
    );
}
