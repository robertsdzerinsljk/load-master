import L from 'leaflet';
import {
    ArrowDown,
    ArrowUp,
    CheckCircle2,
    Route,
    Save,
    Trash2,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
    MapContainer,
    Marker,
    Polyline,
    Popup,
    TileLayer,
    useMapEvents,
} from 'react-leaflet';
import { cn } from '@/lib/utils';

export type RouteBuilderPoint = {
    location_id?: number | null;
    source?: string | null;
    external_id?: string | null;
    name: string;
    display_name?: string | null;
    country?: string | null;
    city?: string | null;
    latitude: number | string | null;
    longitude: number | string | null;
    type?: string | null;
    is_saved?: boolean;
};

export type RouteBuilderPreview = {
    route_type: string;
    points: RouteBuilderPoint[];
    legs: Array<{
        sequence: number;
        type: 'land' | 'sea' | 'port_handling' | 'unknown';
        origin?: string | null;
        destination?: string | null;
        distance_km?: number | string | null;
        duration_hours?: number | string | null;
        provider?: string | null;
        geometry_geojson?: {
            type?: string;
            coordinates?: unknown;
        } | null;
        warnings?: string[];
        errors?: string[];
        land_route_id?: number | null;
    }>;
    land_route_ids?: number[];
    total_distance_km?: number | string | null;
    total_duration_hours?: number | string | null;
    warnings?: string[];
    errors?: string[];
    route_template?: {
        id: number;
        name: string;
        points?: RouteBuilderPoint[];
        legs?: RouteBuilderPreview['legs'];
    } | null;
};

type Props = {
    title?: string;
    initialPoints?: RouteBuilderPoint[];
    className?: string;
    isAttached?: boolean;
    attachedRouteName?: string;
    onUseRoute?: (preview: RouteBuilderPreview) => void | Promise<void>;
    onPreviewChange?: (preview: RouteBuilderPreview | null) => void;
};

const defaultCenter: [number, number] = [56.8796, 24.6032];
const pointTypes = [
    'city',
    'warehouse',
    'factory',
    'client',
    'fuel_station',
    'port_terminal',
    'custom',
];

const markerIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl:
        'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

export default function MapRouteBuilder({
    title = 'Maršruta veidotājs',
    initialPoints = [],
    className,
    isAttached = false,
    attachedRouteName,
    onUseRoute,
    onPreviewChange,
}: Props) {
    const searchRef = useRef<HTMLDivElement | null>(null);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<RouteBuilderPoint[]>([]);
    const [points, setPoints] = useState<RouteBuilderPoint[]>(initialPoints);
    const [preview, setPreview] = useState<RouteBuilderPreview | null>(null);
    const [loadingSearch, setLoadingSearch] = useState(false);
    const [loadingPreview, setLoadingPreview] = useState(false);
    const [savingTemplate, setSavingTemplate] = useState(false);
    const [usingRoute, setUsingRoute] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        setPoints(initialPoints);
    }, [initialPoints]);

    useEffect(() => {
        const handlePointerDown = (event: PointerEvent) => {
            if (
                searchRef.current &&
                !searchRef.current.contains(event.target as Node)
            ) {
                setResults([]);
            }
        };

        document.addEventListener('pointerdown', handlePointerDown);

        return () =>
            document.removeEventListener('pointerdown', handlePointerDown);
    }, []);

    useEffect(() => {
        if (query.trim().length < 2) {
            setResults([]);
            return;
        }

        const timeout = window.setTimeout(async () => {
            setLoadingSearch(true);
            try {
                const response = await fetch(
                    `/places/search?q=${encodeURIComponent(query.trim())}`,
                    {
                        headers: {
                            Accept: 'application/json',
                            'X-Requested-With': 'XMLHttpRequest',
                        },
                        credentials: 'same-origin',
                    },
                );
                const data = await response.json();
                setResults(data.results ?? []);
            } catch {
                setResults([]);
            } finally {
                setLoadingSearch(false);
            }
        }, 350);

        return () => window.clearTimeout(timeout);
    }, [query]);

    const mapCenter = useMemo(() => {
        const firstPoint = points.find(hasCoordinates);
        return firstPoint
            ? (toLatLng(firstPoint) ?? defaultCenter)
            : defaultCenter;
    }, [points]);

    const lines = useMemo(() => {
        if (preview?.legs?.length) {
            return preview.legs
                .map(legToLatLngs)
                .filter((line) => line.length > 1);
        }

        return points
            .map(toLatLng)
            .filter((position): position is [number, number] =>
                Boolean(position),
            ).length > 1
            ? [
                  points
                      .map(toLatLng)
                      .filter((position): position is [number, number] =>
                          Boolean(position),
                      ),
              ]
            : [];
    }, [points, preview]);

    const addPoint = (point: RouteBuilderPoint) => {
        setPoints((current) => [...current, point]);
        setResults([]);
        setPreview(null);
        onPreviewChange?.(null);
    };

    const updatePoint = (index: number, patch: Partial<RouteBuilderPoint>) => {
        setPoints((current) =>
            current.map((point, pointIndex) =>
                pointIndex === index ? { ...point, ...patch } : point,
            ),
        );
        setPreview(null);
        onPreviewChange?.(null);
    };

    const removePoint = (index: number) => {
        setPoints((current) =>
            current.filter((_, pointIndex) => pointIndex !== index),
        );
        setPreview(null);
        onPreviewChange?.(null);
    };

    const movePoint = (index: number, direction: -1 | 1) => {
        setPoints((current) => {
            const nextIndex = index + direction;
            if (nextIndex < 0 || nextIndex >= current.length) {
                return current;
            }

            const copy = [...current];
            [copy[index], copy[nextIndex]] = [copy[nextIndex], copy[index]];
            return copy;
        });
        setPreview(null);
        onPreviewChange?.(null);
    };

    const previewRoute = async (): Promise<RouteBuilderPreview | null> => {
        setLoadingPreview(true);
        setMessage(null);

        try {
            const response = await fetch('/route-builder/preview', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({ points }),
                credentials: 'same-origin',
            });
            const data = await response.json();

            if (!response.ok) {
                setMessage(
                    data.message ??
                        'Maršruta priekšskatījumu neizdevās izveidot.',
                );
                return null;
            }

            setPreview(data);
            onPreviewChange?.(data);
            return data;
        } catch {
            setMessage('Neizdevās sasniegt maršruta priekšskatījuma servisu.');
            return null;
        } finally {
            setLoadingPreview(false);
        }
    };

    const persistTemplate = async (name: string) => {
        setSavingTemplate(true);
        setMessage(null);

        try {
            const response = await fetch('/route-templates', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({ name, mode: 'auto', points }),
                credentials: 'same-origin',
            });
            const data = await response.json();

            if (!response.ok) {
                setMessage(data.message ?? 'Neizdevās saglabāt maršrutu.');
                return null;
            }

            setMessage('Maršruts saglabāts.');
            return data.route_template ?? null;
        } catch {
            setMessage('Neizdevās saglabāt maršrutu.');
            return null;
        } finally {
            setSavingTemplate(false);
        }
    };

    const saveTemplate = async () => {
        const name = window.prompt(
            'Maršruta sagataves nosaukums',
            routeName(points),
        );

        if (!name) {
            return;
        }

        await persistTemplate(name);
    };

    const useRouteInTask = async () => {
        if (!onUseRoute) {
            return;
        }

        setUsingRoute(true);

        try {
            const routePreview = preview ?? (await previewRoute());

            if (!routePreview) {
                return;
            }

            const routeTemplate = await persistTemplate(routeName(points));

            await onUseRoute({
                ...routePreview,
                route_template: routeTemplate,
            });

            if (routeTemplate) {
                setMessage('Maršruts pievienots uzdevumam.');
            }
        } finally {
            setUsingRoute(false);
        }
    };

    return (
        <div
            className={cn(
                'rounded-2xl border border-[#d9ded9] bg-white p-4',
                className,
            )}
        >
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-[#d7e5db] bg-[#f6faf7] px-3 py-1 text-xs font-semibold tracking-[0.18em] text-[#166a4d] uppercase">
                        <Route className="h-3.5 w-3.5" />
                        Uzdevuma maršruts
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-3">
                        <h3 className="text-[20px] font-semibold text-[#182219]">
                            {title}
                        </h3>
                        {isAttached ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#cfe3d8] bg-[#e9f5ef] px-3 py-1 text-[12px] font-semibold text-[#166a4d]">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Pievienots
                            </span>
                        ) : null}
                    </div>
                    <p className="mt-2 max-w-3xl text-[14px] leading-6 text-[#5b6b61]">
                        Pievieno piegādes punktus pareizā secībā. Šis maršruts
                        būs karte, ko studenti redzēs plānošanas laikā.
                    </p>
                    {isAttached && attachedRouteName ? (
                        <div className="mt-2 text-[13px] font-medium text-[#32523f]">
                            Pašreizējais maršruts: {attachedRouteName}
                        </div>
                    ) : null}
                </div>

                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={previewRoute}
                        disabled={loadingPreview || points.length < 2}
                        className="inline-flex items-center gap-2 rounded-xl border border-[#166a4d] bg-white px-4 py-2.5 text-[14px] font-medium text-[#166a4d] transition hover:bg-[#f3faf6] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <Route className="h-4 w-4" />
                        Ģenerēt līniju
                    </button>
                    {!onUseRoute ? (
                        <button
                            type="button"
                            onClick={saveTemplate}
                            disabled={savingTemplate || points.length < 2}
                            className="inline-flex items-center gap-2 rounded-xl border border-[#d9ded9] bg-white px-4 py-2.5 text-[14px] font-medium text-[#182219] transition hover:bg-[#f7f9f7] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <Save className="h-4 w-4" />
                            Saglabāt maršrutu
                        </button>
                    ) : null}
                    {onUseRoute ? (
                        <button
                            type="button"
                            onClick={useRouteInTask}
                            disabled={
                                points.length < 2 ||
                                usingRoute ||
                                loadingPreview ||
                                isAttached
                            }
                            className="inline-flex items-center gap-2 rounded-xl bg-[#166a4d] px-4 py-2.5 text-[14px] font-medium text-white transition hover:bg-[#135740] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isAttached
                                ? 'Pievienots uzdevumam'
                                : usingRoute
                                  ? preview
                                      ? 'Pievieno maršrutu...'
                                      : 'Ģenerē un pievieno...'
                                  : 'Pievienot uzdevumam'}
                        </button>
                    ) : null}
                </div>
            </div>

            <div className="mt-4 grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
                <div className="space-y-4">
                    <div ref={searchRef} className="space-y-2">
                        <label className="text-[12px] font-semibold tracking-[0.18em] text-[#7b887f] uppercase">
                            Meklēt pilsētu, vietu vai ostu
                        </label>
                        <input
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Rīga, Ventspils, noliktava..."
                            className="mt-2 w-full rounded-xl border border-[#d5dbd6] bg-white px-4 py-3 text-[14px] text-[#162118] transition outline-none placeholder:text-[#94a197] focus:border-[#166a4d]"
                        />

                        <div className="max-h-48 space-y-2 overflow-y-auto">
                            {loadingSearch ? (
                                <div className="rounded-xl border border-[#e4e9e4] bg-[#f8fbf9] px-3 py-2 text-sm text-[#5b6b61]">
                                    Meklē...
                                </div>
                            ) : null}
                            {results.map((result) => (
                                <button
                                    key={`${result.source}-${result.external_id ?? result.location_id ?? result.display_name}`}
                                    type="button"
                                    onPointerDown={(event) => {
                                        event.preventDefault();
                                        addPoint(result);
                                    }}
                                    className="w-full rounded-xl border border-[#d9ded9] bg-white px-3 py-2 text-left transition hover:bg-[#f8fbf9]"
                                >
                                    <div className="font-semibold text-[#182219]">
                                        {result.name}
                                    </div>
                                    <div className="text-[12px] text-[#6f7b74]">
                                        {result.display_name}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="text-[12px] font-semibold tracking-[0.18em] text-[#7b887f] uppercase">
                            Maršruta punkti
                        </div>
                        {points.length ? (
                            points.map((point, index) => (
                                <div
                                    key={`${point.name}-${index}`}
                                    className="rounded-xl border border-[#d9ded9] bg-[#f8fbf9] p-3"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <div className="text-[12px] font-semibold text-[#166a4d]">
                                                {String.fromCharCode(
                                                    65 + index,
                                                )}
                                            </div>
                                            <input
                                                value={point.name}
                                                onChange={(event) =>
                                                    updatePoint(index, {
                                                        name: event.target
                                                            .value,
                                                    })
                                                }
                                                className="mt-1 w-full rounded-lg border border-[#d5dbd6] bg-white px-3 py-2 text-[14px] font-semibold text-[#182219]"
                                            />
                                            <select
                                                value={point.type ?? 'custom'}
                                                onChange={(event) =>
                                                    updatePoint(index, {
                                                        type: event.target
                                                            .value,
                                                    })
                                                }
                                                className="mt-2 w-full rounded-lg border border-[#d5dbd6] bg-white px-3 py-2 text-[13px] text-[#506158]"
                                            >
                                                {pointTypes.map((type) => (
                                                    <option
                                                        key={type}
                                                        value={type}
                                                    >
                                                        {type.replace('_', ' ')}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <IconButton
                                                label="Pārvietot augstāk"
                                                onClick={() =>
                                                    movePoint(index, -1)
                                                }
                                                disabled={index === 0}
                                            >
                                                <ArrowUp className="h-4 w-4" />
                                            </IconButton>
                                            <IconButton
                                                label="Pārvietot zemāk"
                                                onClick={() =>
                                                    movePoint(index, 1)
                                                }
                                                disabled={
                                                    index === points.length - 1
                                                }
                                            >
                                                <ArrowDown className="h-4 w-4" />
                                            </IconButton>
                                            <IconButton
                                                label="Dzēst"
                                                onClick={() =>
                                                    removePoint(index)
                                                }
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </IconButton>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="rounded-xl border border-dashed border-[#d5dbd6] px-3 py-4 text-sm text-[#6f7b74]">
                                Meklē vai klikšķini kartē, lai pievienotu
                                maršruta punktus.
                            </div>
                        )}
                    </div>
                </div>

                <div>
                    <div className="h-[420px] overflow-hidden rounded-lg border border-[#d9ded9]">
                        <MapContainer
                            center={mapCenter}
                            zoom={7}
                            scrollWheelZoom={false}
                            className="h-full w-full"
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <MapClickHandler onPoint={addPoint} />

                            {points.map((point, index) => {
                                const position = toLatLng(point);
                                if (!position) return null;

                                return (
                                    <Marker
                                        key={`${point.name}-${index}`}
                                        position={position}
                                        icon={markerIcon}
                                    >
                                        <Popup>
                                            <strong>
                                                {String.fromCharCode(
                                                    65 + index,
                                                )}
                                                . {point.name}
                                            </strong>
                                            <div>{point.type ?? 'custom'}</div>
                                        </Popup>
                                    </Marker>
                                );
                            })}

                            {lines.map((line, index) => (
                                <Polyline
                                    key={index}
                                    positions={line}
                                    pathOptions={{
                                        color: '#0f766e',
                                        weight: 5,
                                    }}
                                />
                            ))}
                        </MapContainer>
                    </div>

                    <div className="mt-3 grid gap-3 md:grid-cols-3">
                        <Summary
                            label="Attālums"
                            value={
                                preview?.total_distance_km
                                    ? `${preview.total_distance_km} km`
                                    : '-'
                            }
                        />
                        <Summary
                            label="Laiks"
                            value={
                                preview?.total_duration_hours
                                    ? `${preview.total_duration_hours} h`
                                    : '-'
                            }
                        />
                        <Summary
                            label="Posmi"
                            value={preview?.legs?.length ?? 0}
                        />
                    </div>

                    {message ? (
                        <Notice tone="info" messages={[message]} />
                    ) : null}
                    {preview?.warnings?.length ? (
                        <Notice tone="warning" messages={preview.warnings} />
                    ) : null}
                    {preview?.errors?.length ? (
                        <Notice tone="error" messages={preview.errors} />
                    ) : null}
                </div>
            </div>
        </div>
    );
}

function MapClickHandler({
    onPoint,
}: {
    onPoint: (point: RouteBuilderPoint) => void;
}) {
    useMapEvents({
        click(event) {
            onPoint({
                source: 'custom',
                name: 'Pielāgots punkts',
                display_name: `${event.latlng.lat.toFixed(5)}, ${event.latlng.lng.toFixed(5)}`,
                latitude: event.latlng.lat,
                longitude: event.latlng.lng,
                type: 'custom',
                is_saved: false,
            });
        },
    });

    return null;
}

function IconButton({
    label,
    disabled,
    onClick,
    children,
}: {
    label: string;
    disabled?: boolean;
    onClick: () => void;
    children: ReactNode;
}) {
    return (
        <button
            type="button"
            aria-label={label}
            title={label}
            onClick={onClick}
            disabled={disabled}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#d9ded9] bg-white text-[#506158] transition hover:bg-[#f7f9f7] disabled:opacity-40"
        >
            {children}
        </button>
    );
}

function Summary({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="rounded-xl border border-[#d9ded9] bg-white p-3">
            <div className="text-[11px] font-semibold tracking-[0.18em] text-[#7b887f] uppercase">
                {label}
            </div>
            <div className="mt-1 text-[16px] font-semibold text-[#182219]">
                {value}
            </div>
        </div>
    );
}

function Notice({
    tone,
    messages,
}: {
    tone: 'info' | 'warning' | 'error';
    messages: string[];
}) {
    const toneClass =
        tone === 'error'
            ? 'border-red-200 bg-red-50 text-red-800'
            : tone === 'warning'
              ? 'border-amber-200 bg-amber-50 text-amber-800'
              : 'border-[#d7e5db] bg-[#f8fbf9] text-[#32523f]';

    return (
        <div
            className={cn(
                'mt-3 rounded-xl border px-3 py-2 text-sm',
                toneClass,
            )}
        >
            {messages.map((message) => (
                <div key={message}>{message}</div>
            ))}
        </div>
    );
}

function hasCoordinates(point: RouteBuilderPoint): boolean {
    return (
        Number.isFinite(Number(point.latitude)) &&
        Number.isFinite(Number(point.longitude))
    );
}

function toLatLng(
    point: RouteBuilderPoint | null | undefined,
): [number, number] | null {
    if (!point || !hasCoordinates(point)) {
        return null;
    }

    return [Number(point.latitude), Number(point.longitude)];
}

function legToLatLngs(
    leg: RouteBuilderPreview['legs'][number],
): [number, number][] {
    const coordinates = leg.geometry_geojson?.coordinates;

    if (!Array.isArray(coordinates)) {
        return [];
    }

    return coordinates
        .map((coordinate) => {
            if (!Array.isArray(coordinate) || coordinate.length < 2) {
                return null;
            }

            const lng = Number(coordinate[0]);
            const lat = Number(coordinate[1]);

            return Number.isFinite(lat) && Number.isFinite(lng)
                ? ([lat, lng] as [number, number])
                : null;
        })
        .filter((position): position is [number, number] => Boolean(position));
}

function routeName(points: RouteBuilderPoint[]): string {
    return (
        points.map((point) => point.name).join(' -> ') || 'Maršruta sagatave'
    );
}
