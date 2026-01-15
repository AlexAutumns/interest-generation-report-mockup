import { ListChecks } from "lucide-react";

export default function StageDefinitionsCard() {
    return (
        <div className="h-full rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex h-full flex-col">
                <div>
                    <div className="flex items-center gap-2">
                        <ListChecks className="h-4 w-4 text-[#193E6B]" />
                        <div className="text-sm font-semibold text-[#193E6B]">
                            Stage definitions
                        </div>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">
                        Prototype definitions aligned to the current mock report
                        logic. We’ll refine these with SOP + event tracking
                        later.
                    </p>
                </div>

                <div className="mt-4 flex-1 space-y-2 text-sm">
                    <div className="rounded-lg bg-[#F5F5F5] p-3 text-gray-700 ring-1 ring-gray-200">
                        <div className="font-semibold text-[#193E6B]">
                            Captured{" "}
                            <span className="ml-2 rounded-full bg-[#B3A125]/10 px-2 py-0.5 text-xs font-semibold text-[#193E6B] ring-1 ring-[#B3A125]/25">
                                Stage 1
                            </span>
                        </div>
                        <div className="mt-1">
                            All leads included in this report period (after
                            report filters). This is the total pipeline entry
                            count.
                        </div>
                    </div>

                    <div className="rounded-lg bg-[#F5F5F5] p-3 text-gray-700 ring-1 ring-gray-200">
                        <div className="font-semibold text-[#193E6B]">
                            Contacted{" "}
                            <span className="ml-2 rounded-full bg-[#B3A125]/10 px-2 py-0.5 text-xs font-semibold text-[#193E6B] ring-1 ring-[#B3A125]/25">
                                Stage 2
                            </span>
                        </div>
                        <div className="mt-1">
                            Outreach initiated. In this mockup, the contacted
                            count is estimated from follow-up speed (or read
                            directly from the generated report if available).
                        </div>
                        {/* NOTE: This clarifies why Contacted can’t be perfectly “true” yet without activity logs. */}
                    </div>

                    <div className="rounded-lg bg-[#F5F5F5] p-3 text-gray-700 ring-1 ring-gray-200">
                        <div className="font-semibold text-[#193E6B]">
                            Engaged{" "}
                            <span className="ml-2 rounded-full bg-[#B3A125]/10 px-2 py-0.5 text-xs font-semibold text-[#193E6B] ring-1 ring-[#B3A125]/25">
                                Stage 3
                            </span>
                        </div>
                        <div className="mt-1">
                            Lead progressed beyond initial state. In the mock
                            logic, this is treated as leads in status{" "}
                            <span className="font-semibold">Engaged</span> or
                            later (Engaged + Qualified + Converted).
                        </div>
                        {/* Engaged is cumulative in the funnel (monotonic), not just "Engaged status count". */}
                    </div>

                    <div className="rounded-lg bg-[#F5F5F5] p-3 text-gray-700 ring-1 ring-gray-200">
                        <div className="font-semibold text-[#193E6B]">
                            Qualified{" "}
                            <span className="ml-2 rounded-full bg-[#B3A125]/10 px-2 py-0.5 text-xs font-semibold text-[#193E6B] ring-1 ring-[#B3A125]/25">
                                Stage 4
                            </span>
                        </div>
                        <div className="mt-1">
                            Meets readiness/fit threshold. In the mock logic,
                            this is leads in status{" "}
                            <span className="font-semibold">Qualified</span> or
                            later (Qualified + Converted).
                        </div>
                    </div>

                    <div className="rounded-lg bg-[#F5F5F5] p-3 text-gray-700 ring-1 ring-gray-200">
                        <div className="font-semibold text-[#193E6B]">
                            Converted{" "}
                            <span className="ml-2 rounded-full bg-[#B3A125]/10 px-2 py-0.5 text-xs font-semibold text-[#193E6B] ring-1 ring-[#B3A125]/25">
                                Stage 5
                            </span>
                        </div>
                        <div className="mt-1">
                            Successfully converted (won / advanced to
                            opportunity). In the mock logic, this matches{" "}
                            <span className="font-semibold">Converted</span>{" "}
                            status (and aligns with executive summary conversion
                            totals).
                        </div>
                    </div>
                </div>

                <div className="mt-4 rounded-lg border border-[#B3A125]/25 bg-[#B3A125]/10 p-3 text-xs text-[#193E6B]">
                    Note: “Lost” is tracked separately (not part of the main
                    monotonic funnel). Final stage logic should be derived from
                    real engagement events (calls/emails/replies/meetings) once
                    those data sources are available.
                </div>
            </div>
        </div>
    );
}
