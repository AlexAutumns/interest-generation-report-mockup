import { FilePlus2 } from "lucide-react";
import GenerateReportForm from "./generate_report_form";

export default function GenerateReportPage() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                    <FilePlus2 className="h-5 w-5 text-[#193E6B]" />
                    <h1 className="text-xl font-semibold text-[#193E6B]">
                        Generate Report
                    </h1>
                </div>
                <p className="text-sm text-gray-600">
                    Configure a weekly, monthly, or quarterly report. This
                    mockup always produces an in-app JSON report object; exports
                    are selected here for later.
                </p>
            </div>

            <GenerateReportForm />
        </div>
    );
}
