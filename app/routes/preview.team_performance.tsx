import type { Route } from "./+types/preview.team_performance";
import TeamPerformancePage from "../pages/preview/team-performance/team_performance_page";

export function meta({}: Route.MetaArgs) {
    return [
        { title: "Team Performance – Interest Generation" },
        {
            name: "description",
            content: "Agent performance ranking and distribution for a report.",
        },
    ];
}

export default function PreviewTeamPerformanceRoute() {
    return <TeamPerformancePage />;
}
