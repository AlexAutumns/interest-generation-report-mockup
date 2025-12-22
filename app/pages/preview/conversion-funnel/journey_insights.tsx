import { toast } from "sonner";
import { Copy, Lightbulb } from "lucide-react";
import { cn } from "../../../utils/cn";

type Props = {
    insights: string[];
};

export default function JourneyInsights({ insights }: Props) {
    function handleCopy() {
        const text = insights.map((x) => `• ${x}`).join("\n");
        if (navigator?.clipboard?.writeText) {
            navigator.clipboard
                .writeText(text)
                .then(() => toast.success("Insights copied"))
                .catch(() =>
                    toast.info("Copy failed", {
                        description: "Please copy manually.",
                    })
                );
        } else {
            toast.info("Copy not supported", {
                description: "Please copy manually.",
            });
        }
    }

    return (
        <div className="h-full rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex h-full flex-col">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <Lightbulb className="h-4 w-4 text-[#193E6B]" />
                            <div className="text-sm font-semibold text-[#193E6B]">
                                Journey insights
                            </div>
                        </div>
                        <p className="mt-1 text-sm text-gray-600">
                            Takeaways derived from stage progression and score
                            bands.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleCopy}
                        className={cn(
                            "inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-semibold",
                            "text-[#193E6B] hover:bg-gray-50"
                        )}
                    >
                        <Copy className="h-4 w-4 text-[#193E6B]/70" />
                        Copy
                    </button>
                </div>

                <div className="mt-4 flex-1">
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {insights.map((x, i) => (
                            <div
                                key={i}
                                className="group rounded-lg bg-[#F5F5F5] p-3 ring-1 ring-gray-200 transition hover:bg-white"
                            >
                                <div className="flex items-start gap-3">
                                    <span className="mt-1 inline-flex h-2.5 w-2.5 shrink-0 rounded-full bg-[#B3A125]" />
                                    <div className="text-sm text-gray-700">
                                        {x}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {insights.length === 0 && (
                        <div className="rounded-lg bg-[#F5F5F5] p-4 text-sm text-gray-600 ring-1 ring-gray-200">
                            No insights available yet for this report.
                        </div>
                    )}
                </div>

                <div className="mt-4 rounded-lg border border-[#B3A125]/25 bg-[#B3A125]/10 p-3 text-xs text-[#193E6B]">
                    Tip: Later, we can generate recommendations automatically
                    and route them into the dedicated Recommendations & Action
                    Items page.
                </div>
            </div>
        </div>
    );
}
