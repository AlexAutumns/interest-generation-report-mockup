import {
    type RouteConfig,
    index,
    route,
    layout,
    prefix,
} from "@react-router/dev/routes";

export default [
    layout("routes/app-layout.tsx", [
        // "/" → Home
        index("routes/home.tsx"),

        // "/archive"
        route("archive", "routes/archive.tsx"),

        // "/generate"
        route("generate", "routes/generate.tsx"),

        // "/generate/loading"
        route("generate/loading", "routes/generate.loading.tsx"),

        // "/preview/executive-summary"
        route(
            "preview/executive-summary",
            "routes/preview.executive_summary.tsx"
        ),

        // "/preview/kpi-overview"
        route("preview/kpi-overview", "routes/preview.kpi_overview.tsx"),

        // "/preview/campaign-channel"
        route(
            "preview/campaign-channel",
            "routes/preview.campaign_channel.tsx"
        ),

        // "/preview/conversion-funnel"
        route(
            "preview/conversion-funnel",
            "routes/preview.conversion_funnel.tsx"
        ),

        // "/preview/closed-lost"
        route("preview/closed-lost", "routes/preview.closed_lost.tsx"),

        // "/preview/interest-aging-sla"
        route(
            "preview/interest-aging-sla",
            "routes/preview.interest_aging_sla.tsx"
        ),

        // "/preview/team-performance"
        route(
            "preview/team-performance",
            "routes/preview.team_performance.tsx"
        ),

        // "/preview/geographic-view"
        route("preview/geographic-view", "routes/preview.geographic_view.tsx"),
    ]),
] satisfies RouteConfig;
