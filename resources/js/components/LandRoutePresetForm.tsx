import { router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { formatLocationOptionLabel } from '@/utils/templateOptionLabels';

type LocationOption = {
    id: number;
    name: string;
    type?: string | null;
    city?: string | null;
    country?: string | null;
};

type Props = {
    locations: LocationOption[];
    submitLabel?: string;
    initialData?: {
        from_location_id?: number | string;
        to_location_id?: number | string;
        distance_km?: number | string;
        estimated_time_hours?: number | string;
        toll_cost?: number | string;
        notes?: string;
    };
    isEdit?: boolean;
    id?: number;
};

export default function LandRoutePresetForm({
    locations,
    submitLabel = 'Saglabāt',
    initialData = {},
    isEdit = false,
    id,
}: Props) {
    const page = usePage<{ props: { errors?: Record<string, string> } }>();
    const errors = page.props.errors ?? {};

    const [fromLocationId, setFromLocationId] = useState(
        String(initialData.from_location_id ?? ''),
    );
    const [toLocationId, setToLocationId] = useState(
        String(initialData.to_location_id ?? ''),
    );
    const [distanceKm, setDistanceKm] = useState(
        String(initialData.distance_km ?? ''),
    );
    const [estimatedTimeHours, setEstimatedTimeHours] = useState(
        String(initialData.estimated_time_hours ?? ''),
    );
    const [tollCost, setTollCost] = useState(String(initialData.toll_cost ?? ''));
    const [notes, setNotes] = useState(initialData.notes ?? '');

    const sortedLocations = useMemo(
        () =>
            [...locations].sort((left, right) =>
                formatLocationOptionLabel(left).localeCompare(
                    formatLocationOptionLabel(right),
                ),
            ),
        [locations],
    );

    const fromLocationOptions = useMemo(
        () =>
            sortedLocations.filter(
                (location) =>
                    String(location.id) !== toLocationId ||
                    String(location.id) === fromLocationId,
            ),
        [fromLocationId, sortedLocations, toLocationId],
    );

    const toLocationOptions = useMemo(
        () =>
            sortedLocations.filter(
                (location) =>
                    String(location.id) !== fromLocationId ||
                    String(location.id) === toLocationId,
            ),
        [fromLocationId, sortedLocations, toLocationId],
    );

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        const payload = {
            from_location_id: Number(fromLocationId),
            to_location_id: Number(toLocationId),
            distance_km: Number(distanceKm),
            estimated_time_hours:
                estimatedTimeHours === '' ? null : Number(estimatedTimeHours),
            toll_cost: tollCost === '' ? null : Number(tollCost),
            notes: notes || null,
        };

        if (isEdit && id) {
            router.put(`/teacher/templates/land-routes/${id}`, payload);
            return;
        }

        router.post('/teacher/templates/land-routes', payload);
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
                <div className="grid gap-5 md:grid-cols-2">
                    <div>
                        <label className={labelClass}>No lokācijas *</label>
                        <select
                            value={fromLocationId}
                            onChange={(event) => setFromLocationId(event.target.value)}
                            required
                            className={inputClass}
                        >
                            <option value="">Izvēlieties sākumpunktu</option>
                            {fromLocationOptions.map((location) => (
                                <option key={location.id} value={location.id}>
                                    {formatLocationOptionLabel(location)}
                                </option>
                            ))}
                        </select>
                        <p className={helperClass}>
                            Sākumpunkts un galapunkts nevar būt viena un tā pati
                            lokācija.
                        </p>
                        {errors.from_location_id ? (
                            <FieldError error={errors.from_location_id} />
                        ) : null}
                    </div>

                    <div>
                        <label className={labelClass}>Uz lokāciju *</label>
                        <select
                            value={toLocationId}
                            onChange={(event) => setToLocationId(event.target.value)}
                            required
                            className={inputClass}
                        >
                            <option value="">Izvēlieties galapunktu</option>
                            {toLocationOptions.map((location) => (
                                <option key={location.id} value={location.id}>
                                    {formatLocationOptionLabel(location)}
                                </option>
                            ))}
                        </select>
                        {errors.to_location_id ? (
                            <FieldError error={errors.to_location_id} />
                        ) : null}
                    </div>
                </div>

                <div className="grid gap-5 md:grid-cols-3">
                    <div>
                        <label className={labelClass}>Attālums (km) *</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            required
                            value={distanceKm}
                            onChange={(event) => setDistanceKm(event.target.value)}
                            className={inputClass}
                            placeholder="Piemēram, 220"
                        />
                        {errors.distance_km ? (
                            <FieldError error={errors.distance_km} />
                        ) : null}
                    </div>

                    <div>
                        <label className={labelClass}>Novērtētais laiks (h)</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={estimatedTimeHours}
                            onChange={(event) =>
                                setEstimatedTimeHours(event.target.value)
                            }
                            className={inputClass}
                            placeholder="Piemēram, 3.2"
                        />
                        {errors.estimated_time_hours ? (
                            <FieldError error={errors.estimated_time_hours} />
                        ) : null}
                    </div>

                    <div>
                        <label className={labelClass}>Ceļu nodevas</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={tollCost}
                            onChange={(event) => setTollCost(event.target.value)}
                            className={inputClass}
                            placeholder="Piemēram, 12.50"
                        />
                        {errors.toll_cost ? <FieldError error={errors.toll_cost} /> : null}
                    </div>
                </div>

                <div>
                    <label className={labelClass}>Piezīmes</label>
                    <textarea
                        rows={5}
                        value={notes}
                        onChange={(event) => setNotes(event.target.value)}
                        className={inputClass}
                        placeholder="Papildu informācija par maršrutu."
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
