// app/pages/preview/report-validation/validation_utils.ts
//
// Small shared utilities used by the report-validation module.
// Keeping these in one place reduces noise in the main helpers/model builder.

export function safeNumber(n: unknown, fallback = 0): number {
    const v = Number(n);
    return Number.isFinite(v) ? v : fallback;
}

export function clamp(n: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, n));
}

export function severityRank(s: "Critical" | "Warning" | "Info"): number {
    switch (s) {
        case "Critical":
            return 3;
        case "Warning":
            return 2;
        case "Info":
            return 1;
    }
}

export function normalizeKey(raw: string): string {
    // Normalization intended for "are these likely the same label?"
    // - trim + lowercase
    // - collapse whitespace
    // - unify common separators/punctuation that cause splits
    return raw
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ")
        .replace(/[_\-\/\\]+/g, " ")
        .replace(/[.,:;()]/g, "")
        .trim();
}

export function cleanList(arr: unknown): string[] {
    // Used for displaying filter snapshots and other list-like fields safely.
    if (!Array.isArray(arr)) return [];
    return arr.map((x) => String(x ?? "").trim()).filter(Boolean);
}
