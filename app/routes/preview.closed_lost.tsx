import type { Route } from "./+types/preview.closed_lost";
import ClosedLostPage from "../pages/preview/closed-lost/closed_lost_page";

export function meta({}: Route.MetaArgs) {
    return [
        { title: "Closed-Lost Analysis – Interest Generation" },
        {
            name: "description",
            content: "Closed-lost reason breakdown and insights for a report.",
        },
    ];
}

export default function PreviewClosedLostRoute() {
    return <ClosedLostPage />;
}
