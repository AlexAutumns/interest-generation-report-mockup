export function formatDateRange(startIso: string, endIso: string) {
    const start = new Date(startIso);
    const end = new Date(endIso);
    const fmt: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "short",
        day: "2-digit",
    };
    return `${start.toLocaleDateString(undefined, fmt)} – ${end.toLocaleDateString(
        undefined,
        fmt
    )}`;
}

export function formatDateTime(iso: string) {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export function shortChannelLabel(label: string) {
    return label.length > 12 ? `${label.slice(0, 12)}…` : label;
}

export function statusBadge(status: string) {
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
