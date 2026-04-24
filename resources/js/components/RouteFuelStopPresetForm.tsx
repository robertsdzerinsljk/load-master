import { router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import {
    formatLocationOptionLabel,
    formatRouteOptionDescription,
    formatRouteOptionLabel,
} from '@/utils/templateOptionLabels';

type RouteLocationOption = {
    name?: string | null;
    city?: string | null;
    country?: string | null;
    type?: string | null;
};

type RouteOption = {
    id: number;
    distance_km?: number | string | null;
    fromLocation?: RouteLocationOption | null;
    toLocation?: RouteLocationOption | null;
};

type FuelStationOption = {
    id: number;
    location?: {
        name?: string | null;
        city?: string | null;
        country?: string | null;
        type?: string | null;
    } | null;
};

type Props = {
    routes: RouteOption[];
    fuelStations: FuelStationOption[];
    submitLabel?: string;
    initialData?: {
        land_route_id?: number | string;
        fuel_station_id?: number | string;
        distance_from_start_km?: number | string;
        notes?: string;
    };
    isEdit?: boolean;
    id?: number;
};

export default function RouteFuelStopPresetForm({
    routes,
    fuelStations,
    submitLabel = 'Saglabāt',
    initialData = {},
    isEdit = false,
    id,
}: Props) {
    const page = usePage<{ props: { errors?: Record<string, string> } }>();
    const errors = page.props.errors ?? {};

    const [landRouteId, setLandRouteId] = useState(
        String(initialData.land_route_id ?? ''),
    );
    const [fuelStationId, setFuelStationId] = useState(
        String(initialData.fuel_station_id ?? ''),
    );
    const [distanceFromStartKm, setDistanceFromStartKm] = useState(
        String(initialData.distance_from_start_km ?? ''),
    );
    const [notes, setNotes] = useState(initialData.notes ?? '');

    const sortedRoutes = useMemo(
        () =>
            [...routes].sort((left, right) =>
                formatRouteOptionLabel(left).localeCompare(
                    formatRouteOptionLabel(right),
                ),
            ),
        [routes],
    );

    const sortedFuelStations = useMemo(
        () =>
            [...fuelStations].sort((left, right) =>
                formatLocationOptionLabel(left.location).localeCompare(
                    formatLocationOptionLabel(right.location),
                ),
            ),
        [fuelStations],
    );

    const selectedRoute =
        routes.find((route) => String(route.id) === landRouteId) ?? null;
    const selectedRouteDistance =
        selectedRoute?.distance_km !== null &&
        selectedRoute?.distance_km !== undefined &&
        selectedRoute?.distance_km !== ''
            ? Number(selectedRoute.distance_km)
            : null;

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        const payload = {
            land_route_id: Number(landRouteId),
            fuel_station_id: Number(fuelStationId),
            distance_from_start_km: Number(distanceFromStartKm),
            notes: notes || null,
        };

        if (isEdit && id) {
            router.put(`/teacher/templates/route-fuel-stops/${id}`, payload);
            return;
        }

        router.post('/teacher/templates/route-fuel-stops', payload);
    };

    const inputClass =
        'mt-2 w-full rounded-xl border border-[#d5dbd6] bg-white px-4 py-3 text-[14px] text-[#162118] outline-none transition placeholder:text-[#94a197] focus:border-[#166a4d]';
    const labelClass = 'text-[14px] font-medium text-[#182219]';
    const helperClass = 'mt-2 text-[13px] leading-6 text-[#5b6b61]';

    return (
        <form
            onSubmit={handleSubmit}
            className="mt-6 max-w-5xl rounded-2xl border border-[#d9ded9] bg-white p-6 shadow-sm"
        >
            <div className="grid gap-5">
                <div>
                    <label className={labelClass}>Maršruts *</label>
                    <select
                        value={landRouteId}
                        onChange={(event) => setLandRouteId(event.target.value)}
                        required
                        className={inputClass}
                    >
                        <option value="">Izvēlieties maršrutu</option>
                        {sortedRoutes.map((route) => (
                            <option key={route.id} value={route.id}>
                                {`${formatRouteOptionLabel(route)} - ${formatRouteOptionDescription(route)}`}
                            </option>
                        ))}
                    </select>
                    {selectedRoute ? (
                        <p className={helperClass}>
                            Atlasītā maršruta garums: {formatRouteOptionDescription(selectedRoute)}.
                        </p>
                    ) : null}
                    {errors.land_route_id ? (
                        <FieldError error={errors.land_route_id} />
                    ) : null}
                </div>

                <div>
                    <label className={labelClass}>Uzpildes vieta *</label>
                    <select
                        value={fuelStationId}
                        onChange={(event) => setFuelStationId(event.target.value)}
                        required
                        className={inputClass}
                    >
                        <option value="">Izvēlieties uzpildes vietu</option>
                        {sortedFuelStations.map((station) => (
                            <option key={station.id} value={station.id}>
                                {formatLocationOptionLabel(station.location)}
                            </option>
                        ))}
                    </select>
                    {errors.fuel_station_id ? (
                        <FieldError error={errors.fuel_station_id} />
                    ) : null}
                </div>

                <div>
                    <label className={labelClass}>Attālums no starta (km) *</label>
                    <input
                        type="number"
                        step="0.01"
                        min="0"
                        max={selectedRouteDistance ?? undefined}
                        required
                        value={distanceFromStartKm}
                        onChange={(event) => setDistanceFromStartKm(event.target.value)}
                        className={inputClass}
                        placeholder="Piemēram, 110"
                    />
                    <p className={helperClass}>
                        Pieturai jāatrodas maršruta robežās, nevis tālāk par pašu maršrutu.
                    </p>
                    {errors.distance_from_start_km ? (
                        <FieldError error={errors.distance_from_start_km} />
                    ) : null}
                </div>

                <div>
                    <label className={labelClass}>Piezīmes</label>
                    <textarea
                        rows={5}
                        value={notes}
                        onChange={(event) => setNotes(event.target.value)}
                        className={inputClass}
                        placeholder="Papildu informācija par šo pieturu."
                    />
                    {errors.notes ? <FieldError error={errors.notes} /> : null}
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        className="inline-flex items-center rounded-xl bg-[#166a4d] px-5 py-3 text-[15px] font-semibold text-white transition hover:bg-[#135740]"
                    >
                        {submitLabel}
                    </button>
                </div>
            </div>
        </form>
    );
}

function FieldError({ error }: { error: string }) {
    return <div className="mt-2 text-[12px] text-red-700">{error}</div>;
}
