import { useState } from 'react';
import { router } from '@inertiajs/react';

type Props = {
    submitLabel?: string;
    initialData?: {
        name?: string;
        country?: string;
        max_draft_m?: string | number;
        city_distance_km?: string | number;
        loading_rate_containers_per_hour?: string | number;
        loading_rate_tons_per_hour?: string | number;
        notes?: string;
    };
    isEdit?: boolean;
    id?: number;
};

export default function PortPresetForm({
    submitLabel = 'Saglabāt',
    initialData = {},
    isEdit = false,
    id,
}: Props) {
    const [name, setName] = useState(initialData.name || '');
    const [country, setCountry] = useState(initialData.country || '');
    const [maxDraft, setMaxDraft] = useState(String(initialData.max_draft_m ?? ''));
    const [cityDistanceKm, setCityDistanceKm] = useState(
        String(initialData.city_distance_km ?? '')
    );
    const [loadingRateContainers, setLoadingRateContainers] = useState(
        String(initialData.loading_rate_containers_per_hour ?? '')
    );
    const [loadingRateTons, setLoadingRateTons] = useState(
        String(initialData.loading_rate_tons_per_hour ?? '')
    );
    const [notes, setNotes] = useState(initialData.notes || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            name,
            country,
            max_draft_m: maxDraft === '' ? null : Number(maxDraft),
            city_distance_km: cityDistanceKm === '' ? null : Number(cityDistanceKm),
            loading_rate_containers_per_hour:
                loadingRateContainers === '' ? null : Number(loadingRateContainers),
            loading_rate_tons_per_hour:
                loadingRateTons === '' ? null : Number(loadingRateTons),
            notes,
        };

        if (isEdit && id) {
            router.put(`/teacher/templates/ports/${id}`, payload);
        } else {
            router.post('/teacher/templates/ports', payload);
        }
    };

    const inputClass =
        'mt-2 w-full rounded-xl border border-[#d5dbd6] bg-white px-4 py-3 text-[14px] text-[#162118] outline-none transition placeholder:text-[#94a197] focus:border-[#166a4d]';

    const labelClass = 'text-[14px] font-medium text-[#182219]';

    return (
        <form
            onSubmit={handleSubmit}
            className="mt-6 max-w-4xl rounded-2xl border border-[#d9ded9] bg-white p-6 shadow-sm"
        >
            <div className="grid gap-5">
                <div>
                    <label className={labelClass}>Nosaukums *</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className={inputClass}
                        placeholder="Piemēram, Liepājas osta"
                    />
                </div>

                <div>
                    <label className={labelClass}>Valsts *</label>
                    <input
                        type="text"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        required
                        className={inputClass}
                        placeholder="Piemēram, Latvija"
                    />
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                    <div>
                        <label className={labelClass}>Maksimālais iegrimums (m)</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={maxDraft}
                            onChange={(e) => setMaxDraft(e.target.value)}
                            className={inputClass}
                            placeholder="Piemēram, 7.50"
                        />
                    </div>

                    <div>
                        <label className={labelClass}>Attālums līdz pilsētai (km)</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={cityDistanceKm}
                            onChange={(e) => setCityDistanceKm(e.target.value)}
                            className={inputClass}
                            placeholder="Piemēram, 12"
                        />
                    </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                    <div>
                        <label className={labelClass}>Iekraušanas ātrums (konteineri/h)</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={loadingRateContainers}
                            onChange={(e) => setLoadingRateContainers(e.target.value)}
                            className={inputClass}
                            placeholder="Piemēram, 45"
                        />
                    </div>

                    <div>
                        <label className={labelClass}>Iekraušanas ātrums (t/h)</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={loadingRateTons}
                            onChange={(e) => setLoadingRateTons(e.target.value)}
                            className={inputClass}
                            placeholder="Piemēram, 800"
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
                        placeholder="Papildu informācija par ostas ierobežojumiem vai specifiku."
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