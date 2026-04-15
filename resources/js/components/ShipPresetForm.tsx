import { useState } from 'react';
import { router } from '@inertiajs/react';

type Props = {
    submitLabel?: string;
    initialData?: {
        name?: string;
        cargo_type?: string;
        capacity_containers?: string | number;
        capacity_tons?: string | number;
        draft_m?: string | number;
        fuel_consumption_per_hour?: string | number;
        speed_kmh?: string | number;
        loading_capacity_containers_per_hour?: string | number;
        loading_capacity_tons_per_hour?: string | number;
        notes?: string;
    };
    isEdit?: boolean;
    id?: number;
};

export default function ShipPresetForm({
    submitLabel = 'Saglabāt',
    initialData = {},
    isEdit = false,
    id,
}: Props) {
    const [name, setName] = useState(initialData.name || '');
    const [cargoType, setCargoType] = useState(initialData.cargo_type || '');
    const [capacityContainers, setCapacityContainers] = useState(
        String(initialData.capacity_containers ?? '')
    );
    const [capacityTons, setCapacityTons] = useState(
        String(initialData.capacity_tons ?? '')
    );
    const [draft, setDraft] = useState(String(initialData.draft_m ?? ''));
    const [fuelConsumption, setFuelConsumption] = useState(
        String(initialData.fuel_consumption_per_hour ?? '')
    );
    const [speedKmh, setSpeedKmh] = useState(String(initialData.speed_kmh ?? ''));
    const [loadingContainers, setLoadingContainers] = useState(
        String(initialData.loading_capacity_containers_per_hour ?? '')
    );
    const [loadingTons, setLoadingTons] = useState(
        String(initialData.loading_capacity_tons_per_hour ?? '')
    );
    const [notes, setNotes] = useState(initialData.notes || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            name,
            cargo_type: cargoType || null,
            capacity_containers:
                capacityContainers === '' ? null : Number(capacityContainers),
            capacity_tons: capacityTons === '' ? null : Number(capacityTons),
            draft_m: draft === '' ? null : Number(draft),
            fuel_consumption_per_hour:
                fuelConsumption === '' ? null : Number(fuelConsumption),
            speed_kmh: speedKmh === '' ? null : Number(speedKmh),
            loading_capacity_containers_per_hour:
                loadingContainers === '' ? null : Number(loadingContainers),
            loading_capacity_tons_per_hour:
                loadingTons === '' ? null : Number(loadingTons),
            notes,
        };

        if (isEdit && id) {
            router.put(`/teacher/templates/ships/${id}`, payload);
        } else {
            router.post('/teacher/templates/ships', payload);
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
                    <label className={labelClass}>Nosaukums *</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className={inputClass}
                        placeholder="Piemēram, Baltic Carrier"
                    />
                </div>

                <div>
                    <label className={labelClass}>Kravas tips</label>
                    <select
                        value={cargoType}
                        onChange={(e) => setCargoType(e.target.value)}
                        className={inputClass}
                    >
                        <option value="">Izvēlieties</option>
                        <option value="container">Konteineri</option>
                        <option value="bulk">Beramkrava</option>
                        <option value="general">Vispārējā krava</option>
                    </select>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                    <div>
                        <label className={labelClass}>Kapacitāte (konteineri)</label>
                        <input
                            type="number"
                            min="0"
                            value={capacityContainers}
                            onChange={(e) => setCapacityContainers(e.target.value)}
                            className={inputClass}
                            placeholder="Piemēram, 500"
                        />
                    </div>

                    <div>
                        <label className={labelClass}>Kapacitāte (tonnas)</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={capacityTons}
                            onChange={(e) => setCapacityTons(e.target.value)}
                            className={inputClass}
                            placeholder="Piemēram, 10000"
                        />
                    </div>
                </div>

                <div className="grid gap-5 md:grid-cols-3">
                    <div>
                        <label className={labelClass}>Iegrimums (m)</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            className={inputClass}
                            placeholder="Piemēram, 7.20"
                        />
                    </div>

                    <div>
                        <label className={labelClass}>Degvielas patēriņš / h</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={fuelConsumption}
                            onChange={(e) => setFuelConsumption(e.target.value)}
                            className={inputClass}
                            placeholder="Piemēram, 120"
                        />
                    </div>

                    <div>
                        <label className={labelClass}>Ātrums (km/h)</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={speedKmh}
                            onChange={(e) => setSpeedKmh(e.target.value)}
                            className={inputClass}
                            placeholder="Piemēram, 35"
                        />
                    </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                    <div>
                        <label className={labelClass}>
                            Iekraušanas kapacitāte (konteineri/h)
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={loadingContainers}
                            onChange={(e) => setLoadingContainers(e.target.value)}
                            className={inputClass}
                            placeholder="Piemēram, 50"
                        />
                    </div>

                    <div>
                        <label className={labelClass}>
                            Iekraušanas kapacitāte (t/h)
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={loadingTons}
                            onChange={(e) => setLoadingTons(e.target.value)}
                            className={inputClass}
                            placeholder="Piemēram, 900"
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
                        placeholder="Papildu informācija par kuģi, izmantošanas nosacījumiem vai ierobežojumiem."
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