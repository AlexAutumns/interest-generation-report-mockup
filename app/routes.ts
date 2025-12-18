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

        // // "/preview/kpi-overview"
        // route("preview/kpi-overview", "routes/preview.kpi-overview.tsx"),

        // // "/preview/campaign-channel"
        // route(
        //     "preview/campaign-channel",
        //     "routes/preview.campaign-channel.tsx"
        // ),

        // // "/preview/conversion-funnel"
        // route(
        //     "preview/conversion-funnel",
        //     "routes/preview.conversion-funnel.tsx"
        // ),
    ]),
] satisfies RouteConfig;
