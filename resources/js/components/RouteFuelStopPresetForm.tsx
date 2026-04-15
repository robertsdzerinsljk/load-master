import { useState } from 'react';
import { router } from '@inertiajs/react';

type RouteOption = {
    id: number;
    fromLocation?: {
        name: string;
    } | null;
    toLocation?: {
        name: string;
    } | null;
};

type FuelStationOption = {
    id: number;
    location?: {
        name: string;
        city?: string | null;
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
    const [landRouteId, setLandRouteId] = useState(
        String(initialData.land_route_id ?? '')
    );
    const [fuelStationId, setFuelStationId] = useState(
        String(initialData.fuel_station_id ?? '')
    );
    const [distanceFromStartKm, setDistanceFromStartKm] = useState(
        String(initialData.distance_from_start_km ?? '')
    );
    const [notes, setNotes] = useState(initialData.notes ?? '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            land_route_id: Number(landRouteId),
            fuel_station_id: Number(fuelStationId),
            distance_from_start_km: Number(distanceFromStartKm),
            notes: notes || null,
        };

        if (isEdit && id) {
            router.put(`/teacher/templates/route-fuel-stops/${id}`, payload);
        } else {
            router.post('/teacher/templates/route-fuel-stops', payload);
        }
    };

    const inputClass =
        'mt-2 w-full rounded-xl border border-[#d5dbd6] bg-white px-4 py-3 text-[14px] text-[#162118] outline-none transition placeholder:text-[#94a197] focus:border-[#166a4d]';

    const labelClass = 'text-[14px] font-medium text-[#182219]';

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
                        onChange={(e) => setLandRouteId(e.target.value)}
                        required
                        className={inputClass}
                    >
                        <option value="">Izvēlieties maršrutu</option>
                        {routes.map((route) => (
                            <option key={route.id} value={route.id}>
                                {(route.fromLocation?.name ?? '—')} → {(route.toLocation?.name ?? '—')}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className={labelClass}>Uzpildes vieta *</label>
                    <select
                        value={fuelStationId}
                        onChange={(e) => setFuelStationId(e.target.value)}
                        required
                        className={inputClass}
                    >
                        <option value="">Izvēlieties uzpildes vietu</option>
                        {fuelStations.map((station) => (
                            <option key={station.id} value={station.id}>
                                {station.location?.name ?? '—'}
                                {station.location?.city ? ` (${station.location.city})` : ''}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className={labelClass}>Attālums no starta (km) *</label>
                    <input
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        value={distanceFromStartKm}
                        onChange={(e) => setDistanceFromStartKm(e.target.value)}
                        className={inputClass}
                        placeholder="Piemēram, 110"
                    />
                </div>

                <div>
                    <label className={labelClass}>Piezīmes</label>
                    <textarea
                        rows={5}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className={inputClass}
                        placeholder="Papildu informācija par šo pieturu."
                    />
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