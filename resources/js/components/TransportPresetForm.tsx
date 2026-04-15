import { useState } from 'react';
import { router } from '@inertiajs/react';

type Props = {
    submitLabel?: string;
    initialData?: {
        name?: string;
        type?: string;
        description?: string;
        capacity?: string;
        temperature_support?: string;
        capacity_containers?: string | number;
        capacity_tons?: string | number;
        avg_speed_kmh?: string | number;
        cost_per_km?: string | number;
        fuel_consumption_per_100km?: string | number;
        max_range_km?: string | number;
        loading_time_minutes?: string | number;
        unloading_time_minutes?: string | number;
    };
    isEdit?: boolean;
    id?: number;
};

export default function TransportPresetForm({
    submitLabel = 'Saglabāt',
    initialData = {},
    isEdit = false,
    id,
}: Props) {
    const [name, setName] = useState(initialData.name || '');
    const [type, setType] = useState(initialData.type || '');
    const [description, setDescription] = useState(initialData.description || '');
    const [capacity, setCapacity] = useState(initialData.capacity || '');
    const [temperatureSupport, setTemperatureSupport] = useState(
        initialData.temperature_support || ''
    );

    const [capacityContainers, setCapacityContainers] = useState(
        String(initialData.capacity_containers ?? '')
    );
    const [capacityTons, setCapacityTons] = useState(
        String(initialData.capacity_tons ?? '')
    );
    const [avgSpeedKmh, setAvgSpeedKmh] = useState(
        String(initialData.avg_speed_kmh ?? '')
    );
    const [costPerKm, setCostPerKm] = useState(
        String(initialData.cost_per_km ?? '')
    );
    const [fuelConsumptionPer100km, setFuelConsumptionPer100km] = useState(
        String(initialData.fuel_consumption_per_100km ?? '')
    );
    const [maxRangeKm, setMaxRangeKm] = useState(
        String(initialData.max_range_km ?? '')
    );
    const [loadingTimeMinutes, setLoadingTimeMinutes] = useState(
        String(initialData.loading_time_minutes ?? '')
    );
    const [unloadingTimeMinutes, setUnloadingTimeMinutes] = useState(
        String(initialData.unloading_time_minutes ?? '')
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            name,
            type: type || null,
            description,
            capacity,
            temperature_support: temperatureSupport,

            capacity_containers:
                capacityContainers === '' ? null : Number(capacityContainers),
            capacity_tons: capacityTons === '' ? null : Number(capacityTons),
            avg_speed_kmh: avgSpeedKmh === '' ? null : Number(avgSpeedKmh),
            cost_per_km: costPerKm === '' ? null : Number(costPerKm),
            fuel_consumption_per_100km:
                fuelConsumptionPer100km === '' ? null : Number(fuelConsumptionPer100km),
            max_range_km: maxRangeKm === '' ? null : Number(maxRangeKm),
            loading_time_minutes:
                loadingTimeMinutes === '' ? null : Number(loadingTimeMinutes),
            unloading_time_minutes:
                unloadingTimeMinutes === '' ? null : Number(unloadingTimeMinutes),
        };

        if (isEdit && id) {
            router.put(`/teacher/templates/transport/${id}`, payload);
        } else {
            router.post('/teacher/templates/transport', payload);
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
                        placeholder="Piemēram, Standarta kravas auto"
                    />
                </div>

                <div>
                    <label className={labelClass}>Transporta tips</label>
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className={inputClass}
                    >
                        <option value="">Izvēlieties</option>
                        <option value="truck">Kravas auto</option>
                        <option value="train">Vilciens</option>
                        <option value="van">Furgons</option>
                        <option value="tank_truck">Cisterna</option>
                        <option value="reefer_truck">Refrižerators</option>
                    </select>
                </div>

                <div>
                    <label className={labelClass}>Apraksts</label>
                    <textarea
                        rows={5}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className={inputClass}
                        placeholder="Aprakstiet, kādam kravas tipam šis transports paredzēts."
                    />
                </div>

                <div>
                    <label className={labelClass}>Brīvais ietilpības apraksts</label>
                    <input
                        type="text"
                        value={capacity}
                        onChange={(e) => setCapacity(e.target.value)}
                        className={inputClass}
                        placeholder="Piemēram, 24 paletes / 18t"
                    />
                </div>

                <div>
                    <label className={labelClass}>Temperatūras režīms</label>
                    <input
                        type="text"
                        value={temperatureSupport}
                        onChange={(e) => setTemperatureSupport(e.target.value)}
                        className={inputClass}
                        placeholder="Piemēram, +2°C līdz +8°C"
                    />
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
                            placeholder="Piemēram, 1"
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
                            placeholder="Piemēram, 18"
                        />
                    </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                    <div>
                        <label className={labelClass}>Vidējais ātrums (km/h)</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={avgSpeedKmh}
                            onChange={(e) => setAvgSpeedKmh(e.target.value)}
                            className={inputClass}
                            placeholder="Piemēram, 70"
                        />
                    </div>

                    <div>
                        <label className={labelClass}>Izmaksas uz km</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={costPerKm}
                            onChange={(e) => setCostPerKm(e.target.value)}
                            className={inputClass}
                            placeholder="Piemēram, 1.20"
                        />
                    </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                    <div>
                        <label className={labelClass}>Degvielas patēriņš uz 100 km</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={fuelConsumptionPer100km}
                            onChange={(e) => setFuelConsumptionPer100km(e.target.value)}
                            className={inputClass}
                            placeholder="Piemēram, 28"
                        />
                    </div>

                    <div>
                        <label className={labelClass}>Maksimālais attālums bez uzpildes (km)</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={maxRangeKm}
                            onChange={(e) => setMaxRangeKm(e.target.value)}
                            className={inputClass}
                            placeholder="Piemēram, 900"
                        />
                    </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                    <div>
                        <label className={labelClass}>Iekraušanas laiks (min)</label>
                        <input
                            type="number"
                            min="0"
                            value={loadingTimeMinutes}
                            onChange={(e) => setLoadingTimeMinutes(e.target.value)}
                            className={inputClass}
                            placeholder="Piemēram, 20"
                        />
                    </div>

                    <div>
                        <label className={labelClass}>Izkraušanas laiks (min)</label>
                        <input
                            type="number"
                            min="0"
                            value={unloadingTimeMinutes}
                            onChange={(e) => setUnloadingTimeMinutes(e.target.value)}
                            className={inputClass}
                            placeholder="Piemēram, 20"
                        />
                    </div>
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