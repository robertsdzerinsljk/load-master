import { useState } from 'react';
import { router } from '@inertiajs/react';

type LocationOption = {
    id: number;
    name: string;
    city?: string | null;
    country?: string | null;
};

type Props = {
    locations: LocationOption[];
    submitLabel?: string;
    initialData?: {
        location_id?: number | string;
        fuel_type?: string;
        price_per_liter?: number | string;
        notes?: string;
    };
    isEdit?: boolean;
    id?: number;
};

export default function FuelStationPresetForm({
    locations,
    submitLabel = 'Saglabāt',
    initialData = {},
    isEdit = false,
    id,
}: Props) {
    const [locationId, setLocationId] = useState(String(initialData.location_id ?? ''));
    const [fuelType, setFuelType] = useState(initialData.fuel_type ?? '');
    const [pricePerLiter, setPricePerLiter] = useState(
        String(initialData.price_per_liter ?? '')
    );
    const [notes, setNotes] = useState(initialData.notes ?? '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            location_id: Number(locationId),
            fuel_type: fuelType || null,
            price_per_liter: pricePerLiter === '' ? null : Number(pricePerLiter),
            notes: notes || null,
        };

        if (isEdit && id) {
            router.put(`/teacher/templates/fuel-stations/${id}`, payload);
        } else {
            router.post('/teacher/templates/fuel-stations', payload);
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
                    <label className={labelClass}>Uzpildes vieta *</label>
                    <select
                        value={locationId}
                        onChange={(e) => setLocationId(e.target.value)}
                        required
                        className={inputClass}
                    >
                        <option value="">Izvēlieties lokāciju</option>
                        {locations.map((location) => (
                            <option key={location.id} value={location.id}>
                                {location.name}
                                {location.city ? ` (${location.city})` : ''}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className={labelClass}>Degvielas tips</label>
                    <select
                        value={fuelType}
                        onChange={(e) => setFuelType(e.target.value)}
                        className={inputClass}
                    >
                        <option value="">Izvēlieties</option>
                        <option value="diesel">Dīzelis</option>
                        <option value="petrol">Benzīns</option>
                        <option value="lng">LNG</option>
                        <option value="electric">Elektrība</option>
                    </select>
                </div>

                <div>
                    <label className={labelClass}>Cena par litru</label>
                    <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={pricePerLiter}
                        onChange={(e) => setPricePerLiter(e.target.value)}
                        className={inputClass}
                        placeholder="Piemēram, 1.68"
                    />
                </div>

                <div>
                    <label className={labelClass}>Piezīmes</label>
                    <textarea
                        rows={5}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className={inputClass}
                        placeholder="Papildu informācija par uzpildes vietu."
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