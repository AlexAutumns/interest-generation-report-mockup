import type { Route } from "./+types/preview.interest_aging_sla";
import InterestAgingSlaPage from "../pages/preview/interest-aging-sla/interest_aging_sla_page";

export function meta({}: Route.MetaArgs) {
    return [
        { title: "Interest Aging & SLA – Interest Generation" },
        {
            name: "description",
            content:
                "Aging distribution and SLA compliance insights for a report.",
        },
    ];
}

export default function PreviewInterestAgingSlaRoute() {
    return <InterestAgingSlaPage />;
}
