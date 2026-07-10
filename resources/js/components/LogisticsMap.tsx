import L from 'leaflet';
import { useMemo } from 'react';
import {
    MapContainer,
    Marker,
    Polyline,
    Popup,
    TileLayer,
} from 'react-leaflet';

type Coordinate = {
    latitude: number | string | null;
    longitude: number | string | null;
};

export type LogisticsMapLocation = Coordinate & {
    id?: number | string;
    name: string;
    type?: string | null;
};

export type LogisticsMapFuelStop = Coordinate & {
    id?: number | string;
    name: string;
    location_name?: string | null;
    fuel_type?: string | null;
    price_per_liter?: number | string | null;
    position?: number | null;
};

export type LogisticsRouteLeg = {
    id?: number | string;
    type: 'land' | 'sea' | 'port_handling';
    origin?: string | null;
    destination?: string | null;
    port?: string | null;
    distance_km?: number | string | null;
    duration_hours?: number | string | null;
    cost?: number | string | null;
    geometry_geojson?: {
        type?: string;
        coordinates?: unknown;
    } | null;
};

export type LogisticsRouteSummary = {
    route_type?: string;
    distance_km?: number | string | null;
    duration_hours?: number | string | null;
    total_distance_km?: number | string | null;
    total_duration_hours?: number | string | null;
    total_cost?: number | string | null;
    provider?: string | null;
};

type LogisticsMapProps = {
    origin?: LogisticsMapLocation | null;
    destination?: LogisticsMapLocation | null;
    ports?: LogisticsMapLocation[];
    fuelStops?: LogisticsMapFuelStop[];
    landLegs?: LogisticsRouteLeg[];
    seaLegs?: LogisticsRouteLeg[];
    summary?: LogisticsRouteSummary | null;
    warnings?: string[];
    errors?: string[];
    className?: string;
};

type RenderLocation = LogisticsMapLocation & {
    type: string;
};

const defaultCenter: [number, number] = [56.8796, 24.6032];

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

const fuelStopIcon = L.divIcon({
    className: '',
    html: '<div style="width:24px;height:24px;border-radius:9999px;background:#ea580c;border:4px solid white;box-shadow:0 10px 24px rgba(24,34,25,.35)"></div>',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
});

export default function LogisticsMap({
    origin,
    destination,
    ports = [],
    fuelStops = [],
    landLegs = [],
    seaLegs = [],
    summary,
    warnings = [],
    errors = [],
    className = '',
}: LogisticsMapProps) {
    const markers = useMemo(() => {
        const values: RenderLocation[] = [];

        if (origin && toLatLng(origin)) {
            values.push({ ...origin, type: origin.type ?? 'origin' });
        }

        if (destination && toLatLng(destination)) {
            values.push({
                ...destination,
                type: destination.type ?? 'destination',
            });
        }

        ports.forEach((port) => {
            if (toLatLng(port)) {
                values.push({ ...port, type: port.type ?? 'port' });
            }
        });

        return values;
    }, [destination, origin, ports]);

    const center = toLatLng(origin) ?? toLatLng(destination) ?? defaultCenter;
    const landLines = landLegs.map(legToLatLngs).filter(hasLine);
    const seaLines = seaLegs.map(legToLatLngs).filter(hasLine);
    const visibleFuelStops = fuelStops.filter((stop) => toLatLng(stop));

    return (
        <div
            className={`overflow-hidden rounded-lg border border-slate-200 bg-white ${className}`}
        >
            <div className="h-[360px] min-h-[280px] w-full">
                <MapContainer
                    center={center}
                    zoom={7}
                    scrollWheelZoom={false}
                    className="h-full w-full"
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {markers.map((location) => {
                        const position = toLatLng(location);

                        if (!position) {
                            return null;
                        }

                        return (
                            <Marker
                                key={`${location.type}-${location.id ?? location.name}`}
                                position={position}
                                icon={markerIcon}
                            >
                                <Popup>
                                    <strong>{location.name}</strong>
                                    {location.type && (
                                        <div className="text-xs tracking-wide text-slate-500 uppercase">
                                            {location.type}
                                        </div>
                                    )}
                                </Popup>
                            </Marker>
                        );
                    })}

                    {landLines.map((positions, index) => (
                        <Polyline
                            key={`land-${index}`}
                            positions={positions}
                            pathOptions={{ color: '#0f766e', weight: 5 }}
                        />
                    ))}

                    {seaLines.map((positions, index) => (
                        <Polyline
                            key={`sea-${index}`}
                            positions={positions}
                            pathOptions={{
                                color: '#2563eb',
                                weight: 4,
                                dashArray: '8 8',
                            }}
                        />
                    ))}

                    {visibleFuelStops.map((stop) => {
                        const position = toLatLng(stop);

                        if (!position) {
                            return null;
                        }

                        return (
                            <Marker
                                key={`fuel-${stop.id ?? stop.name}`}
                                position={position}
                                icon={fuelStopIcon}
                            >
                                <Popup>
                                    <strong>{stop.name}</strong>
                                    {stop.location_name ? (
                                        <div>{stop.location_name}</div>
                                    ) : null}
                                    <div className="text-xs tracking-wide text-slate-500 uppercase">
                                        Degvielas pietura
                                    </div>
                                    {stop.price_per_liter ? (
                                        <div className="text-xs text-slate-600">
                                            {stop.price_per_liter} EUR/L
                                        </div>
                                    ) : null}
                                </Popup>
                            </Marker>
                        );
                    })}
                </MapContainer>
            </div>

            {(summary || warnings.length > 0 || errors.length > 0) && (
                <div className="space-y-3 border-t border-slate-200 p-4">
                    {summary && (
                        <div className="grid gap-3 text-sm sm:grid-cols-4">
                            <SummaryItem
                                label="Attālums"
                                value={formatNumber(
                                    summary.total_distance_km ??
                                        summary.distance_km,
                                    ' km',
                                )}
                            />
                            <SummaryItem
                                label="Laiks"
                                value={formatNumber(
                                    summary.total_duration_hours ??
                                        summary.duration_hours,
                                    ' h',
                                )}
                            />
                            <SummaryItem
                                label="Izmaksas"
                                value={formatNumber(summary.total_cost, ' EUR')}
                            />
                            <SummaryItem
                                label="Avots"
                                value={
                                    summary.provider ??
                                    summary.route_type ??
                                    '-'
                                }
                            />
                        </div>
                    )}

                    {visibleFuelStops.length > 0 ? (
                        <div className="flex flex-wrap gap-3 text-[13px] text-slate-600">
                            <span className="inline-flex items-center gap-2">
                                <span className="h-3 w-3 rounded-full bg-[#0f766e]" />
                                Sauszemes posms
                            </span>
                            {seaLines.length > 0 ? (
                                <span className="inline-flex items-center gap-2">
                                    <span className="h-3 w-3 rounded-full bg-[#2563eb]" />
                                    Jūras posms
                                </span>
                            ) : null}
                            <span className="inline-flex items-center gap-2">
                                <span className="h-3 w-3 rounded-full bg-[#ea580c]" />
                                Izveleta uzpilde
                            </span>
                        </div>
                    ) : null}

                    {warnings.length > 0 && (
                        <MessageList
                            title="Brīdinājumi"
                            messages={warnings}
                            tone="warning"
                        />
                    )}

                    {errors.length > 0 && (
                        <MessageList
                            title="Kļūdas"
                            messages={errors}
                            tone="error"
                        />
                    )}
                </div>
            )}
        </div>
    );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <div className="text-[11px] font-semibold tracking-widest text-slate-500 uppercase">
                {label}
            </div>
            <div className="font-semibold text-slate-900">{value}</div>
        </div>
    );
}

function MessageList({
    title,
    messages,
    tone,
}: {
    title: string;
    messages: string[];
    tone: 'warning' | 'error';
}) {
    const toneClass =
        tone === 'error'
            ? 'border-red-200 bg-red-50 text-red-700'
            : 'border-amber-200 bg-amber-50 text-amber-800';

    return (
        <div className={`rounded-md border p-3 text-sm ${toneClass}`}>
            <div className="mb-1 font-semibold">{title}</div>
            <ul className="space-y-1">
                {messages.map((message) => (
                    <li key={message}>{message}</li>
                ))}
            </ul>
        </div>
    );
}

function toLatLng(location?: Coordinate | null): [number, number] | null {
    if (!location) {
        return null;
    }

    const lat = Number(location.latitude);
    const lng = Number(location.longitude);

    return Number.isFinite(lat) && Number.isFinite(lng) ? [lat, lng] : null;
}

function legToLatLngs(leg: LogisticsRouteLeg): [number, number][] {
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

function hasLine(
    positions: [number, number][],
): positions is [number, number][] {
    return positions.length > 1;
}

function formatNumber(value: unknown, suffix = ''): string {
    const numeric = Number(value);

    if (!Number.isFinite(numeric)) {
        return '-';
    }

    return `${numeric.toFixed(2)}${suffix}`;
}
