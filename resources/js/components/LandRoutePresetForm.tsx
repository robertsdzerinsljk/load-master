import { useState } from 'react';
import { router } from '@inertiajs/react';

type LocationOption = {
    id: number;
    name: string;
    type?: string | null;
    city?: string | null;
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
    const [fromLocationId, setFromLocationId] = useState(
        String(initialData.from_location_id ?? '')
    );
    const [toLocationId, setToLocationId] = useState(
        String(initialData.to_location_id ?? '')
    );
    const [distanceKm, setDistanceKm] = useState(
        String(initialData.distance_km ?? '')
    );
    const [estimatedTimeHours, setEstimatedTimeHours] = useState(
        String(initialData.estimated_time_hours ?? '')
    );
    const [tollCost, setTollCost] = useState(
        String(initialData.toll_cost ?? '')
    );
    const [notes, setNotes] = useState(initialData.notes ?? '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

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
        } else {
            router.post('/teacher/templates/land-routes', payload);
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
                <div className="grid gap-5 md:grid-cols-2">
                    <div>
                        <label className={labelClass}>No lokācijas *</label>
                        <select
                            value={fromLocationId}
                            onChange={(e) => setFromLocationId(e.target.value)}
                            required
                            className={inputClass}
                        >
                            <option value="">Izvēlieties sākumpunktu</option>
                            {locations.map((location) => (
                                <option key={location.id} value={location.id}>
                                    {location.name}
                                    {location.city ? ` (${location.city})` : ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className={labelClass}>Uz lokāciju *</label>
                        <select
                            value={toLocationId}
                            onChange={(e) => setToLocationId(e.target.value)}
                            required
                            className={inputClass}
                        >
                            <option value="">Izvēlieties galapunktu</option>
                            {locations.map((location) => (
                                <option key={location.id} value={location.id}>
                                    {location.name}
                                    {location.city ? ` (${location.city})` : ''}
                                </option>
                            ))}
                        </select>
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
                            onChange={(e) => setDistanceKm(e.target.value)}
                            className={inputClass}
                            placeholder="Piemēram, 220"
                        />
                    </div>

                    <div>
                        <label className={labelClass}>Novērtētais laiks (h)</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={estimatedTimeHours}
                            onChange={(e) => setEstimatedTimeHours(e.target.value)}
                            className={inputClass}
                            placeholder="Piemēram, 3.2"
                        />
                    </div>

                    <div>
                        <label className={labelClass}>Ceļu nodevas</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={tollCost}
                            onChange={(e) => setTollCost(e.target.value)}
                            className={inputClass}
                            placeholder="Piemēram, 12.50"
                        />
                    </div>
                </div>

                <div>
                    <label className={labelClass}>Piezīmes</label>
                    <textarea
                        rows={5}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className={inputClass}
                        placeholder="Papildu informācija par maršrutu."
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