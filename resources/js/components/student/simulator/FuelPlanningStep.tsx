import {
    ArrowDown,
    ArrowUp,
    Fuel,
    MapPin,
    Plus,
    Tag,
    Trash2,
} from 'lucide-react';
import L from 'leaflet';
import {
    MapContainer,
    Marker,
    Polyline,
    Popup,
    TileLayer,
} from 'react-leaflet';
import { FuelStationItem, LocationItem, RouteItem, routeName } from './types';
import { EmptyBlock } from './ui';

type Props = {
    stepNumber?: number;
    availableStations: FuelStationItem[];
    selectedStations: FuelStationItem[];
    routeSegments: RouteItem[];
    loading: boolean;
    onAddStation: (stationId: number) => void;
    onRemoveStation: (stationId: number) => void;
    onMoveStation: (stationId: number, direction: 'up' | 'down') => void;
};

function fuelTypeLabel(value?: string | null) {
    if (!value) return 'Nav norādīts';

    const normalized = value.toLowerCase();

    const map: Record<string, string> = {
        diesel: 'Dīzelis',
        petrol: 'Benzīns',
        gasoline: 'Benzīns',
        lng: 'LNG',
        cng: 'CNG',
        electric: 'Elektrība',
    };

    return map[normalized] ?? value.toUpperCase();
}

function priceLabel(value?: number | string | null) {
    if (value === null || value === undefined || value === '') {
        return 'Cena nav norādīta';
    }

    return `${value} €/L`;
}

const defaultCenter: [number, number] = [56.8796, 24.6032];
const routeMarkerIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl:
        'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});
const fuelMarkerIcon = L.divIcon({
    className: '',
    html: '<div style="width:22px;height:22px;border-radius:9999px;background:#f59e0b;border:3px solid white;box-shadow:0 8px 18px rgba(24,34,25,.28)"></div>',
    iconSize: [22, 22],
    iconAnchor: [11, 11],
});
const selectedFuelMarkerIcon = L.divIcon({
    className: '',
    html: '<div style="width:26px;height:26px;border-radius:9999px;background:#ea580c;border:4px solid white;box-shadow:0 10px 24px rgba(24,34,25,.35)"></div>',
    iconSize: [26, 26],
    iconAnchor: [13, 13],
});

function FuelRouteMap({
    routeSegments,
    availableStations,
    selectedStations,
}: {
    routeSegments: RouteItem[];
    availableStations: FuelStationItem[];
    selectedStations: FuelStationItem[];
}) {
    const routeLine = routeSegments
        .flatMap((segment, index) => {
            const from = routeLocation(segment, 'from');
            const to = routeLocation(segment, 'to');

            if (!from || !to) {
                return [];
            }

            return index === 0 ? [from, to] : [to];
        })
        .filter((position): position is [number, number] => Boolean(position));
    const center =
        routeLine[0] ?? stationLatLng(selectedStations[0]) ?? defaultCenter;
    const selectedIds = new Set(selectedStations.map((station) => station.id));

    return (
        <div className="mt-6 overflow-hidden rounded-2xl border border-[#d9ded9] bg-white">
            <div className="h-[360px]">
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
                    {routeLine.length > 1 ? (
                        <Polyline
                            positions={routeLine}
                            pathOptions={{ color: '#0f766e', weight: 5 }}
                        />
                    ) : null}
                    {routeSegments.map((segment, index) => {
                        const points = [
                            index === 0
                                ? {
                                      label: routeName(segment, 'from'),
                                      position: routeLocation(segment, 'from'),
                                  }
                                : null,
                            {
                                label: routeName(segment, 'to'),
                                position: routeLocation(segment, 'to'),
                            },
                        ].filter(
                            (
                                point,
                            ): point is {
                                label: string;
                                position: [number, number];
                            } => Boolean(point?.position),
                        );

                        return points.map((point) => (
                            <Marker
                                key={`${point.label}-${index}`}
                                position={point.position}
                                icon={routeMarkerIcon}
                            >
                                <Popup>{point.label}</Popup>
                            </Marker>
                        ));
                    })}
                    {availableStations.map((station) => {
                        const position = stationLatLng(station);

                        if (!position) {
                            return null;
                        }

                        return (
                            <Marker
                                key={station.id}
                                position={position}
                                icon={
                                    selectedIds.has(station.id)
                                        ? selectedFuelMarkerIcon
                                        : fuelMarkerIcon
                                }
                            >
                                <Popup>
                                    <strong>
                                        {station.name ||
                                            station.display_name ||
                                            'Degvielas stacija'}
                                    </strong>
                                    <div>
                                        {priceLabel(station.price_per_liter)}
                                    </div>
                                </Popup>
                            </Marker>
                        );
                    })}
                </MapContainer>
            </div>
            <div className="flex flex-wrap gap-3 border-t border-[#e4e9e4] px-4 py-3 text-[13px] text-[#506158]">
                <span className="inline-flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-[#0f766e]" />
                    Marsruts
                </span>
                <span className="inline-flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-[#f59e0b]" />
                    Pieejama uzpilde
                </span>
                <span className="inline-flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-[#ea580c]" />
                    Izveleta uzpilde
                </span>
            </div>
        </div>
    );
}

function FuelMetaCard({ station }: { station: FuelStationItem }) {
    return (
        <div className="mt-3 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-[#d7e5db] bg-[#f6faf7] px-2.5 py-1 text-[12px] font-medium text-[#166a4d]">
                <Tag className="h-3.5 w-3.5" />
                {fuelTypeLabel(station.fuel_type)}
            </span>

            <span className="inline-flex items-center gap-1 rounded-full border border-[#e4e9e4] bg-white px-2.5 py-1 text-[12px] font-medium text-[#425247]">
                <Fuel className="h-3.5 w-3.5" />
                {priceLabel(station.price_per_liter)}
            </span>
        </div>
    );
}

export default function FuelPlanningStep({
    stepNumber = 4,
    availableStations,
    selectedStations,
    routeSegments,
    loading,
    onAddStation,
    onRemoveStation,
    onMoveStation,
}: Props) {
    return (
        <section className="rounded-[28px] border border-[#d9ded9] bg-white p-6 shadow-sm">
            <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#d7e5db] bg-[#f6faf7] px-3 py-1 text-xs font-semibold tracking-[0.18em] text-[#166a4d] uppercase">
                    <Fuel className="h-3.5 w-3.5" />
                    {stepNumber}. solis
                </div>

                <h2 className="mt-3 text-[24px] font-semibold tracking-tight text-[#182219]">
                    Degvielas plānošana
                </h2>

                <p className="mt-2 text-[15px] leading-7 text-[#5b6b61]">
                    Izvēlies degvielas pieturas un sakārto tās secībā, kādā
                    plāno izmantot maršrutā.
                </p>
            </div>

            <FuelRouteMap
                routeSegments={routeSegments}
                availableStations={availableStations}
                selectedStations={selectedStations}
            />

            <div className="mt-6 grid gap-6 xl:grid-cols-2">
                <div>
                    <h3 className="text-[18px] font-semibold text-[#182219]">
                        Pieejamās degvielas stacijas
                    </h3>

                    <div className="mt-4 space-y-3">
                        {availableStations.length > 0 ? (
                            availableStations.map((station) => (
                                <div
                                    key={station.id}
                                    className="rounded-2xl border border-[#d9ded9] bg-[#f8faf8] p-4 transition hover:border-[#bfd2c5] hover:bg-white"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="min-w-0 flex-1">
                                            <div className="text-[16px] font-semibold text-[#182219]">
                                                {station.name ||
                                                    'Degvielas stacija'}
                                            </div>

                                            <div className="mt-2 inline-flex items-center gap-2 text-[14px] text-[#5b6b61]">
                                                <MapPin className="h-4 w-4 text-[#166a4d]" />
                                                {station.location_name ||
                                                    'Atrašanās vieta nav norādīta'}
                                            </div>

                                            <FuelMetaCard station={station} />
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                onAddStation(station.id)
                                            }
                                            disabled={loading}
                                            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#166a4d] px-3 py-2 text-[14px] font-medium text-white transition hover:bg-[#135740] disabled:opacity-60"
                                        >
                                            <Plus className="h-4 w-4" />
                                            Pievienot
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <EmptyBlock text="Nav pieejamu degvielas staciju." />
                        )}
                    </div>
                </div>

                <div>
                    <h3 className="text-[18px] font-semibold text-[#182219]">
                        Izvēlētās degvielas pieturas
                    </h3>

                    <div className="mt-4 space-y-3">
                        {selectedStations.length > 0 ? (
                            selectedStations.map((station, index) => (
                                <div
                                    key={`${station.id}-${index}`}
                                    className="rounded-2xl border border-[#d9ded9] bg-white p-4"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="min-w-0 flex-1">
                                            <div className="text-[12px] font-semibold tracking-[0.18em] text-[#7b887f] uppercase">
                                                Pietura {index + 1}
                                            </div>

                                            <div className="mt-2 text-[16px] font-semibold text-[#182219]">
                                                {station.name ||
                                                    'Degvielas stacija'}
                                            </div>

                                            <div className="mt-2 inline-flex items-center gap-2 text-[14px] text-[#5b6b61]">
                                                <MapPin className="h-4 w-4 text-[#166a4d]" />
                                                {station.location_name ||
                                                    'Atrašanās vieta nav norādīta'}
                                            </div>

                                            <FuelMetaCard station={station} />
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        onMoveStation(
                                                            station.id,
                                                            'up',
                                                        )
                                                    }
                                                    disabled={
                                                        loading || index === 0
                                                    }
                                                    className="inline-flex items-center gap-1 rounded-xl border border-[#d9ded9] bg-white px-3 py-2 text-[13px] font-medium text-[#182219] transition hover:bg-[#f7f9f7] disabled:opacity-50"
                                                >
                                                    <ArrowUp className="h-4 w-4" />
                                                    Augstāk
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        onMoveStation(
                                                            station.id,
                                                            'down',
                                                        )
                                                    }
                                                    disabled={
                                                        loading ||
                                                        index ===
                                                            selectedStations.length -
                                                                1
                                                    }
                                                    className="inline-flex items-center gap-1 rounded-xl border border-[#d9ded9] bg-white px-3 py-2 text-[13px] font-medium text-[#182219] transition hover:bg-[#f7f9f7] disabled:opacity-50"
                                                >
                                                    <ArrowDown className="h-4 w-4" />
                                                    Zemāk
                                                </button>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    onRemoveStation(station.id)
                                                }
                                                disabled={loading}
                                                className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-[#d9ded9] bg-white px-3 py-2 text-[14px] font-medium text-[#182219] transition hover:bg-[#f7f9f7] disabled:opacity-60"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                Dzēst
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <EmptyBlock text="Degvielas pieturas vēl nav izvēlētas." />
                        )}
                    </div>

                    <div className="mt-4 rounded-2xl border border-[#e4e9e4] bg-[#f8fbf9] p-4">
                        <div className="text-[12px] font-semibold tracking-[0.18em] text-[#7b887f] uppercase">
                            Kopsavilkums
                        </div>
                        <div className="mt-2 text-[15px] font-semibold text-[#182219]">
                            Izvēlētās pieturas: {selectedStations.length}
                        </div>
                        <div className="mt-2 text-[13px] leading-6 text-[#5b6b61]">
                            Pieturu secība ietekmē to, kā preview aprēķins
                            sadala maršrutu starp uzpildēm.
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function routeLocation(
    segment: RouteItem | undefined,
    side: 'from' | 'to',
): [number, number] | null {
    const location: LocationItem | null | undefined =
        side === 'from'
            ? (segment?.fromLocation ?? segment?.from_location)
            : (segment?.toLocation ?? segment?.to_location);

    return locationLatLng(location);
}

function stationLatLng(
    station?: FuelStationItem | null,
): [number, number] | null {
    return locationLatLng(station?.location ?? null);
}

function locationLatLng(
    location?: LocationItem | null,
): [number, number] | null {
    if (!location) {
        return null;
    }

    const latitude = Number(location.latitude);
    const longitude = Number(location.longitude);

    return Number.isFinite(latitude) && Number.isFinite(longitude)
        ? [latitude, longitude]
        : null;
}
