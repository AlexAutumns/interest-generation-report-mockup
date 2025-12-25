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

        // // "/generate"
        // route("generate", "routes/generate.tsx"),

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
    ]),
] satisfies RouteConfig;
