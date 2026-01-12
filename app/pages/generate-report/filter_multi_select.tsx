// app/pages/generate-report/filter_multi_select.tsx
import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";

type Props = {
    title: string;
    options: string[];
    value?: string[];
    onChange: (next: string[]) => void;
    placeholder?: string;
};

function rowClass(active: boolean) {
    return active
        ? "border-[#B3A125]/45 bg-[#B3A125]/10"
        : "border-gray-200 bg-white hover:bg-gray-50";
}

export default function FilterMultiSelect({
    title,
    options,
    value = [],
    onChange,
    placeholder = "Search…",
}: Props) {
    const [q, setQ] = useState("");

    const filtered = useMemo(() => {
        const query = q.trim().toLowerCase();
        if (!query) return options;
        return options.filter((o) => o.toLowerCase().includes(query));
    }, [options, q]);

    function toggle(opt: string) {
        const exists = value.includes(opt);
        onChange(exists ? value.filter((v) => v !== opt) : [...value, opt]);
    }

    return (
        <div className="min-w-0">
            <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-[#193E6B]">
                    {title}
                </div>
                <div className="text-xs text-gray-500">
                    {value.length} selected
                </div>
            </div>

            <div className="mt-2 flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2">
                <Search className="h-4 w-4 text-[#193E6B]/60" />
                <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
                    placeholder={placeholder}
                />
                {q && (
                    <button
                        type="button"
                        onClick={() => setQ("")}
                        className="rounded p-1 hover:bg-gray-100"
                        aria-label="Clear search"
                    >
                        <X className="h-4 w-4 text-gray-500" />
                    </button>
                )}
            </div>

            <div className="mt-2 max-h-[240px] overflow-auto rounded-md border border-gray-200 bg-white">
                {filtered.map((opt) => {
                    const checked = value.includes(opt);
                    return (
                        <button
                            key={opt}
                            type="button"
                            onClick={() => toggle(opt)}
                            className={`flex w-full items-center justify-between border-b px-3 py-2 text-left text-sm last:border-b-0 ${rowClass(
                                checked
                            )}`}
                        >
                            <span className="truncate text-[#193E6B]">
                                {opt}
                            </span>
                            <span
                                className={`text-xs font-semibold ${checked ? "text-[#193E6B]" : "text-gray-500"}`}
                            >
                                {checked ? "Selected" : "—"}
                            </span>
                        </button>
                    );
                })}

                {filtered.length === 0 && (
                    <div className="px-3 py-3 text-sm text-gray-600">
                        No matches.
                    </div>
                )}
            </div>

            <div className="mt-2 flex gap-2">
                <button
                    type="button"
                    onClick={() => onChange(options)}
                    className="flex-1 rounded-md border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-[#193E6B] hover:bg-gray-50"
                >
                    Select all
                </button>
                <button
                    type="button"
                    onClick={() => onChange([])}
                    className="flex-1 rounded-md border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-[#193E6B] hover:bg-gray-50"
                >
                    Clear
                </button>
            </div>
        </div>
    );
}
