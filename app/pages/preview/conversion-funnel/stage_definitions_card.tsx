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
                        Prototype definitions for the engagement journey. We’ll
                        align these with SOP later.
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
                            Lead created/ingested into the pipeline.
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
                            Initial outreach attempted (email/call/message).
                        </div>
                    </div>

                    <div className="rounded-lg bg-[#F5F5F5] p-3 text-gray-700 ring-1 ring-gray-200">
                        <div className="font-semibold text-[#193E6B]">
                            Engaged{" "}
                            <span className="ml-2 rounded-full bg-[#B3A125]/10 px-2 py-0.5 text-xs font-semibold text-[#193E6B] ring-1 ring-[#B3A125]/25">
                                Stage 3
                            </span>
                        </div>
                        <div className="mt-1">
                            Meaningful interaction happened (reply/click/meeting
                            booked).
                        </div>
                    </div>

                    <div className="rounded-lg bg-[#F5F5F5] p-3 text-gray-700 ring-1 ring-gray-200">
                        <div className="font-semibold text-[#193E6B]">
                            Qualified{" "}
                            <span className="ml-2 rounded-full bg-[#B3A125]/10 px-2 py-0.5 text-xs font-semibold text-[#193E6B] ring-1 ring-[#B3A125]/25">
                                Stage 4
                            </span>
                        </div>
                        <div className="mt-1">
                            Meets criteria/intent threshold (e.g., score band,
                            fit, readiness).
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
                            opportunity).
                        </div>
                    </div>
                </div>

                <div className="mt-4 rounded-lg border border-[#B3A125]/25 bg-[#B3A125]/10 p-3 text-xs text-[#193E6B]">
                    Note: These labels are for mockup clarity — final stage
                    logic will be derived from real engagement events.
                </div>
            </div>
        </div>
    );
}
