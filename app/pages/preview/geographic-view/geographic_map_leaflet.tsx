import { useEffect, useMemo, useRef, useState } from "react";
import type * as LeafletNS from "leaflet";
import type { GeoMetricKey, RegionRow } from "./geographic_helpers";
import {
    formatMetricValue,
    getMetricValue,
    metricLabel,
} from "./geographic_helpers";

type Props = {
    rows: RegionRow[];
    metricKey: GeoMetricKey;
};

const WORLD_GEOJSON_URL =
    "https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json";

function clamp(n: number, min: number, max: number) {
    return Math.max(min, Math.min(max, n));
}

function fillFor(value: number, max: number, selected: boolean) {
    if (selected) return "#B3A125";
    if (max <= 0) return "rgba(25, 62, 107, 0.12)";
    const t = clamp(value / max, 0, 1);
    const alpha = 0.12 + t * 0.72;
    return `rgba(25, 62, 107, ${alpha.toFixed(3)})`;
}

export default function GeographicMapLeaflet({ rows, metricKey }: Props) {
    const mapDivRef = useRef<HTMLDivElement | null>(null);

    const leafletRef = useRef<typeof LeafletNS | null>(null);
    const mapRef = useRef<LeafletNS.Map | null>(null);
    const geoLayerRef = useRef<LeafletNS.GeoJSON | null>(null);

    const [hovered, setHovered] = useState<{
        name: string;
        value: number;
    } | null>(null);
    const [pinned, setPinned] = useState<string | null>(null);
    const [ready, setReady] = useState(false);

    const dataMap = useMemo(() => {
        const m = new Map<string, RegionRow>();
        rows.forEach((r) => m.set(r.region.toLowerCase(), r));
        return m;
    }, [rows]);

    const maxValue = useMemo(() => {
        return rows.reduce(
            (m, r) => Math.max(m, getMetricValue(r, metricKey)),
            0
        );
    }, [rows, metricKey]);

    // Create map once (client-only)
    useEffect(() => {
        if (typeof window === "undefined") return;
        if (!mapDivRef.current) return;
        if (mapRef.current) return;

        let cancelled = false;

        (async () => {
            const L = await import("leaflet");
            if (cancelled) return;

            leafletRef.current = L;

            const map = L.map(mapDivRef.current!, {
                zoomControl: true,
                attributionControl: true,
                scrollWheelZoom: false,
            }).setView([15, 10], 2);

            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: "&copy; OpenStreetMap contributors",
            }).addTo(map);

            mapRef.current = map;

            // Fix sizing inside flex/grid layouts
            requestAnimationFrame(() => map.invalidateSize());

            setReady(true);
        })();

        return () => {
            cancelled = true;
        };
    }, []);

    // Load / refresh GeoJSON when metric/data changes
    useEffect(() => {
        if (!ready) return;
        const L = leafletRef.current;
        const map = mapRef.current;
        if (!L || !map) return;

        if (geoLayerRef.current) {
            geoLayerRef.current.remove();
            geoLayerRef.current = null;
        }

        let cancelled = false;

        function getCountryName(feature: any) {
            return (
                feature?.properties?.name ??
                feature?.properties?.NAME ??
                feature?.properties?.admin ??
                feature?.properties?.COUNTRY ??
                "Unknown"
            );
        }

        fetch(WORLD_GEOJSON_URL)
            .then((r) => r.json())
            .then((geojson) => {
                if (cancelled) return;

                const layer = L.geoJSON(geojson, {
                    style: (feature: any) => {
                        const name = String(getCountryName(feature));
                        const row = dataMap.get(name.toLowerCase());
                        const value = row ? getMetricValue(row, metricKey) : 0;

                        const selected =
                            pinned && pinned === name.toLowerCase();

                        return {
                            color: "rgba(0,0,0,0.18)",
                            weight: 1,
                            fillColor: fillFor(
                                value,
                                maxValue,
                                Boolean(selected)
                            ),
                            fillOpacity: 1,
                        };
                    },
                    onEachFeature: (
                        feature: any,
                        leafletLayer: LeafletNS.Layer
                    ) => {
                        const name = String(getCountryName(feature));
                        const row = dataMap.get(name.toLowerCase());
                        const value = row ? getMetricValue(row, metricKey) : 0;

                        leafletLayer.on("mouseover", () => {
                            setHovered({ name, value });

                            if ((leafletLayer as any).setStyle) {
                                (leafletLayer as any).setStyle({
                                    fillColor: "#B3A125",
                                });
                            }
                        });

                        leafletLayer.on("mouseout", () => {
                            setHovered(null);

                            if ((leafletLayer as any).setStyle) {
                                const selected =
                                    pinned && pinned === name.toLowerCase();
                                (leafletLayer as any).setStyle({
                                    fillColor: fillFor(
                                        value,
                                        maxValue,
                                        Boolean(selected)
                                    ),
                                });
                            }
                        });

                        leafletLayer.on("click", () => {
                            setPinned((prev) => {
                                const key = name.toLowerCase();
                                return prev === key ? null : key;
                            });
                        });
                    },
                });

                layer.addTo(map);
                geoLayerRef.current = layer;
            })
            .catch(() => {
                // If GeoJSON fails, map tiles still show.
            });

        return () => {
            cancelled = true;
        };
    }, [ready, dataMap, metricKey, maxValue, pinned]);

    return (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            <div className="lg:col-span-8 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <div className="text-sm font-semibold text-[#193E6B]">
                            Geographic heatmap (Leaflet)
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                            Hover for details • Click to pin • Scroll zoom
                            disabled
                        </div>
                    </div>

                    <div className="rounded-md border border-[#B3A125]/35 bg-[#B3A125]/10 px-3 py-1 text-xs font-semibold text-[#193E6B]">
                        {metricLabel(metricKey)}
                    </div>
                </div>

                <div
                    ref={mapDivRef}
                    className="mt-3 h-[420px] w-full min-w-0 overflow-hidden rounded-lg ring-1 ring-gray-200"
                />
            </div>

            <div className="lg:col-span-4 flex flex-col gap-4">
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="text-sm font-semibold text-[#193E6B]">
                        Hovered
                    </div>
                    <div className="mt-2 rounded-lg bg-[#F5F5F5] p-3 ring-1 ring-gray-200">
                        {hovered ? (
                            <>
                                <div className="text-xs text-gray-500">
                                    Country
                                </div>
                                <div className="text-sm font-semibold text-[#193E6B]">
                                    {hovered.name}
                                </div>
                                <div className="mt-2 text-xs text-gray-500">
                                    {metricLabel(metricKey)}
                                </div>
                                <div className="text-lg font-semibold text-[#193E6B]">
                                    {formatMetricValue(
                                        metricKey,
                                        hovered.value
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="text-sm text-gray-600">
                                Hover a country on the map.
                            </div>
                        )}
                    </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="text-sm font-semibold text-[#193E6B]">
                        Pinned
                    </div>
                    <div className="mt-2 rounded-lg bg-[#F5F5F5] p-3 ring-1 ring-gray-200">
                        {pinned ? (
                            <div className="text-sm font-semibold text-[#193E6B]">
                                {pinned.toUpperCase()}
                            </div>
                        ) : (
                            <div className="text-sm text-gray-600">
                                Click a country to pin it.
                            </div>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={() => setPinned(null)}
                        className="mt-3 inline-flex w-full items-center justify-center rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-[#193E6B] hover:bg-gray-50"
                    >
                        Clear pin
                    </button>
                </div>
            </div>
        </div>
    );
}
