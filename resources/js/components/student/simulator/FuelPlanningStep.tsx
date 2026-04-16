import { Fuel, MapPin, Plus, Tag, Trash2 } from 'lucide-react';
import { FuelStationItem } from './types';
import { EmptyBlock } from './ui';

type Props = {
    availableStations: FuelStationItem[];
    selectedStations: FuelStationItem[];
    loading: boolean;
    onAddStation: (stationId: number) => void;
    onRemoveStation: (stationId: number) => void;
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

function FuelMetaCard({
    station,
}: {
    station: FuelStationItem;
}) {
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
    availableStations,
    selectedStations,
    loading,
    onAddStation,
    onRemoveStation,
}: Props) {
    return (
        <section className="rounded-[28px] border border-[#d9ded9] bg-white p-6 shadow-sm">
            <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#d7e5db] bg-[#f6faf7] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#166a4d]">
                    <Fuel className="h-3.5 w-3.5" />
                    4. solis
                </div>

                <h2 className="mt-3 text-[24px] font-semibold tracking-tight text-[#182219]">
                    Degvielas plānošana
                </h2>

                <p className="mt-2 text-[15px] leading-7 text-[#5b6b61]">
                    Izvēlies degvielas pieturas, kuras plāno izmantot maršruta izpildes laikā.
                </p>
            </div>

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
                                                {station.name || 'Degvielas stacija'}
                                            </div>

                                            <div className="mt-2 inline-flex items-center gap-2 text-[14px] text-[#5b6b61]">
                                                <MapPin className="h-4 w-4 text-[#166a4d]" />
                                                {station.location_name || 'Atrašanās vieta nav norādīta'}
                                            </div>

                                            <FuelMetaCard station={station} />
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => onAddStation(station.id)}
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
                                            <div className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#7b887f]">
                                                Pietura {index + 1}
                                            </div>

                                            <div className="mt-2 text-[16px] font-semibold text-[#182219]">
                                                {station.name || 'Degvielas stacija'}
                                            </div>

                                            <div className="mt-2 inline-flex items-center gap-2 text-[14px] text-[#5b6b61]">
                                                <MapPin className="h-4 w-4 text-[#166a4d]" />
                                                {station.location_name || 'Atrašanās vieta nav norādīta'}
                                            </div>

                                            <FuelMetaCard station={station} />
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => onRemoveStation(station.id)}
                                            disabled={loading}
                                            className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-[#d9ded9] bg-white px-3 py-2 text-[14px] font-medium text-[#182219] transition hover:bg-[#f7f9f7] disabled:opacity-60"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            Dzēst
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <EmptyBlock text="Degvielas pieturas vēl nav izvēlētas." />
                        )}
                    </div>

                    <div className="mt-4 rounded-2xl border border-[#e4e9e4] bg-[#f8fbf9] p-4">
                        <div className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#7b887f]">
                            Kopsavilkums
                        </div>
                        <div className="mt-2 text-[15px] font-semibold text-[#182219]">
                            Izvēlētās pieturas: {selectedStations.length}
                        </div>
                    </div>

                    
                </div>
            </div>
        </section>
    );
}