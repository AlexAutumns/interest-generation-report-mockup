// app/services/leads_repository.ts
import type { LeadRow } from "../types/leads";

type LeadsMode = "csv" | "api";

/**
 * Later:
 * - VITE_LEADS_MODE=api -> repository will call real endpoints
 * - default is csv mode (current demo behavior)
 */
const MODE: LeadsMode =
    (import.meta as any).env?.VITE_LEADS_MODE === "api" ? "api" : "csv";

// Cache so we don’t re-parse CSV every time
let cachedLeadsPromise: Promise<LeadRow[]> | null = null;

function toNum(v: string | undefined): number {
    const n = Number((v ?? "").trim());
    return Number.isFinite(n) ? n : 0;
}

// Handles basic quoted CSV (good enough for your current dataset style).
function parseCsvLine(line: string): string[] {
    const out: string[] = [];
    let cur = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const ch = line[i];

        if (ch === '"') {
            // Handle escaped quotes ("")
            const next = line[i + 1];
            if (inQuotes && next === '"') {
                cur += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
            continue;
        }

        if (ch === "," && !inQuotes) {
            out.push(cur);
            cur = "";
            continue;
        }

        cur += ch;
    }

    out.push(cur);
    return out.map((x) => x.trim());
}

function parseCsv(text: string): LeadRow[] {
    const lines = text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);

    if (lines.length < 2) return [];

    const header = parseCsvLine(lines[0]);
    const idx = new Map<string, number>();
    header.forEach((h, i) => idx.set(h, i));

    const get = (row: string[], key: string) => {
        const i = idx.get(key);
        return i === undefined ? "" : (row[i] ?? "");
    };

    const leads: LeadRow[] = [];

    for (let r = 1; r < lines.length; r++) {
        const row = parseCsvLine(lines[r]);

        // If row is malformed, skip
        if (row.length < header.length) continue;

        const createdAt = get(row, "createdAt") || get(row, "createdDate"); // CSV uses createdDate
        if (!createdAt) continue;

        const id = get(row, "id") || get(row, "leadId"); // CSV uses leadId

        const firstResponseAt =
            get(row, "firstResponseAt") ||
            get(row, "firstEngagementDate") ||
            undefined;

        const conversion = toNum(get(row, "conversion"));
        const resolvedAt =
            conversion === 1
                ? get(row, "conversionDate") ||
                  get(row, "resolvedAt") ||
                  undefined
                : get(row, "lastEngagementDate") || undefined;

        const revenueUsd = toNum(get(row, "revenueUsd") || get(row, "revenue"));
        const costUsd = toNum(get(row, "costUsd") || get(row, "sourceCost"));

        const avgFollowUpTime = toNum(get(row, "avgFollowUpTime"));
        const slaBreached =
            get(row, "slaBreached") !== ""
                ? toNum(get(row, "slaBreached"))
                : avgFollowUpTime > 24
                  ? 1
                  : 0;

        leads.push({
            id,
            createdAt,
            firstResponseAt,
            resolvedAt,

            status: get(row, "status"),
            channel: get(row, "channel"),
            campaign: get(row, "campaign"),
            industry: get(row, "industry"),
            region: get(row, "region"),
            agent: get(row, "agent"),

            leadScore: toNum(get(row, "leadScore")),
            conversion: toNum(get(row, "conversion")),
            revenueUsd,
            costUsd,

            followUpCount: toNum(get(row, "followUpCount")),
            avgFollowUpTime,

            slaBreached,
            lostReason: get(row, "lostReason") || undefined,
        });
    }

    return leads;
}

async function loadLeadsFromCsv(): Promise<LeadRow[]> {
    // IMPORTANT: this path is relative to THIS FILE (app/services/*)
    const url = new URL(
        "../data/interest_generation_300_leads.csv",
        import.meta.url
    );

    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(
            `Failed to load leads CSV: ${res.status} ${res.statusText}`
        );
    }

    const text = await res.text();
    return parseCsv(text);
}

async function loadLeadsFromApi(): Promise<LeadRow[]> {
    // later: fetch("/api/leads?start=...&end=...") etc.
    throw new Error("API mode not implemented yet.");
}

export const leadsRepository = {
    mode(): LeadsMode {
        return MODE;
    },

    async listAllLeads(): Promise<LeadRow[]> {
        if (!cachedLeadsPromise) {
            cachedLeadsPromise =
                MODE === "api" ? loadLeadsFromApi() : loadLeadsFromCsv();
        }
        return cachedLeadsPromise;
    },

    // useful for dev/debug
    clearCache(): void {
        cachedLeadsPromise = null;
    },
};
