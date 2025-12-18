export type SortKey =
    | "generated_desc"
    | "generated_asc"
    | "name_asc"
    | "name_desc"
    | "type_asc"
    | "type_desc"
    | "status_asc"
    | "status_desc";

export function badgeClass(status: string) {
    switch (status) {
        case "Completed":
            return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
        case "In Progress":
            return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
        case "Failed":
            return "bg-rose-50 text-rose-700 ring-1 ring-rose-200";
        default:
            return "bg-gray-50 text-gray-700 ring-1 ring-gray-200";
    }
}

export function typePillClass() {
    return "inline-flex items-center rounded-full px-2 py-0.5 text-xs ring-1 bg-white text-[#193E6B] ring-[#193E6B]/20";
}

export function formatGeneratedOn(iso: string) {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export function safeLower(s: string | null | undefined) {
    return (s ?? "").toLowerCase();
}

export function getMonthKey(iso: string) {
    const d = new Date(iso);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`; // YYYY-MM
}

export function monthLabelFromKey(key: string) {
    // key: "YYYY-MM"
    const [y, m] = key.split("-").map((x) => Number(x));
    const d = new Date(y, (m ?? 1) - 1, 1);
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short" });
}

export function mostCommonType(types: string[]) {
    const counts = new Map<string, number>();
    for (const t of types) counts.set(t, (counts.get(t) ?? 0) + 1);
    let best: { t: string; n: number } | null = null;
    for (const [t, n] of counts.entries()) {
        if (!best || n > best.n) best = { t, n };
    }
    return best?.t ?? "—";
}

export function percent(part: number, total: number) {
    if (total <= 0) return 0;
    return (part / total) * 100;
}
