// app/state/generate_report_store.ts
import { create } from "zustand";
import type { GenerateReportFormValues } from "../pages/generate-report/generate_report_schema";

type GenerateReportState = {
    lastSettings: GenerateReportFormValues | null;
    setLastSettings: (settings: GenerateReportFormValues) => void;
    clearLastSettings: () => void;
};

export const useGenerateReportStore = create<GenerateReportState>((set) => ({
    lastSettings: null,
    setLastSettings: (settings) => set({ lastSettings: settings }),
    clearLastSettings: () => set({ lastSettings: null }),
}));
